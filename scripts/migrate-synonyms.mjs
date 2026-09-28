#!/usr/bin/env node
/**
 * Rewrite versioned doc URLs in data/synonyms.json from one APEX release to another.
 *
 * Only keys under the "doc" section that contain "/apex/<old>/" are rewritten,
 * e.g. .../apex/24.2/aeapi/APEX_MAIL.html -> .../apex/26.1/aeapi/APEX_MAIL.html
 *
 * Usage:
 *   node scripts/migrate-synonyms.mjs --from=24.2 --to=26.1 [--file=data/synonyms.json]
 */

import { readFile, writeFile } from "node:fs/promises";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : ["_", a];
  }),
);

if (args.help) {
  console.log(`Usage: node scripts/migrate-synonyms.mjs --from=24.2 --to=26.1 [--file=data/synonyms.json]`);
  process.exit(0);
}

const from = String(args.from ?? "").trim();
const to = String(args.to ?? "").trim();
const file = String(args.file ?? "data/synonyms.json");

if (!/^\d+\.\d+$/.test(from) || !/^\d+\.\d+$/.test(to)) {
  console.error("Missing/invalid --from/--to. Expected e.g. --from=24.2 --to=26.1");
  process.exit(1);
}

const raw = await readFile(file, "utf8");
const data = JSON.parse(raw);
if (!data.doc || typeof data.doc !== "object") {
  console.error(`No "doc" section found in ${file}`);
  process.exit(1);
}

let migrated = 0;
const next = {};
for (const [key, value] of Object.entries(data.doc)) {
  if (key.includes(`/apex/${from}/`)) {
    next[key.replace(`/apex/${from}/`, `/apex/${to}/`)] = value;
    migrated++;
  } else {
    next[key] = value;
  }
}
data.doc = next;
await writeFile(file, JSON.stringify(data, null, 2) + "\n");
console.log(`rewrote ${migrated} doc synonym URL(s) ${from} -> ${to} in ${file}`);
