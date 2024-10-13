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
