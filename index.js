import alfy from "alfy";
import fuzzysort from "fuzzysort";
import { readFile } from "node:fs/promises";
import yargsParser from "yargs-parser";

const FILE_PREFIX = "./data/";
const DOC_FILE = `${FILE_PREFIX}doc.json`;

async function readJsonFile(filePath) {
	try {
		const data = await readFile(filePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		// console.error("Error reading or parsing the JSON file:", error);
		alfy.error("Error reading or parsing the JSON file:", error);
		throw error;
	}
}

async function getDocItems() {
	const data = await readJsonFile(DOC_FILE);
	/**
	 * @typedef {Object} DocItems
	 * @property {string} url
	 * @property {string} title
	 * @property {string} api_type
	 * @property {number} chapter
	 * @property {string} parent_title
	 */

	/** @type {DocItems[]} */
	const docItems = data.results[0].items;

	for (const item of docItems) {
		// add title twice for better matching of parent docuents
		item.submatcher = item.parent_title || item.title;
		item.parent_title = item.parent_title || "";
	}

	return docItems;
}

async function main(args) {
	// alfy.log("args", args);
	// alfy.log("firstArg", firstArg);
	const input = alfy.input;

	const docItems = await getDocItems();

	const results = fuzzysort.go(input, docItems, {
		keys: ["title", "submatcher"],
		limit: 10,
	});

	const items = results.map((el) => ({
		uid: el.obj.url,
		title: el.obj.title,
		subtitle: el.obj.parent_title
			? `${el.obj.api_type} | ${el.obj.parent_title}`
			: el.obj.api_type,
		arg: el.obj.url,
	}));

	alfy.output(items);
}

const args = yargsParser(process.argv.slice(2));

await main(args);
