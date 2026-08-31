import { expect, type Locator, type Page } from '@playwright/test';
import type { TestFile } from '../helpers/test-files';

const URL = '/register-institute/attachments';

/** Walks up from a text node until it finds a container with a descendant
 *  file input — dropzones are laid out as `<label text><icon><input hidden>`
 *  inside one shared wrapper, but the exact nesting depth isn't guaranteed. */
async function nearestFileInput(page: Page, labelText: string, maxLevels = 5): Promise<Locator> {
  let node = page.getByText(labelText, { exact: true });
  for (let level = 0; level <= maxLevels; level++) {
    const input = node.locator('input[type="file"]');
    if ((await input.count()) > 0) return input.first();
    node = node.locator('..');
  }
  throw new Error(`No file input found within ${maxLevels} ancestor levels of "${labelText}"`);
}

/** Step 8: Attachments — TC-043/044/045 (document uploads) and (guarded) TC-036 final submit. */
export class AttachmentsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  /** The accordion item containing both the header (heading/required-badge/expand button)
   *  and, once expanded, the upload dropzones — heading text's grandparent. */
  section(heading: string): Locator {
    return this.page.getByText(heading, { exact: true }).locator('..').locator('..');
  }

  async expand(heading: string): Promise<void> {
    const expandButton = this.section(heading).getByRole('button', { name: 'Expand section' });
    if (await expandButton.isVisible().catch(() => false)) {
      await expandButton.click();
    }
  }

  /** Section-level "not attached yet" indicator, e.g. "Please attach the requested document." */
  statusButton(heading: string): Locator {
    return this.section(heading).getByRole('button', { name: 'Please attach the requested document.' });
  }

  /** Expands the section containing `labelText` (a descriptive sub-label, e.g. "Front side of
   *  Owner/ Sole Proprietor CNIC") and returns its dropzone's file input. */
  async fileInputUnderLabel(heading: string, labelText: string): Promise<Locator> {
    await this.expand(heading);
    return nearestFileInput(this.page, labelText);
  }

  /** For single-dropzone sections (NTN Details, Building layout, Building ownership, Affidavit)
   *  where there's no descriptive sub-label — the first file input in the expanded section. */
  async fileInputForSection(heading: string): Promise<Locator> {
    await this.expand(heading);
    return this.section(heading).locator('input[type="file"]').first();
  }

  async uploadUnderLabel(heading: string, labelText: string, file: TestFile): Promise<void> {
    const input = await this.fileInputUnderLabel(heading, labelText);
    await input.setInputFiles(file);
  }

  async uploadFirstInSection(heading: string, file: TestFile): Promise<void> {
    const input = await this.fileInputForSection(heading);
    await input.setInputFiles(file);
  }

  get downloadAffidavitButton() {
    return this.page.getByRole('button', { name: 'Download Affidavit' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  async expectAllSectionsAttached(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Please attach the requested document.' })).toHaveCount(0);
  }
}
