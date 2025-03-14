import alfyTest from "alfy-test";
import test from "ava";

test("generate offset", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("generate offset", "--mode=api-192");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "3.7 GENERATE_OFFSET Procedure");
	t.deepEqual(
		first.arg,
		"https://docs.oracle.com/en/database/oracle/application-express/19.2/aeapi/GENERATE_OFFSET-Procedure.html",
	);
});
