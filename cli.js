import { encode } from '@toon-format/toon';
import fuzzysort from "fuzzysort";
import { readFile } from "node:fs/promises";
import parseArgs from "yargs-parser";
import { FILES } from "./lib/constants.js";
import {
  getFuzzyOptions,
  prepareCssClassItems,
  prepareCssVarItems,
  prepareDocItems,
  prepareIconItems,
  prepareViewItems,
} from "./lib/core.js";

const args = parseArgs(process.argv.slice(2));
const { type, query } = args;

if (!type || !query) {
	console.error("Usage: node cli.js --type=<type> --query=<query>");
	process.exit(1);
}

async function readJsonFile(filePath) {
	try {
		const data = await readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		console.error("Error reading or parsing the JSON file:", error);
		process.exit(1);
	}
}

async function loadSynonyms() {
	return await readJsonFile(FILES.SYNONYMS);
}

async function search() {
	let items = [];
	let keys = [];

	const synonyms = await loadSynonyms();

	if (type === "doc") {
		const data = await readJsonFile(FILES.DOC);
		items = prepareDocItems(data.results[0].items, synonyms.doc);
		keys = ["title", "submatcher", "synonyms"];
	} else if (type === "css-classes") {
		const data = await readJsonFile(FILES.CSS_CLASSES);
		items = prepareCssClassItems(data.data, synonyms.cssClasses);
		keys = ["name", "description", "category", "synonyms"];
	} else if (type === "css-vars") {
		const data = await readJsonFile(FILES.CSS_VARS);
		items = prepareCssVarItems(data.data);
		keys = ["name", "description"];
	} else if (type === "views") {
		const data = await readJsonFile(FILES.VIEWS);
		items = prepareViewItems(data.results[0].items, synonyms.views);
		keys = ["name", "description", "synonyms"];
	} else if (type === "icons") {
		const data = await readJsonFile(FILES.ICONS);
		items = prepareIconItems(data.results[0].items, synonyms.icons);
		keys = ["name", "search", "synonyms"];
	} else {
		console.error(`Unknown type: ${type}`);
		process.exit(1);
	}


	const results = fuzzysort.go(query, items, getFuzzyOptions(keys));

  const hasSynonyms = results.some((r) => r.obj.synonyms);

	const cleanResults = results.map((r) => {
		const obj = { ...r.obj };
		delete obj.submatcher;
		delete obj.categoryText;
		delete obj.searchCriterias;
		delete obj.parent_title;

		if (type === "icons") {
			delete obj.description;
		}

    if (hasSynonyms && !obj.synonyms) {
      obj.synonyms = "";
    }

		return obj;
	});

  // only return first 15 results
  cleanResults.splice(15);

	// Output TOON for agent context
	console.log(encode({results: cleanResults}));
}

search();
