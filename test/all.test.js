import alfyTest from "alfy-test";
import test from "ava";

test("align-center (all)", async (t) => {
  const alfy = alfyTest();

  const result = await alfy("align-center", "--mode=all");

  t.true(result.length > 0);

  for (const res of result) {
    t.regex(
      res.title,
      /fa-align-center|u-align-items-center|u-align-self-center/i,
    );
  }
});
