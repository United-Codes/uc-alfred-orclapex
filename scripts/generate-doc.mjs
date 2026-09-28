#!/usr/bin/env node
/**
 * Rebuild data/doc.json for a given APEX version from the published
 * Oracle Help Center pages (no database required).
 *
 * Sources:
 *   PL/SQL  - https://docs.oracle.com/en/database/oracle/apex/<VER>/aeapi/toc.js
 *   JS      - https://docs.oracle.com/en/database/oracle/apex/<VER>/aexjs/index.html (left nav)
 *   Preface - https://docs.oracle.com/en/database/oracle/apex/<VER>/aeapi/preface.html
 *             (only the "Conventions" section, to match the legacy rag_content extract
 *              which surfaced a single `Conventions` row for preface.html)
 *
 * Output format mirrors the legacy SQL spool (SET SQLFORMAT JSON) shape:
 *   { "results": [ { "items": [ ... ] } ] }
 *   PL/SQL chapter rows:      { url, title, api_type, chapter }
 *   PL/SQL subprogram rows:   { url, title, api_type, chapter, parent_title }
 *   JS rows:                  { url, title, api_type }
 *
 * Usage:
 *   node scripts/generate-doc.mjs --version=26.1 [--out=data/doc.json]
 *   node scripts/generate-doc.mjs --help
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : ["_", a];
  }),
);

if (args.help) {
  console.log(`Usage: node scripts/generate-doc.mjs --version=<apex-version> [--out=<path>]

Examples:
  node scripts/generate-doc.mjs --version=26.1
  node scripts/generate-doc.mjs --version=26.1 --out=data/doc.json
`);
  process.exit(0);
}

const version = String(args.version ?? "").trim();
if (!version || !/^\d+\.\d+$/.test(version)) {
  console.error(
    "Missing/invalid --version. Expected e.g. --version=26.1",
  );
  process.exit(1);
}

const outPath = String(args.out ?? path.join("data", "doc.json"));
const AEAPI_BASE = `https://docs.oracle.com/en/database/oracle/apex/${version}/aeapi/`;
const AEXJS_BASE = `https://docs.oracle.com/en/database/oracle/apex/${version}/aexjs/`;

const stripTags = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const normTitle = (s) => s.replace(/^(\d+(?:\.\d+)?)\s+/, "$1 ");
const chapterOf = (s) => {
  const m = s.match(/^(\d+)(?:\.\d+)?\s/);
  return m ? Number(m[1]) : null;
};

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "uc-alfred-orclapex doc generator" },
  });
  if (!res.ok) {
    throw new Error(`GET ${url} -> HTTP ${res.status}`);
  }
  return await res.text();
}

function parseTocJs(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("toc.js: JSON object not found");
  return JSON.parse(raw.slice(start, end + 1));
}

function parseJsNav(html) {
  // Restrict to the JSDoc left nav so body cross-links don't pollute results.
  const navMatch = html.match(/<nav id="nav"[\s\S]*?<\/nav>/);
  const scope = navMatch ? navMatch[0] : html;
  const seen = new Map();
  for (const m of scope.matchAll(/<a href="([^"]+\.html)">([^<]+)<\/a>/g)) {
    const href = m[1];
    const title = m[2].trim();
    if (!href || !title || title === "Index") continue;
    if (href === "index.html") continue;
    if (!seen.has(title)) seen.set(title, href);
  }
  return [...seen.entries()].map(([title, href]) => ({ title, href }));
}

const tocRaw = await fetchText(`${AEAPI_BASE}toc.js`);
const toc = parseTocJs(tocRaw);
const topTopics = toc?.toc?.[0]?.topics ?? [];
if (!topTopics.length) throw new Error("toc.js: no topics found");

const SKIP_CHAPTERS = new Set([
  "Title and Copyright Information",
  "Preface",
  "Index",
]);

const items = [];

for (const tp of topTopics) {
  const title = normTitle(stripTags(tp.title ?? ""));
  if (!title || SKIP_CHAPTERS.has(title)) continue;
  if (/^JavaScript/i.test(title) && !/^\d/.test(title)) continue; // unnumbered JS pointer

  const file = String(tp.href ?? "").split("#")[0];
  if (!file) continue;
  const chapter = chapterOf(title);
  if (chapter == null) {
    console.warn(`skip (no chapter number): ${title}`);
    continue;
  }
  items.push({
    url: `${AEAPI_BASE}${file}`,
    title,
    api_type: "PL/SQL",
    chapter,
  });

  for (const sub of tp.topics ?? []) {
    const stitle = normTitle(stripTags(sub.title ?? ""));
    const sfile = String(sub.href ?? "").split("#")[0];
    if (!stitle || !sfile) continue;
    const schapter = chapterOf(stitle) ?? chapter;
    items.push({
      url: `${AEAPI_BASE}${sfile}`,
      title: stitle,
      api_type: "PL/SQL",
      chapter: schapter,
      parent_title: title,
    });
  }
}

// Legacy parity: rag_content surfaced a single "Conventions" row for preface.html.
items.push({
  url: `${AEAPI_BASE}preface.html`,
  title: "Conventions",
  api_type: "PL/SQL",
});

const jsHtml = await fetchText(`${AEXJS_BASE}index.html`);
const jsEntries = parseJsNav(jsHtml);
for (const { title, href } of jsEntries) {
  const file = href.split("#")[0];
  const displayTitle = title === "Non-namespace APIs" ? title : file.replace(/\.html$/, "");
  // JSDoc nav labels already equal filenames; keep the label, but fall back to filename.
  items.push({
    url: `${AEXJS_BASE}${file}`,
    title: displayTitle === "global" ? "Non-namespace APIs" : title,
    api_type: "JS",
  });
}

const payload = { results: [{ items }] };
await mkdir(path.dirname(outPath), { recursive: true });
// Sort by url for stable, diffable output regardless of source TOC order.
// (Same ordering as `normalize-data.mjs --all` applies to doc.json.)
payload.results[0].items.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n");

const plsql = items.filter((i) => i.api_type === "PL/SQL").length;
const js = items.filter((i) => i.api_type === "JS").length;
console.log(
  `wrote ${outPath}: ${items.length} items (${plsql} PL/SQL, ${js} JS) for APEX ${version}`,
);
