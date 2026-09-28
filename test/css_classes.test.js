import alfyTest from "alfy-test";
import test from "ava";

test("flex", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("flex", "--mode=css-classes");

  t.true(result.length > 0);

  const first = result[0];
  t.deepEqual(first.title, "u-flex");
  t.deepEqual(first.arg, "u-flex");
});

test("overflow-auto", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("scrollable content", "--mode=css-classes");

  t.true(result.length > 0);

  const found = result.find((item) => item.uid === "u-overflow-auto");
  t.truthy(found, "Should find u-overflow-auto when searching for 'scrollable content'");
});

test("gap-scale", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("u-gap-4", "--mode=css-classes");

  t.true(result.length > 0);

  const found = result.find((item) => item.uid === "u-gap-4");
  t.truthy(found, "Should find u-gap-4 when searching for 'u-gap-4'");
});
