import alfy from "alfy";
import fuzzysort from "fuzzysort";
import { readFile } from "node:fs/promises";

const FILE_PREFIX = "./data/";
const DOC_FILE = `${FILE_PREFIX}doc.json`;
const CSS_FILE = `${FILE_PREFIX}css-vars.json`;
const VIEWS_FILE = `${FILE_PREFIX}views.json`;
const ICONS_FILE = `${FILE_PREFIX}icons.json`;

const RESULT_SIZE = 50;

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

async function readJsonFileCache(key) {
	if (alfy.cache.has(key)) {
		return alfy.cache.get(key);
	}

	const data = await readJsonFile(key);
	alfy.cache.set(key, data, {
		maxAge: 1000 * 60 * 60 * 24, // 24 hours
	});
	return data;
}

export async function processDocItems(input) {
	const data = await readJsonFileCache(DOC_FILE);
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

	const results = fuzzysort.go(input, docItems, {
		keys: ["title", "submatcher"],
		limit: RESULT_SIZE,
	});

	const items = results.map((el) => ({
		uid: el.obj.url,
		title: el.obj.title,
		subtitle: el.obj.parent_title
			? `${el.obj.api_type} | ${el.obj.parent_title}`
			: el.obj.api_type,
		arg: el.obj.url,
	}));

	return items;
}

export async function processCssItems(input) {
	const data = await readJsonFileCache(CSS_FILE);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 */

	/** @type {CssItem[]} */
	const cssItems = data.data;

	for (const item of cssItems) {
		item.copyValue = `--${item.name}`;
	}

	const results = fuzzysort.go(input, cssItems, {
		keys: ["name", "description"],
		limit: RESULT_SIZE,
	});

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.copyValue,
	}));

	return items;
}

export async function processViewItems(input) {
	const data = await readJsonFileCache(VIEWS_FILE);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 * @property {string} [parentView]
	 */

	/** @type {CssItem[]} */
	const viewItems = data.results[0].items;

	const results = fuzzysort.go(input, viewItems, {
		keys: ["name", "description"],
		limit: RESULT_SIZE,
	});

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: `${el.obj.description}${el.obj.parentView ? ` | parent: ${el.obj.parentView}` : ""}`,
		arg: el.obj.name,
	}));

	return items;
}

export async function processIconItems(input) {
	const data = await readJsonFileCache(ICONS_FILE);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} category
	 * @property {string} [search]
	 */

	/** @type {CssItem[]} */
	const iconItems = data.results[0].items;

	for (const item of iconItems) {
		item.search = item.search || "";
		item.categoryText = item.category ? `Category: ${item.category}` : "";
		item.searchCriterias = item.search ? `Criterias: ${item.search}` : "";
		item.description =
			item.categoryText && item.searchCriterias
				? `${item.categoryText} | ${item.searchCriterias}`
				: item.categoryText || item.searchCriterias;
	}

	const results = fuzzysort.go(input, iconItems, {
		keys: ["name", "search"],
		limit: RESULT_SIZE,
	});

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.name,
	}));

	return items;
}
