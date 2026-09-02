import { expect, type Page } from '@playwright/test';
import { selectDropdownOption, searchAndSelectDropdownOption } from '../helpers/dropdown';
import { fieldByLabel, getFieldErrorText } from '../helpers/validation';
import type { TestFile } from '../helpers/test-files';
import { validBasicInfo } from '../data/registration-data';

const URL = '/register-institute/institute/basic-info';

/** Step 1, sub-step 1: Institute Details (Basic Info) + Bank Details — TC-003..TC-019. */
export class BasicInfoPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  // ---- generic field access -------------------------------------------------
  field(labelText: string) {
    return fieldByLabel(this.page, labelText);
  }

  textbox(labelText: string) {
    return this.field(labelText).getByRole('textbox');
  }

  combobox(labelText: string) {
    return this.field(labelText).getByRole('combobox');
  }

  async errorFor(labelText: string): Promise<string> {
    return getFieldErrorText(this.field(labelText));
  }

  // ---- Institute Logo ---------------------------------------------------
  get logoDropzone() {
    return this.page
      .getByText('Institute Logo')
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('input[type="file"]');
  }

  async uploadLogo(file: TestFile): Promise<void> {
    await this.logoDropzone.setInputFiles(file);
  }

  // ---- Institute Details fields -----------------------------------------
  async selectOrganizationType(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.combobox('Organization Type*'), value);
  }

  async fillInstituteName(value: string): Promise<void> {
    await this.textbox('Institute Name (as per NTN)*').fill(value);
  }

  async fillHeadName(value: string): Promise<void> {
    await this.textbox('Head Name*').fill(value);
  }

  async selectInstituteGender(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.combobox('Institute Gender*'), value);
  }

  async selectCampusType(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.combobox('Campus Type*'), value);
  }

  async fillLandline(value: string): Promise<void> {
    await this.textbox('Institute Landline No').fill(value);
  }

  async fillWhatsapp(value: string): Promise<void> {
    await this.textbox('Whatsapp*').fill(value);
  }

  async fillInstituteMobileNo(value: string): Promise<void> {
    // Skip if field is disabled (readonly/auto-populated by app)
    const isDisabled = await this.textbox('Institute Mobile No*').isDisabled();
    if (!isDisabled) {
      await this.textbox('Institute Mobile No*').fill(value);
    }
  }

  async fillInstituteEmail(value: string): Promise<void> {
    // Skip if field is disabled (readonly/auto-populated by app)
    const isDisabled = await this.textbox('Institute Email Address*').isDisabled();
    if (!isDisabled) {
      await this.textbox('Institute Email Address*').fill(value);
    }
  }

  /**
   * Writes `value` into the native date input via Playwright's own `fill()`
   * rather than a hand-rolled `element.value = ...` + dispatch. This field is
   * a React-controlled MUI input: manually assigning `.value` (even through
   * the native property setter) and dispatching synthetic events can leave
   * the app's own validation state out of sync with the DOM — confirmed live
   * against the app, where an identical manual dispatch sequence sometimes
   * left "Date of establishment is required." from never appearing after
   * clearing the field, and the future/past-date checks never running.
   * `fill()` is Playwright's documented, framework-safe way to set inputs and
   * reliably triggers the app's own onChange/validation. `toPass()` guards
   * only against the fresh-draft hydration race (a write landing before the
   * wizard finishes loading its server state gets silently overwritten).
   */
  private async writeDateOfEstablishment(value: string): Promise<void> {
    const dateInput = this.field('Date of establishment of institute*').locator('input[type="date"]');

    await expect(async () => {
      await dateInput.fill(value);
      expect(await dateInput.inputValue()).toBe(value);
    }).toPass({ timeout: 5_000 });

    // The app validates this field via a click-away listener, not a plain
    // blur event: dateInput.blur() leaves aria-invalid/"required" text from
    // ever appearing (confirmed live — the error only renders after a real
    // click on another part of the page). Click elsewhere to trigger it.
    await this.page.getByRole('heading', { level: 2 }).click();
  }

  async setDateOfEstablishment(isoDate: string): Promise<void> {
    await this.writeDateOfEstablishment(isoDate);
  }

  async clearDateOfEstablishment(): Promise<void> {
    await this.writeDateOfEstablishment('');
  }

  async fillWebsite(value: string): Promise<void> {
    await this.textbox('Website').fill(value);
  }

  async fillNtn(value: string): Promise<void> {
    await this.textbox('NTN Number*').fill(value);
  }

  // ---- Bank Details fields ------------------------------------------------
  async selectBankName(searchText: string, optionText: string): Promise<void> {
    await searchAndSelectDropdownOption(this.page, this.combobox('Bank Name*'), searchText, optionText);
  }

  async fillBranchName(value: string): Promise<void> {
    await this.textbox('Branch Name*').fill(value);
  }

  async fillBranchCode(value: string): Promise<void> {
    await this.textbox('Branch Code*').fill(value);
  }

  async fillAccountTitle(value: string): Promise<void> {
    await this.textbox('Account Title*').fill(value);
  }

  async fillAccountNumber(value: string): Promise<void> {
    await this.textbox('Account Number*').fill(value);
  }

  async fillIban(value: string): Promise<void> {
    await this.textbox('IBAN*').fill(value);
  }

  async selectAccountType(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.combobox('Account Type*'), value);
  }

  /** Fills every required field with known-good data, so a single-field negative
   *  test can override just the one field it's exercising afterwards. */
  async fillValid(overrides: Partial<typeof validBasicInfo> = {}): Promise<void> {
    const data = { ...validBasicInfo, ...overrides };
    await this.selectOrganizationType(data.organizationType);
    await this.fillInstituteName(data.instituteName);
    await this.fillHeadName(data.headName);
    await this.selectInstituteGender(data.instituteGender);
    await this.selectCampusType(data.campusType);
    await this.fillWhatsapp(data.whatsapp);
    await this.setDateOfEstablishment(data.dateOfEstablishment);
    await this.fillNtn(data.ntn);
    await this.selectBankName(data.bankSearch, data.bankName);
    await this.fillBranchName(data.branchName);
    await this.fillBranchCode(data.branchCode);
    await this.fillAccountTitle(data.accountTitle);
    await this.fillAccountNumber(data.accountNumber);
    await this.fillIban(data.iban);
    await this.selectAccountType(data.accountType);
  }
}
