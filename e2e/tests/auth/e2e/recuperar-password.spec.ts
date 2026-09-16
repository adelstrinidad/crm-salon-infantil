import { test, expect } from "../../../fixtures/pom/test-options";
import { Routes } from "../../../enums/app/routes";
import { Messages } from "../../../enums/app/messages";
import { AdminCredentials, MANAGER_CODE } from "../../../config/credentials";

// Password recovery. The happy paths deliberately re-set the password to the
// SAME value the suite logs in with, so the flow is exercised end to end
// without invalidating the stored admin session for the rest of the run.
const { password: ADMIN_PASSWORD } = AdminCredentials;

test.describe("Recuperar contraseña", () => {
  test(
    "the login screen offers a way in when the password is lost",
    { tag: "@e2e" },
    async ({ page }) => {
      await test.step("Given the login screen", async () => {
        await page.goto(Routes.LOGIN);
      });

      await test.step("When following the recovery link", async () => {
        await page.getByRole("link", { name: Messages.FORGOT_PASSWORD_LINK }).click();
      });

      await test.step("Then the recovery screen opens", async () => {
        await page.waitForURL(`**${Routes.RECUPERAR}`);
        await expect(page.getByRole("tab", { name: "Código de encargado" })).toBeVisible();
      });
    },
  );

  test("refuses two passwords that do not match", { tag: "@e2e" }, async ({ page, recuperarPage }) => {
    await test.step("Given the recovery screen", async () => {
      await recuperarPage.open();
    });

    // The client validates with the same Zod schema as the Server Action, so a
    // mismatch must be caught before any request leaves the browser — on the
    // emailed link that request would burn a single-use token.
    let posts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST") posts += 1;
    });

    await test.step("When the confirmation does not match", async () => {
      await recuperarPage.codigoTab.click();
      await recuperarPage.managerCodeInput.fill(MANAGER_CODE);
      await recuperarPage.passwordInput.fill(ADMIN_PASSWORD);
      await recuperarPage.confirmPasswordInput.fill(`${ADMIN_PASSWORD}-distinta`);
      await recuperarPage.submitButton.click();
    });

    await test.step("Then the mismatch is reported without hitting the server", async () => {
      await expect(page.getByText(Messages.PASSWORDS_MISMATCH)).toBeVisible();
      expect(posts).toBe(0);
    });
  });

  test("refuses a wrong manager code", { tag: "@e2e" }, async ({ page, recuperarPage }) => {
    await test.step("Given the recovery screen", async () => {
      await recuperarPage.open();
    });

    await test.step("When submitting a wrong manager code", async () => {
      await recuperarPage.resetWithManagerCode("codigo-incorrecto", ADMIN_PASSWORD);
    });

    await test.step("Then the code is rejected", async () => {
      await expect(page.getByText(Messages.MANAGER_CODE_INVALID)).toBeVisible();
    });
  });

  test(
    "resets the password with the manager code",
    { tag: "@e2e" },
    async ({ page, recuperarPage }) => {
      await test.step("Given the recovery screen", async () => {
        await recuperarPage.open();
      });

      await test.step("When submitting the manager code with a new password", async () => {
        await recuperarPage.resetWithManagerCode(MANAGER_CODE, ADMIN_PASSWORD);
      });

      await test.step("Then the password is updated and login is offered", async () => {
        await expect(page.getByText(Messages.PASSWORD_UPDATED)).toBeVisible();
        await expect(page.getByRole("button", { name: "Ir a iniciar sesión" })).toBeVisible();
      });
    },
  );

  test(
    "answers an emailed-link request the same way for any address",
    { tag: "@e2e" },
    async ({ page, recuperarPage }) => {
      await test.step("Given the recovery screen", async () => {
        await recuperarPage.open();
      });

      await test.step("When asking for a link for an address that has no account", async () => {
        await recuperarPage.requestEmailLink(`nadie-${Date.now()}@salon.local`);
      });

      await test.step("Then the answer reveals nothing about the address", async () => {
        await expect(page.getByText(Messages.RESET_EMAIL_SENT)).toBeVisible();
      });
    },
  );

  test("rejects an invented reset link", { tag: "@e2e" }, async ({ page }) => {
    await test.step("Given a link that was never issued", async () => {
      await page.goto(`${Routes.RECUPERAR}/token-inventado`);
    });

    await test.step("Then the link is refused and a new one is offered", async () => {
      await expect(page.getByText(Messages.RESET_LINK_EXPIRED)).toBeVisible();
      await expect(page.getByRole("link", { name: "Pedir un enlace nuevo" })).toBeVisible();
    });
  });

});
