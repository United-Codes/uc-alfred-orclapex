#!/usr/bin/env node
/**
 * Check data/substitutions.json against the authoritative docs page
 * "Using Built-in Substitution Strings" for a given APEX version.
 *
 * Compares the section list of the published page with the curated names
 * in data/substitutions.json and reports gaps in either direction.
 *
 * Curation notes (deliberate deviations from the page):
 *   - "APP_AJAX_X01, ... APP_AJAX_X10" is stored as "APP_AJAX_X[01-10]".
 *   - "APP_REGION_STATIC_ID (Deprecated)" is stored without the suffix.
 *   - "SCHEMA OWNER" documents #FLOW_OWNER# / G_FLOW_SCHEMA_OWNER,
 *     stored as "FLOW_OWNER" (the usable substitution name).
 *   - "APP_TRANSLATION_ID" is a manual addition, absent from the page.
 *   - "Using REQUEST" / "About ..." entries are REQUEST subsections,
 *     not substitution strings, and are skipped.
 *
 * Usage:
 *   node scripts/check-substitutions.mjs [--version=26.1] [--file=data/substitutions.json]
 *
 * Exit code is 1 when the page lists strings missing from the data file.
 */

import { readFile } from "node:fs/promises";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : ["_", a];
  }),
);

if (args.help) {
  console.log(`Usage: node scripts/check-substitutions.mjs [--version=26.1] [--file=data/substitutions.json]`);
  process.exit(0);
}

const version = String(args.version ?? "26.1").trim();
const file = String(args.file ?? "data/substitutions.json");

if (!/^\d+\.\d+$/.test(version)) {
  console.error("Invalid --version. Expected e.g. --version=26.1");
  process.exit(1);
}

const url =
  `https://docs.oracle.com/en/database/oracle/apex/${version}/htmdb/using-available-built-in-substitution-strings.html`;

const res = await fetch(url, {
  headers: { "User-Agent": "uc-alfred-orclapex substitutions checker" },
});
if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
const html = await res.text();

const rawEntries = [
  ...html.matchAll(/<li class="ulchildlink"><a href="[^"]+">([^<]+)<\/a>/g),
].map((m) => m[1].trim());

if (!rawEntries.length) throw new Error("No substitution sections found on page");

/** Normalize a page entry into usable substitution names. */
function pageNames(entry) {
  if (entry === "Using REQUEST" || entry.startsWith("About ")) return [];
  if (entry === "APP_AJAX_X01, ... APP_AJAX_X10") return ["APP_AJAX_X[01-10]"];
  if (entry === "SCHEMA OWNER") return ["FLOW_OWNER"];
  return entry
    .split(",")
    .map((s) => s.trim().replace(/\s*\(.*\)$/, ""));
}

const pageSet = new Set(rawEntries.flatMap(pageNames));

const data = JSON.parse(await readFile(file, "utf8"));
const dataNames = (data.data ?? []).map((r) => r.name);
const dataSet = new Set(dataNames);

const missing = [...pageSet].filter((n) => !dataSet.has(n)).sort();
const extra = dataNames.filter((n) => !pageSet.has(n)).sort();

console.log(`docs page (${version}): ${pageSet.size} substitution strings`);
console.log(`data file (${file}): ${dataNames.length} entries`);

if (missing.length) {
  console.log(`\nMissing from data file (${missing.length}):`);
  for (const n of missing) console.log(`  - ${n}`);
} else {
  console.log("\nNo missing substitution strings.");
}

if (extra.length) {
  console.log(`\nIn data file but not on docs page (${extra.length}, curated extras kept):`);
  for (const n of extra) console.log(`  + ${n}`);
}

process.exit(missing.length ? 1 : 0);
