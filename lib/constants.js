import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants file is in lib/, so we go up one level to root
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");

export const FILES = {
	DOC: path.join(DATA_DIR, "doc.json"),
	CSS_VARS: path.join(DATA_DIR, "css-vars.json"),
	CSS_CLASSES: path.join(DATA_DIR, "css-classes.json"),
	VIEWS: path.join(DATA_DIR, "views.json"),
	ICONS: path.join(DATA_DIR, "icons.json"),
	WEBSITES: path.join(DATA_DIR, "websites.json"),
	HTML_SNIPPETS: path.join(DATA_DIR, "html-snippets.json"),
	ICON_MODIFIERS: path.join(DATA_DIR, "icon-modifiers.json"),
	SUBSTITUTIONS: path.join(DATA_DIR, "substitutions.json"),
	DATA_GENERATOR_DOMAINS: path.join(DATA_DIR, "data_generator_domains.json"),
	APEX_API_192: path.join(DATA_DIR, "doc-192.json"),
	SYNONYMS: path.join(DATA_DIR, "synonyms.json"),
};

export const RESULT_SIZE = 50;
