// Single import point for specs: `import { test, expect } from
// "<...>/fixtures/pom/test-options"`. Never import from "@playwright/test" in a
// spec. Merge additional fixture files here (this file is mergeTests only — add
// new page objects in page-object-fixture.ts, not here).
import { mergeTests } from "@playwright/test";
import { test as pageObjectFixture } from "./page-object-fixture";

const test = mergeTests(pageObjectFixture);
const expect = test.expect;

export { test, expect };
