import alfy from "alfy";
import yargsParser from "yargs-parser";
import {
	processCssItems,
	processDocItems,
	processIconItems,
	processViewItems,
} from "./getOptions.js";

async function main(args) {
	// alfy.log("args", args);
	// alfy.log("firstArg", firstArg);
	const input = alfy.input;

	let items = [];

	switch (args.mode) {
		case "css":
			items = await processCssItems(input);
			break;
		case "views":
			items = await processViewItems(input);
			break;
		case "icons":
			items = await processIconItems(input);
			break;
		default: // "doc"
			items = await processDocItems(input);
			break;
	}

	alfy.output(items);
}

const args = yargsParser(process.argv.slice(2));

await main(args);
