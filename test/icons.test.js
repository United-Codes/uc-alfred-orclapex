import alfyTest from "alfy-test";
import test from "ava";

test("ut-palette-success-shade", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("excel", "--mode=icons");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "fa-file-excel-o");
	t.deepEqual(first.arg, "fa-file-excel-o");
});
