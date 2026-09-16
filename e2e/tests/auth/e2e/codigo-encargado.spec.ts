import { test, expect } from "../../../fixtures/pom/test-options";
import { Messages } from "../../../enums/app/messages";
import { AdminCredentials, MANAGER_CODE } from "../../../config/credentials";

// Rotating the manager approval code from /cuenta. The happy path deliberately
// sets the code back to the SAME value the suite uses, so the rest of the run
// (voids, payment reversals, manager-code password reset) keeps working.
test.describe("Código de encargado", () => {
  test(
    "rotating requires the current code",
    { tag: "@e2e" },
    async ({ page, cuentaPage }) => {
      await test.step("Given the account screen", async () => {
        await cuentaPage.open();
        await expect(page.getByText(AdminCredentials.email)).toBeVisible();
        await expect(cuentaPage.currentCodeInput).toBeVisible();
      });

      await test.step("When the current code is wrong", async () => {
        await cuentaPage.changeManagerCode("no-es-el-actual", MANAGER_CODE);
      });

      await test.step("Then it is refused — a session alone cannot rotate it", async () => {
        await expect(page.getByText(Messages.MANAGER_CODE_INVALID)).toBeVisible();
      });

      await test.step("And with the right current code it rotates", async () => {
        await cuentaPage.changeManagerCode(MANAGER_CODE, MANAGER_CODE);
        await expect(page.getByText(Messages.MANAGER_CODE_UPDATED)).toBeVisible();
      });
    },
  );

  test(
    "offers an emailed link when the code is forgotten",
    { tag: "@e2e" },
    async ({ page, cuentaPage }) => {
      await test.step("Given the account screen", async () => {
        await cuentaPage.open();
      });

      await test.step("When asking for a link without knowing the current code", async () => {
        await cuentaPage.forgotCodeButton.click();
      });

      await test.step("Then the link is sent to the account's address", async () => {
        await expect(page.getByText(Messages.MANAGER_CODE_LINK_SENT)).toBeVisible();
      });
    },
  );

  test("rejects an invented manager-code link", { tag: "@e2e" }, async ({ page }) => {
    await page.goto("/recuperar/codigo/token-inventado");
    await expect(page.getByText(Messages.RESET_LINK_EXPIRED)).toBeVisible();
  });

  test(
    "lets the user reveal what they typed",
    { tag: "@e2e" },
    async ({ cuentaPage }) => {
      await test.step("Given a code typed into the new-code field", async () => {
        await cuentaPage.open();
        await cuentaPage.codeInput.fill(MANAGER_CODE);
        await expect(cuentaPage.codeInput).toHaveAttribute("type", "password");
      });

      await test.step("When the reveal toggle is used", async () => {
        await cuentaPage.revealToggle("Código nuevo").click();
      });

      await test.step("Then that field shows the text, and the others stay hidden", async () => {
        await expect(cuentaPage.codeInput).toHaveAttribute("type", "text");
        await expect(cuentaPage.currentCodeInput).toHaveAttribute("type", "password");
      });
    },
  );

  test("refuses two codes that do not match", { tag: "@e2e" }, async ({ page, cuentaPage }) => {
    let posts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST") posts += 1;
    });

    await test.step("Given the account screen", async () => {
      await cuentaPage.open();
    });

    await test.step("When the confirmation does not match", async () => {
      await cuentaPage.currentCodeInput.fill(MANAGER_CODE);
      await cuentaPage.codeInput.fill(MANAGER_CODE);
      await cuentaPage.confirmCodeInput.fill(`${MANAGER_CODE}-distinto`);
      await cuentaPage.submitCodeButton.click();
    });

    await test.step("Then it is caught on the client, without hitting the server", async () => {
      await expect(page.getByText("Los códigos no coinciden")).toBeVisible();
      expect(posts).toBe(0);
    });
  });
});
