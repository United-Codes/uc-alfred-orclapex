import alfy from "alfy";
import fuzzysort from "fuzzysort";
import { readFile } from "node:fs/promises";

const FILE_PREFIX = "./data/";
const DOC_FILE = `${FILE_PREFIX}doc.json`;
const CSS_VARS_FILE = `${FILE_PREFIX}css-vars.json`;
const CSS_CLASSES_FILE = `${FILE_PREFIX}css-classes.json`;
const VIEWS_FILE = `${FILE_PREFIX}views.json`;
const ICONS_FILE = `${FILE_PREFIX}icons.json`;
const WEBSITES_FILE = `${FILE_PREFIX}websites.json`;
const HTML_SNIPPETS = `${FILE_PREFIX}html-snippets.json`;
const ICON_MODIFIERS = `${FILE_PREFIX}icon-modifiers.json`;
const SUBSTITUTIONS = `${FILE_PREFIX}substitutions.json`;
const APEX_API_192 = `${FILE_PREFIX}doc-192.json`;

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

	if (!data) {
		return [];
	}

	alfy.cache.set(key, data, {
		maxAge: 1000 * 60 * 60 * 24, // 24 hours
	});
	return data;
}

function getFuzzyOptions(keys) {
	return {
		keys,
		limit: RESULT_SIZE,
		all: true,
	};
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

	const results = fuzzysort.go(
		input,
		docItems,
		getFuzzyOptions(["title", "submatcher"]),
	);

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

export async function processCssVarItems(input) {
	const data = await readJsonFileCache(CSS_VARS_FILE);

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

	const results = fuzzysort.go(
		input,
		cssItems,
		getFuzzyOptions(["name", "description"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.copyValue,
	}));

	return items;
}

export async function processCssClassItems(input) {
	const data = await readJsonFileCache(CSS_CLASSES_FILE);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 * @property {string} category
	 */

	/** @type {CssItem[]} */
	const cssItems = data.data;

	const results = fuzzysort.go(
		input,
		cssItems,
		getFuzzyOptions(["name", "description", "category"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.category
			? `${el.obj.description} | ${el.obj.category}`
			: el.obj.description,
		arg: el.obj.name,
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

	const results = fuzzysort.go(
		input,
		viewItems,
		getFuzzyOptions(["name", "description"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: `${el.obj.description}${
			el.obj.parentView ? ` | parent: ${el.obj.parentView}` : ""
		}`,
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

	const results = fuzzysort.go(
		input,
		iconItems,
		getFuzzyOptions(["name", "search"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.name,
	}));

	return items;
}

export async function processWebsiteItems(input) {
	const data = await readJsonFileCache(WEBSITES_FILE);

	/**
	 * @typedef {Object} WebsiteItem
	 * @property {string} name
	 * @property {string} url
	 */

	/** @type {WebsiteItem[]} */
	const webItems = data.data;
	const results = fuzzysort.go(
		input,
		webItems,
		getFuzzyOptions(["name", "url"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.url,
		title: el.obj.name,
		subtitle: el.obj.url,
		arg: el.obj.url,
	}));

	return items;
}

export async function processHTMLSnippets(input) {
	const data = await readJsonFileCache(HTML_SNIPPETS);

	/**
	 * @typedef {Object} HTMLsnippetItem
	 * @property {string} name
	 * @property {string} snippet
	 */

	/** @type {HTMLsnippetItem[]} */
	const htmlSnipItems = data.data;
	const results = fuzzysort.go(
		input,
		htmlSnipItems,
		getFuzzyOptions(["name", "snippet"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.snippet,
		arg: el.obj.snippet,
	}));

	return items;
}

export async function processIconModifierSnippets(input) {
	const data = await readJsonFileCache(ICON_MODIFIERS);

	/**
	 * @typedef {Object} IconModItem
	 * @property {string} name
	 * @property {string} description
	 */

	/** @type {IconModItem[]} */
	const htmlSnipItems = data.data;
	const results = fuzzysort.go(
		input,
		htmlSnipItems,
		getFuzzyOptions(["name", "description"]),
	);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.name,
	}));

	return items;
}

export async function processSubstitutionItems(input) {
	const data = await readJsonFileCache(SUBSTITUTIONS);

	/**
	 * @typedef {Object} SubstitutionItem
	 * @property {string} name
	 * @property {string} description
	 */

	/** @type {SubstitutionItem[]} */
	const subItems = data.data;
	const fuzzyOptions = getFuzzyOptions(["name", "description"]);
	const results = fuzzysort.go(input, subItems, fuzzyOptions);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: el.obj.description,
		arg: el.obj.name,
	}));

	return items;
}

export async function processAll(input) {
	let items = [];

	items = items.concat(await processDocItems(input));
	items = items.concat(await processCssVarItems(input));
	items = items.concat(await processCssClassItems(input));
	items = items.concat(await processViewItems(input));
	items = items.concat(await processIconItems(input));
	items = items.concat(await processWebsiteItems(input));
	items = items.concat(await processHTMLSnippets(input));
	items = items.concat(await processIconModifierSnippets(input));
	items = items.concat(await processSubstitutionItems(input));

	const results = fuzzysort.go(input, items, {
		keys: ["title", "subtitle"],
		limit: RESULT_SIZE,
	});

	items = results.map((el) => ({
		uid: el.obj.uid,
		title: el.obj.title,
		subtitle: el.obj.subtitle,
		arg: el.obj.arg,
	}));

	return items;
}

export async function processApexAPI192Items(input) {
	const data = await readJsonFileCache(APEX_API_192);

	/**
	 * @typedef {Object} Doc192Items
	 * @property {string} url
	 * @property {string} title
	 */

	/** @type {SubstitutionItem[]} */
	const subItems = data.data;
	const fuzzyOptions = getFuzzyOptions(["title"]);
	const results = fuzzysort.go(input, subItems, fuzzyOptions);

	const items = results.map((el) => ({
		uid: el.obj.title,
		title: el.obj.title,
		arg: el.obj.url,
	}));

	return items;
}
