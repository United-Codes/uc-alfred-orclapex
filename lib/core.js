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
		} else {
			// propagate package-level synonyms (keyed by package overview URL
			// like .../aeapi/APEX_MAIL.html) to every procedure/function page
			// of that package, matched via parent_title (e.g. "44 APEX_MAIL")
			const pkgMatch = item.parent_title.match(/\b(APEX_[A-Z0-9_$#]+)\b/);
			if (pkgMatch) {
				const pkgKey = Object.keys(synonyms).find((url) =>
					url.endsWith(`/${pkgMatch[1]}.html`),
				);
				if (pkgKey) {
					item.synonyms = synonyms[pkgKey].join(" ");
				}
			}
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

/**
 * Look up synonyms for a CSS class name. Falls back from exact matches to
 * base-name matches so short synonym keys keep working for parameterized
 * class names (e.g. "col-xxs" matches "col-xxs-[1-12]") and state variants
 * (e.g. "u-danger" matches "u-danger-text", "u-danger-bg", "u-danger-border").
 */
function lookupCssClassSynonyms(synonyms, name) {
	if (synonyms[name]) {
		return synonyms[name];
	}
	const base = name
		.replace(/-(text|bg|border)$/, "")
		.replace(/-\[.*\]$/, "");
	if (base !== name && synonyms[base]) {
		return synonyms[base];
	}
	return undefined;
}

export function prepareCssClassItems(items, synonyms = {}) {
	for (const item of items) {
		const words = lookupCssClassSynonyms(synonyms, item.name);
		if (words) {
			item.synonyms = words.join(" ");
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
