import { expect, test } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { requiredEnv } from '../../src/helpers/env';

test('logs in with valid credentials and solved captcha', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(requiredEnv('LOGIN_EMAIL'), requiredEnv('LOGIN_PASSWORD'));

  await expect(page).toHaveURL(/\/institute-stats-dashboard/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
