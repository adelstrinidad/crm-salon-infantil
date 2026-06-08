---
name: page-objects
description: >
  Teaches how to create, extend, and register Playwright Page Objects following
  the Dependency Injection pattern. Use when the task involves creating a new
  page object, adding locators or methods to an existing one, composing
  components, or registering fixtures in page-object-fixture.ts.
---

# Page Objects Skill

## Context

Page Objects encapsulate all locators and actions for a UI area. They are NEVER
instantiated manually inside tests. They are always injected via fixtures.

Registration goes in `fixtures/pom/page-object-fixture.ts` — NOT in `test-options.ts`.
`test-options.ts` merges all fixture files together via `mergeTests()` and is the
single import point for tests. Never import directly from fixture files in tests.

The AI must **explore the live page** with `playwright-cli` before generating
any locators. No guessing.

---

## File Locations

```
pages/{area}/[name].page.ts           ← page object
pages/components/[name].component.ts  ← reusable UI component
fixtures/pom/page-object-fixture.ts   ← registration (add here)
fixtures/pom/test-options.ts          ← single import point (do not modify for POM)
```

---

## Recipe

### Phase 1: Discover existing pages
```bash
ls pages/
ls pages/app/           # substitute real area name
cat fixtures/pom/page-object-fixture.ts   # see what's already registered
```

### Phase 2: Explore the live page
```bash
# Required before writing ANY locator — see playwright-cli skill
playwright-cli goto <URL>
playwright-cli snapshot
```

### Phase 3: Page Object Structure

```typescript
// pages/{area}/[name].page.ts
import { expect, Locator, Page } from '@playwright/test';
import { ApiEndpoints, Messages } from '../../enums/app/app';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  // ── LOCATORS (getters only — never assigned in constructor) ──────────────

  get nameInput(): Locator {
    return this.page.getByLabel('Full name');
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save changes' });
  }

  get successMessage(): Locator {
    return this.page.getByText(Messages.SETTINGS_SAVED);
  }

  get errorMessage(): Locator {
    return this.page.getByRole('alert');
  }

  // ── ACTION METHODS ───────────────────────────────────────────────────────

  /**
   * Navigates to the settings page.
   * @returns {Promise<void>}
   */
  async open(): Promise<void> {
    await this.page.goto(`${process.env.APP_URL}/settings`, {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Updates the user's display name.
   * @param {string} name - The new display name.
   * @returns {Promise<void>}
   */
  async updateName(name: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await this.page.waitForResponse(
      (r) => r.url().includes(ApiEndpoints.CURRENT_USER) && r.request().method() === 'PATCH'
    );
  }

  // ── VERIFICATION METHODS ─────────────────────────────────────────────────

  async verifySuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }
}
```

**Locator rules:**
- Locators MUST be getters — never assigned in the constructor
- Priority: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → CSS (last resort)
- `testIdAttribute` in this repo is `data-test` (not `data-testid`)
- NO JSDoc on locator getters — names are self-documenting
- JSDoc with `@param` / `@returns` on action methods only

### Phase 4: Component Composition

```typescript
// pages/components/navigation.component.ts
import { Locator, Page } from '@playwright/test';

export class NavigationComponent {
  constructor(private readonly page: Page) {}

  get cartLink(): Locator {
    return this.page.getByRole('link', { name: 'Cart' });
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}

// pages/{area}/product.page.ts — compose the component
import { NavigationComponent } from '../components/navigation.component';

export class ProductPage {
  readonly nav: NavigationComponent;

  constructor(private readonly page: Page) {
    this.nav = new NavigationComponent(page);
  }
}
```

### Phase 5: Register in page-object-fixture.ts

This is the ONLY file to modify for POM registration. Never touch `test-options.ts` for this.

```typescript
// fixtures/pom/page-object-fixture.ts
import { test as base } from '@playwright/test';
import { AppPage } from '../../pages/app/app.page';
import { SettingsPage } from '../../pages/app/settings.page'; // ← add import

export type FrameworkFixtures = {
  appPage: AppPage;
  settingsPage: SettingsPage;  // ← add type
};

export const test = base.extend<FrameworkFixtures>({
  appPage: async ({ page }, use) => {
    await use(new AppPage(page));
  },

  settingsPage: async ({ page }, use) => {  // ← add fixture
    await use(new SettingsPage(page));
  },
});
```

`test-options.ts` picks it up automatically via `mergeTests()` — no changes needed there.

### Phase 6: Consume from test (ONLY valid pattern)

```typescript
// tests/{area}/functional/settings.spec.ts
import { test, expect } from '../../../fixtures/pom/test-options';
import { UserFactory } from '../../../test-data/factories/app/user.factory';

test.describe('Settings page', () => {
  test(
    'should save name successfully',
    { tag: '@smoke' },
    async ({ settingsPage }) => {
      await test.step('Given: user is on settings page', async () => {
        await settingsPage.open();
      });

      await test.step('When: user updates their name', async () => {
        await settingsPage.updateName(UserFactory.generate().name);
      });

      await test.step('Then: success message is shown', async () => {
        await settingsPage.verifySuccess();
      });
    }
  );
});
```

---

## Anti-Patterns (NEVER)

```typescript
// ❌ Manual instantiation in test
const settings = new SettingsPage(page);

// ❌ Import from @playwright/test directly
import { test } from '@playwright/test';

// ❌ Register in test-options.ts directly
// test-options.ts is for mergeTests() only

// ❌ Locator as constructor property (eager — breaks if element not present)
constructor(private page: Page) {
  this.saveButton = page.getByRole('button', { name: 'Save' }); // WRONG
}

// ❌ JSDoc on locator getter
/** The save button */ // WRONG — remove this
get saveButton(): Locator { ... }

// ❌ Hard wait
await page.waitForTimeout(2000);

// ❌ CSS class selector
page.locator('.btn-primary')

// ❌ No-op assertion
if (await locator.isVisible()) { ... }  // use expect().toBeVisible()
```

---

## Related Skills
- `selectors` — locator priority and exploration detail
- `playwright-cli` — live DOM exploration before writing locators
- `fixtures` — how test-options.ts merges all fixture files
