import { expect, request, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { requiredEnv } from './env';

const DEFAULT_AUTH_API_URL = 'https://psdabackend.optimusfoxdev.com';
const LOGIN_PATH = '/users/auth/v1/login';

type LoginResponse = { data?: { accessToken?: string; user?: unknown } };
type SessionData = { token: string; user: unknown };

/** Creates a browser context authenticated by the portal's login API. */
export class ApiSession {
  private api?: APIRequestContext;
  private context?: BrowserContext;
  private page?: Page;

  constructor(private readonly browser: Browser) {}

  async getPage(): Promise<Page> {
    if (!this.page) await this.reauthenticate();
    return this.page!;
  }

  /** Discards old state and obtains a brand-new API token. */
  async reauthenticate(): Promise<Page> {
    await this.context?.close();
    await this.api?.dispose();
    const session = await this.login();

    this.context = await this.browser.newContext({ baseURL: requiredEnv('BASE_URL') });
    await this.context.addInitScript(({ token, user }) => {
      const serializedUser = JSON.stringify(user);
      const timestamp = new Date().toISOString();
      localStorage.setItem('token', token);
      localStorage.setItem('user', serializedUser);
      localStorage.setItem('persist:user', JSON.stringify({
        user: serializedUser, token: JSON.stringify(token), isAuthenticated: 'true',
        expireTimer: '""', resetToken: 'null', loginTime: JSON.stringify(timestamp),
        lastActivity: JSON.stringify(timestamp), sessionId: JSON.stringify(`api_${Date.now()}`),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      }));
    }, session);

    this.page = await this.context.newPage();
    await this.page.goto('/institute-stats-dashboard');
    await expect(this.page).toHaveURL(/\/institute-stats-dashboard/, { timeout: 30_000 });
    return this.page;
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.api?.dispose();
  }

  private async login(): Promise<SessionData> {
    this.api = await request.newContext({
      baseURL: process.env.AUTH_API_URL?.trim() || DEFAULT_AUTH_API_URL,
      extraHTTPHeaders: { 'x-user-type': 'institute' },
    });
    const response = await this.api.post(LOGIN_PATH, {
      data: {
        emailAddress: requiredEnv('LOGIN_EMAIL'), password: requiredEnv('LOGIN_PASSWORD'),
        rememberMe: true,
        // The canvas captcha is validated client-side before this API call.
        captcha: 'API001',
      },
    });
    const body = (await response.json()) as LoginResponse;
    if (!response.ok() || !body.data?.accessToken || !body.data.user) {
      throw new Error(`API login failed (${response.status()}). The response did not contain a usable token and user.`);
    }
    return { token: body.data.accessToken, user: body.data.user };
  }
}
