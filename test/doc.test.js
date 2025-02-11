import alfyTest from "alfy-test";
import test from "ava";

test("APEX_STRING", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("APEX_STRING", "--mode=doc");

	t.true(result.length > 1);

	const first = result[0];

	t.deepEqual(first.title, "55 APEX_STRING");
	t.deepEqual(first.subtitle, "PL/SQL");
});

test("apex.lang", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("apex.lang", "--mode=doc");

	t.true(result.length > 1);

	const first = result[0];

	t.deepEqual(first.title, "apex.lang");
	t.deepEqual(first.subtitle, "JS");
});
