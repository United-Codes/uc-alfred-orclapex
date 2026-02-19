import alfy from "alfy";
import fuzzysort from "fuzzysort";
import { readFile } from "node:fs/promises";
import { FILES, RESULT_SIZE } from "./lib/constants.js";
import {
	getFuzzyOptions,
	prepareCssClassItems,
	prepareCssVarItems,
	prepareDocItems,
	prepareIconItems,
	prepareViewItems,
} from "./lib/core.js";

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

async function loadSynonyms() {
	return await readJsonFileCache(FILES.SYNONYMS);
}

export async function processDocItems(input) {
	const data = await readJsonFileCache(FILES.DOC);
	/**
	 * @typedef {Object} DocItems
	 * @property {string} url
	 * @property {string} title
	 * @property {string} api_type
	 * @property {number} chapter
	 * @property {string} parent_title
	 */

	/** @type {DocItems[]} */
	const docItems = prepareDocItems(
		data.results[0].items,
		(await loadSynonyms()).doc,
	);

	const results = fuzzysort.go(
		input,
		docItems,
		getFuzzyOptions(["title", "submatcher", "synonyms"]),
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
	const data = await readJsonFileCache(FILES.CSS_VARS);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 */

	/** @type {CssItem[]} */
	const cssItems = prepareCssVarItems(data.data);

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
	const data = await readJsonFileCache(FILES.CSS_CLASSES);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 * @property {string} category
	 */

	/** @type {CssItem[]} */
	const cssItems = prepareCssClassItems(
		data.data,
		(await loadSynonyms()).cssClasses,
	);

	const results = fuzzysort.go(
		input,
		cssItems,
		getFuzzyOptions(["name", "description", "category", "synonyms"]),
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
	const data = await readJsonFileCache(FILES.VIEWS);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} description
	 * @property {string} [parentView]
	 */

	/** @type {CssItem[]} */
	const viewItems = prepareViewItems(
		data.results[0].items,
		(await loadSynonyms()).views,
	);

	const results = fuzzysort.go(
		input,
		viewItems,
		getFuzzyOptions(["name", "description", "synonyms"]),
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
	const data = await readJsonFileCache(FILES.ICONS);

	/**
	 * @typedef {Object} CssItem
	 * @property {string} name
	 * @property {string} category
	 * @property {string} [search]
	 */

	/** @type {CssItem[]} */
	const iconItems = prepareIconItems(
		data.results[0].items,
		(await loadSynonyms()).icons,
	);

	const results = fuzzysort.go(
		input,
		iconItems,
		getFuzzyOptions(["name", "search", "synonyms"]),
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
	const data = await readJsonFileCache(FILES.WEBSITES);

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
	const data = await readJsonFileCache(FILES.HTML_SNIPPETS);

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
	const data = await readJsonFileCache(FILES.ICON_MODIFIERS);

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
	const data = await readJsonFileCache(FILES.SUBSTITUTIONS);

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

export async function processDgDomains(input) {
	const data = await readJsonFileCache(FILES.DATA_GENERATOR_DOMAINS);

	/**
	 * @typedef {Object} DGDomainItem
	 * @property {string} name
	 * @property {string} category
	 *  @property {string} datatype
	 */

	/** @type {DGDomainItem[]} */
	const subItems = data.results[0].items;
	const fuzzyOptions = getFuzzyOptions(["name", "description"]);
	const results = fuzzysort.go(input, subItems, fuzzyOptions);

	const items = results.map((el) => ({
		uid: el.obj.name,
		title: el.obj.name,
		subtitle: `${el.obj.category} | ${el.obj.datatype}`,
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
	items = items.concat(await processDgDomains(input));

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
	const data = await readJsonFileCache(FILES.APEX_API_192);

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
