import { expect, type Locator, type Page } from '@playwright/test';
import { readCaptchaText } from '../helpers/captcha';

const SIGN_IN_PATH = '/sign-in';
const POST_LOGIN_URL_PATTERN = /\/institute-stats-dashboard/;

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly captchaCanvas: Locator;
  readonly captchaInput: Locator;
  readonly refreshCaptchaButton: Locator;
  readonly loginButton: Locator;
  readonly captchaErrorText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter email address');
    this.passwordInput = page.getByPlaceholder('Enter password');
    this.showPasswordButton = page.getByRole('button', { name: 'Show password' });
    this.captchaCanvas = page.locator('#canv');
    this.captchaInput = page.getByPlaceholder('Enter captcha code');
    this.refreshCaptchaButton = page.getByRole('button', { name: 'Refresh' });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.captchaErrorText = page.getByText(/captcha/i).filter({ hasText: /invalid|incorrect|wrong|expired/i });
  }

  async goto(): Promise<void> {
    await this.page.goto(SIGN_IN_PATH);
    await expect(this.loginButton).toBeVisible();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async refreshCaptcha(): Promise<void> {
    await this.refreshCaptchaButton.click();
  }

  /** OCRs the captcha canvas — see helpers/captcha.ts for why OCR is needed. */
  async readCaptcha(): Promise<string> {
    return readCaptchaText(this.captchaCanvas);
  }

  async fillCaptcha(code: string): Promise<void> {
    await this.captchaInput.fill(code);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return POST_LOGIN_URL_PATTERN.test(this.page.url());
  }

  /**
   * Fills the credentials once, then solves + submits the captcha, retrying
   * (refresh -> re-OCR -> resubmit) if the OCR guess was rejected. OCR on a
   * distorted canvas isn't 100% reliable, so a couple of retries is what
   * makes the flow deterministic in CI.
   */
  async login(email: string, password: string, maxAttempts = 4): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const code = await this.readCaptcha();
      await this.fillCaptcha(code);
      await this.submit();

      const loggedIn = await this.page
        .waitForURL(POST_LOGIN_URL_PATTERN, { timeout: 10_000 })
        .then(() => true)
        .catch(() => false);

      if (loggedIn) {
        return;
      }

      if (attempt === maxAttempts) {
        throw new Error(`Login did not reach the dashboard after ${maxAttempts} attempt(s). Last captcha guess: "${code}".`);
      }

      await this.refreshCaptcha();
    }
  }
}
