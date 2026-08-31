import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { requiredEnv } from '../helpers/env';

// Test case implementation imported by tests/login/login.spec.ts. Registration specs reuse
// src/fixtures.ts) — this is the one file that wants a fresh, logged-out page to actually
// exercise the login flow itself, so it imports `test`/`expect` straight from Playwright.
export function registerLoginTestCases(): void {
  test('logs in with valid credentials and solved captcha', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(requiredEnv('LOGIN_EMAIL'), requiredEnv('LOGIN_PASSWORD'));

  await expect(page).toHaveURL(/\/institute-stats-dashboard/);
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });
}

