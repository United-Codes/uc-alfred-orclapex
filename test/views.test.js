import alfyTest from "alfy-test";
import test from "ava";

test("ut-palette-success-shade", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("page regions", "--mode=views");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "APEX_APPLICATION_PAGE_REGIONS");
	t.deepEqual(first.arg, "APEX_APPLICATION_PAGE_REGIONS");
});
