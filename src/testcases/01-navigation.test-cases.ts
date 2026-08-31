import { expect, test } from '../fixtures';
import { DashboardPage, ApplicationStatusPage, openRegistrationWizard } from '../pages/dashboard.page';

// TC-002 — Verify that a new registration form opens correctly and only once per entry point.
export function registerNavigationTestCases(): void {
  test('[Positive] Registration -> Application -> Continue registration opens the wizard', async ({ page }) => {
    await page.goto('/institute-stats-dashboard');

    await openRegistrationWizard(page);

    // This account already has a draft in progress, so "Continue registration" resumes it
    // wherever it left off rather than always landing on Step 1 — assert on the wizard shell
    // rather than a specific step URL.
    await expect(page).toHaveURL(/\/register-institute\//);
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  test('[Edge] only a single draft/instance exists after repeated entry', async ({ page }) => {
    await page.goto('/institute-stats-dashboard');

    const dashboard = new DashboardPage(page);
    await dashboard.openRegistrationMenu();
    await dashboard.goToApplication();

    const applicationStatus = new ApplicationStatusPage(page);
    // Exactly one "Continue registration" entry point for this institute — no duplicate
    // draft cards from having driven the wizard forward and back in earlier runs.
    await expect(applicationStatus.continueRegistrationButton).toHaveCount(1);

    await applicationStatus.continueRegistration();
    await expect(page).toHaveURL(/\/register-institute\//);

    // Re-entering via the same path afterwards still resumes the same single draft, not a new one.
    await dashboard.gotoDashboard();
    await dashboard.openRegistrationMenu();
    await dashboard.goToApplication();
    await expect(applicationStatus.continueRegistrationButton).toHaveCount(1);
  });

  test('[Negative] an unauthenticated visitor is redirected to Login instead of the form', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/register-institute/institute/basic-info');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

    await context.close();
  });
}

