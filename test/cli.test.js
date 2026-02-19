import test from "ava";
import { exec } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const CLI_PATH = path.resolve("cli.js");

async function runCli(args) {
	const command = `node ${CLI_PATH} ${args}`;
	return execAsync(command);
}

test("cli-icons-add", async (t) => {
	const { stdout } = await runCli("--type=icons --query=add");

	t.true(stdout.includes("fa-plus"));
	t.true(stdout.includes("add"));
});

test("cli-css-grid", async (t) => {
	const { stdout } = await runCli("--type=css-classes --query=grid");

	t.true(stdout.includes("col-sm-"));
	t.true(stdout.includes("Grid"));
});

test("cli-doc-mail", async (t) => {
	const { stdout } = await runCli("--type=doc --query=mail");

	t.true(stdout.includes("APEX_MAIL"));
});

test("cli-views-apps", async (t) => {
	const { stdout } = await runCli("--type=views --query=apps");

	t.true(stdout.includes("APEX_APPLICATIONS"));
});

test("cli-invalid-type", async (t) => {
	await t.throwsAsync(async () => {
		await runCli("--type=invalid --query=test");
	});
});

test("cli-missing-args", async (t) => {
	await t.throwsAsync(async () => {
		await runCli("");
	});
});
