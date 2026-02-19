import alfyTest from "alfy-test";
import test from "ava";

test("synonym-icon-change", async (t) => {
	const alfy = alfyTest();
	const result = await alfy("change", "--mode=icons");

	t.true(result.length > 0);
	const found = result.find((item) => item.uid === "fa-pencil");
	t.truthy(found, "Should find fa-pencil when searching for 'change'");
});

test("synonym-doc-email", async (t) => {
	const alfy = alfyTest();
	const result = await alfy("email", "--mode=doc");

	t.true(result.length > 0);
	const found = result.find(
		(item) =>
			item.uid ===
			"https://docs.oracle.com/en/database/oracle/apex/24.2/aeapi/APEX_MAIL.html",
	);
	t.truthy(found, "Should find APEX_MAIL when searching for 'email'");
});

test("synonym-view-apps", async (t) => {
	const alfy = alfyTest();
	const result = await alfy("apps", "--mode=views");

	t.true(result.length > 0);
	const found = result.find((item) => item.uid === "APEX_APPLICATIONS");
	t.truthy(found, "Should find APEX_APPLICATIONS when searching for 'apps'");
});

test("synonym-css-primary", async (t) => {
	const alfy = alfyTest();
	const result = await alfy("primary", "--mode=css-classes");

	t.true(result.length > 0);
	const found = result.find((item) => item.uid === "u-color-1");
	t.truthy(found, "Should find u-color-1 when searching for 'primary'");
});
