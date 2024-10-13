import alfy from "alfy";
import yargsParser from "yargs-parser";
import {
  processCssVarItems,
  processCssClassItems,
  processDocItems,
  processIconItems,
  processViewItems,
  processAll,
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
    case "doc":
      items = await processDocItems(input);
      break;
    default:
      alfy.error(`Invalid mode: "${args.mode}"`);
      break;
  }

  alfy.output(items);
}

const args = yargsParser(process.argv.slice(2));
await main(args);
