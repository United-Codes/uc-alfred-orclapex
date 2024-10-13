import alfyTest from "alfy-test";
import test from "ava";

test("ut-palette-success-shade", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("palette-success-shade", "--mode=css-vars");

  t.true(result.length === 1);

  const first = result[0];
  t.deepEqual(first.title, "ut-palette-success-shade");
  t.deepEqual(first.arg, "--ut-palette-success-shade");
});

test("apex.lang in mode css", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("apex.lang", "--mode=css-vars");

  t.true(result.length === 0);
});
