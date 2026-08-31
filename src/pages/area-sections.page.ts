import { expect, type Page } from '@playwright/test';
import type { TestFile } from '../helpers/test-files';

const INDOOR_URL = '/register-institute/building/indoor-facilities';
const OUTDOOR_URL = '/register-institute/building/outdoor-facilities';

export interface AreaEntryInput {
  label?: string;
  length?: string;
  width?: string;
  remarks?: string;
}

/**
 * Step 5 (Indoor Facilities) and Step 6 (Outdoor Facilities) share one
 * component: a tab strip (one tab per section type) with an identical
 * Label/Length/Width/Remarks/Add-Attachment/Add form beneath it, and a
 * results table listing every entry added so far for the active tab.
 * TC-037/038/039 (14 section types x scenario) all drive this one page
 * object, just against different tab names.
 */
export class AreaSectionsPage {
  constructor(private readonly page: Page) {}

  async gotoIndoor(): Promise<void> {
    await this.page.goto(INDOOR_URL);
  }

  async gotoOutdoor(): Promise<void> {
    await this.page.goto(OUTDOOR_URL);
  }

  async selectTab(tabName: string): Promise<void> {
    await this.page.getByRole('tab', { name: tabName, exact: true }).click();
  }

  get labelInput() {
    return this.page.locator('input[name="label"]');
  }

  get lengthInput() {
    return this.page.locator('input[name="length"]');
  }

  get widthInput() {
    return this.page.locator('input[name="width"]');
  }

  get remarksInput() {
    return this.page.locator('input[name="remarks"], textarea[name="remarks"]');
  }

  get addAttachmentButton() {
    return this.page.getByRole('button', { name: 'Add Attachment' });
  }

  get addButton() {
    return this.page.getByRole('button', { name: 'Add', exact: true });
  }

  get requirementBanner() {
    // "Minimum required: 1 Class Rooms; 1 Labs/Workshops." at the top of the section.
    return this.page.getByText(/^Minimum required:/);
  }

  get proceedBlockedMessage() {
    // "Please add 1 Class Rooms and 1 Labs/Workshops before proceeding." near the Next button.
    return this.page.getByText(/Please add .* before proceeding\./);
  }

  rowByLabel(label: string) {
    return this.page.getByRole('row').filter({ has: this.page.getByRole('cell', { name: label, exact: true }) });
  }

  async fillEntryForm(entry: AreaEntryInput): Promise<void> {
    if (entry.label !== undefined) await this.labelInput.fill(entry.label);
    if (entry.length !== undefined) await this.lengthInput.fill(entry.length);
    if (entry.width !== undefined) await this.widthInput.fill(entry.width);
    if (entry.remarks !== undefined) await this.remarksInput.fill(entry.remarks);
  }

  async attachFile(file: TestFile): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.addAttachmentButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(file);
  }

  async clickAdd(): Promise<void> {
    await this.addButton.click();
  }

  /** Fills the form for the active tab and clicks Add — the common "positive" path. */
  async addEntry(entry: AreaEntryInput): Promise<void> {
    await this.fillEntryForm(entry);
    await this.clickAdd();
  }

  async expectEntryListed(label: string): Promise<void> {
    await expect(this.rowByLabel(label)).toBeVisible();
  }
}
