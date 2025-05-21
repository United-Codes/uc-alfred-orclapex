import alfyTest from "alfy-test";
import test from "ava";

test("dg: animal species", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("animal species", "--mode=data_generator_domains");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "animal.species");
	t.deepEqual(first.subtitle, "animal | VARCHAR2");
	t.deepEqual(first.arg, "animal.species");
});
