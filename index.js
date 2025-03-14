import alfy from "alfy";
import yargsParser from "yargs-parser";
import {
	processAll,
	processApexAPI192Items,
	processCssClassItems,
	processCssVarItems,
	processDocItems,
	processHTMLSnippets,
	processIconItems,
	processIconModifierSnippets,
	processSubstitutionItems,
	processViewItems,
	processWebsiteItems,
} from "./getOptions.js";

async function main(args) {
	// alfy.log("args", args);
	// alfy.log("firstArg", firstArg);
	const input = alfy.input;

	let items = [];

	switch (args.mode) {
		case "all":
			items = await processAll(input);
			break;
		case "css-vars":
			items = await processCssVarItems(input);
			break;
		case "css-classes":
			items = await processCssClassItems(input);
			break;
		case "views":
			items = await processViewItems(input);
			break;
		case "icons":
			items = await processIconItems(input);
			break;
		case "icon-modifiers":
			items = await processIconModifierSnippets(input);
			break;
		case "doc":
			items = await processDocItems(input);
			break;
		case "websites":
			items = await processWebsiteItems(input);
			break;
		case "html-snippets":
			items = await processHTMLSnippets(input);
			break;
		case "substitution":
			items = await processSubstitutionItems(input);
			break;
		case "api-192":
			items = await processApexAPI192Items(input);
			break;
		default:
			alfy.error(`Invalid mode: "${args.mode}"`);
			break;
	}

	alfy.output(items);
}

const args = yargsParser(process.argv.slice(2));
await main(args);
