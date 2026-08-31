import type { Page } from '@playwright/test';

const URL = '/register-institute/building/other-facilities';

/** Step 7: Building Details -> Other Facilities — TC-035. */
export class OtherFacilitiesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  checkbox(name: string) {
    // Canteen's accessible name is literally "Canteen*" (the asterisk is inside the label).
    return this.page.getByRole('checkbox', { name: new RegExp(`^${name}\\*?$`) });
  }

  get requiredMessage() {
    return this.page.getByText(/Please select the required facilities before proceeding/);
  }

  async check(name: string, checked = true): Promise<void> {
    const box = this.checkbox(name);
    if ((await box.isChecked()) !== checked) {
      await box.click();
    }
  }

  async checkAll(names: readonly string[]): Promise<void> {
    for (const name of names) {
      await this.check(name);
    }
  }
}
