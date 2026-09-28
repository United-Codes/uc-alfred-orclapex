#!/usr/bin/env node
/**
 * Normalize generated JSON data files so regeneration is diffable.
 *
 * What it does, deterministically:
 *   1. Sorts the item array (`results[0].items` spool shape or `data` shape).
 *   2. Pretty-prints with 2-space indent + trailing newline.
 *
 * Key order inside objects is left untouched (producers already emit keys
 * in a fixed order: SQL column order for spool files, fixed order in
 * generate-doc.mjs). Only row order and whitespace are normalized.
 *
 * Idempotent: running it twice yields byte-identical output.
 *
 * Usage:
 *   node scripts/normalize-data.mjs <file...> [--key=name|title|url]
 *   node scripts/normalize-data.mjs --all
 *
 * `--all` covers the generated files: doc, views, icons, dg-domains.
 * Default sort key per file is shown in SORT_KEYS; override with --key.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SORT_KEYS = {
  "doc.json": ["url"],
  "views.json": ["name"],
  "icons.json": ["name"],
  "data_generator_domains.json": ["name"],
  "substitutions.json": ["name"],
};

const GENERATED = Object.keys(SORT_KEYS);

function parseArgs(argv) {
  const out = { files: [], key: null, all: false, help: false };
  for (const a of argv) {
    if (a === "--all") out.all = true;
    else if (a === "--help") out.help = true;
    else if (a.startsWith("--key=")) out.key = a.slice("--key=".length);
    else if (a.startsWith("--")) throw new Error(`Unknown option: ${a}`);
    else out.files.push(a);
  }
  return out;
}

function getItems(doc) {
  if (Array.isArray(doc?.results?.[0]?.items)) {
    return { items: doc.results[0].items, label: "results[0].items" };
  }
  if (Array.isArray(doc?.data)) {
    return { items: doc.data, label: "data" };
  }
  return null;
}

function compareBy(keys) {
  return (a, b) => {
    for (const k of keys) {
      const av = a[k] ?? "";
      const bv = b[k] ?? "";
      if (av < bv) return -1;
      if (av > bv) return 1;
    }
    // Final tiebreak on full row so output is fully deterministic
    // even for duplicate sort keys.
    const as = JSON.stringify(a);
    const bs = JSON.stringify(b);
    return as < bs ? -1 : as > bs ? 1 : 0;
  };
}

async function normalize(file, keyOverride) {
  const raw = await readFile(file, "utf8");
  const doc = JSON.parse(raw);
  const found = getItems(doc);
  if (!found) {
    throw new Error(
      `${file}: no sortable array found (expected results[0].items or data)`,
    );
  }
  const keys = keyOverride
    ? [keyOverride]
    : (SORT_KEYS[path.basename(file)] ?? ["name", "title", "url"]);
  found.items.sort(compareBy(keys));
  await writeFile(file, JSON.stringify(doc, null, 2) + "\n");
  console.log(
    `${file}: sorted ${found.items.length} rows (${found.label}) by ${keys.join(",")}`,
  );
}

const args = parseArgs(process.argv.slice(2));

if (args.help || (!args.all && args.files.length === 0)) {
  console.log(`Usage: node scripts/normalize-data.mjs <file...> [--key=name|title|url]
       node scripts/normalize-data.mjs --all

Sorts item arrays and pretty-prints (2-space) for stable, diffable output.`);
  process.exit(args.help ? 0 : 1);
}

const files = args.all
  ? GENERATED.map((f) => path.join("data", f))
  : args.files;

for (const f of files) {
  await normalize(f, args.key);
}
