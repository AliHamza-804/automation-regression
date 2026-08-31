import { expect, type Page } from '@playwright/test';

/**
 * The post-login dashboard's sidebar "Registration" nav item expands an
 * in-place submenu (no navigation) with "Application", "Track Application",
 * "E-Challan Status", "E-Challan Summary". Clicking "Application" navigates
 * to the Application status page, which shows either a "New Registration"
 * card (no draft yet) or a "Continue registration" button (draft already
 * exists) with a step/progress summary.
 */
export class DashboardPage {
  constructor(private readonly page: Page) {}

  async gotoDashboard(): Promise<void> {
    await this.page.goto('/institute-stats-dashboard');
    await expect(this.page.getByRole('heading', { name: 'Welcome' })).toBeVisible({timeout: 10000});
  }

  async openRegistrationMenu(): Promise<void> {
    await this.page.getByRole('button', { name: 'Registration', exact: true }).click();
    await expect(this.page.getByRole('button', { name: 'Application', exact: true })).toBeVisible();
  }

  async goToApplication(): Promise<void> {
    await this.page.getByRole('button', { name: 'Application', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Application', level: 2 })).toBeVisible({timeout: 20000});
  }
}

export class ApplicationStatusPage {
  constructor(private readonly page: Page) {}

  get continueRegistrationButton() {
    return this.page.getByRole('button', { name: 'Continue registration' });
  }

  get newRegistrationHeading() {
    return this.page.getByRole('heading', { name: 'New Registration' });
  }

  /** Clicks "Continue registration" (existing draft) and waits for the wizard to load. */
  async continueRegistration(): Promise<void> {
    await this.continueRegistrationButton.click();
    await this.page.waitForURL(/\/register-institute\//);
  }
}

/** Full entry path exercised by TC-002: Registration (nav) -> Application -> Continue registration. */
export async function openRegistrationWizard(page: Page): Promise<void> {
  const dashboard = new DashboardPage(page);
  await dashboard.openRegistrationMenu();
  await dashboard.goToApplication();

  const applicationStatus = new ApplicationStatusPage(page);
  await applicationStatus.continueRegistration();
}
