import alfyTest from "alfy-test";
import test from "ava";

test("flash", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("flash", "--mode=icon-modifiers");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "fa-anim-flash");
	t.deepEqual(first.arg, "fa-anim-flash");
});

test("fam-sparkle", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("sparkle", "--mode=icon-modifiers");

	t.true(result.length > 0);

	const found = result.find((item) => item.uid === "fam-sparkle");
	t.truthy(found, "Should find fam-sparkle when searching for 'sparkle'");
});
