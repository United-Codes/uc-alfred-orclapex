import alfyTest from "alfy-test";
import test from "ava";

test("APP_ID", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("APP_ID", "--mode=substitution");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "APP_ID");
	t.deepEqual(first.arg, "APP_ID");
});
