import { RESULT_SIZE } from "./constants.js";

export function getFuzzyOptions(keys) {
	return {
		keys,
		limit: RESULT_SIZE,
		all: true,
	};
}

export function prepareDocItems(items, synonyms = {}) {
	for (const item of items) {
		// add title twice for better matching of parent docuents
		item.submatcher = item.parent_title || item.title;
		item.parent_title = item.parent_title || "";

		if (synonyms[item.url]) {
			item.synonyms = synonyms[item.url].join(" ");
		}
	}
	return items;
}

export function prepareCssVarItems(items) {
	for (const item of items) {
		item.copyValue = `--${item.name}`;
	}
	return items;
}

export function prepareCssClassItems(items, synonyms = {}) {
	for (const item of items) {
		if (synonyms[item.name]) {
			item.synonyms = synonyms[item.name].join(" ");
		}
	}
	return items;
}

export function prepareViewItems(items, synonyms = {}) {
	for (const item of items) {
		if (synonyms[item.name]) {
			item.synonyms = synonyms[item.name].join(" ");
		}
	}
	return items;
}

export function prepareIconItems(items, synonyms = {}) {
	for (const item of items) {
		item.search = item.search || "";
		item.categoryText = item.category ? `Category: ${item.category}` : "";
		item.searchCriterias = item.search ? `Criterias: ${item.search}` : "";
		item.description =
			item.categoryText && item.searchCriterias
				? `${item.categoryText} | ${item.searchCriterias}`
				: item.categoryText || item.searchCriterias;

		if (synonyms[item.name]) {
			item.synonyms = synonyms[item.name].join(" ");
		}
	}
	return items;
}
