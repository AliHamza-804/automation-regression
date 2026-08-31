import { test as base } from '@playwright/test';
import { ApiSession } from './helpers/api-session';

/**
 * Registration tests share one API-created session. If a test fails, the
 * afterEach hook recreates its token and browser context before the next test
 * runs, avoiding session failures cascading into skipped tests.
 */
export const test = base.extend<{}, { apiSession: ApiSession }>({
  apiSession: [
    async ({ browser }, use) => {
      const session = new ApiSession(browser);
      await session.getPage();
      await use(session);
      await session.close();
    },
    { scope: 'worker', timeout: 60_000 },
  ],

  page: async ({ apiSession }, use) => {
    await use(await apiSession.getPage());
  },
});

test.afterEach(async ({ apiSession }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) await apiSession.reauthenticate();
});

export { expect } from '@playwright/test';
