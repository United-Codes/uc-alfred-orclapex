import alfyTest from "alfy-test";
import test from "ava";

test("span icon", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("span icon", "--mode=html-snippets");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "Icon span");
});
