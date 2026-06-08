import { test, expect } from "../../../fixtures/pom/test-options";

test.describe("Reportes — hub", () => {
  test(
    "should load the reports hub with heading and key sections",
    { tag: "@smoke" },
    async ({ reportesPage }) => {
      await test.step("Given the reports hub is open", async () => {
        await reportesPage.open();
      });

      await test.step("Then the page heading is visible", async () => {
        await expect(reportesPage.heading).toBeVisible();
      });

      await test.step("And the three report sections are visible", async () => {
        await expect(reportesPage.balanceByTypeSection).toBeVisible();
        await expect(reportesPage.eventBreakdownSection).toBeVisible();
        await expect(reportesPage.movementsWithoutEventSection).toBeVisible();
      });

      await test.step("And the date/state filter form is visible", async () => {
        await expect(reportesPage.fromDateInput).toBeVisible();
        await expect(reportesPage.toDateInput).toBeVisible();
        await expect(reportesPage.filterButton).toBeVisible();
      });
    },
  );
});
