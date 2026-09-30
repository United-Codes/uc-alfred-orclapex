import alfyTest from "alfy-test";
import test from "ava";

test("plug-in", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("plug-in", "--mode=websites");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "Plug-in repository");
	t.deepEqual(first.arg, "https://apex.world/ords/f?p=100:700");
});

test("roadmap", async (t) => {
	const alfy = alfyTest();

	const result = await alfy("roadmap", "--mode=websites");

	t.true(result.length > 0);

	const first = result[0];
	t.deepEqual(first.title, "Roadmap");
	t.deepEqual(first.arg, "https://apex.oracle.com/roadmap");
});
