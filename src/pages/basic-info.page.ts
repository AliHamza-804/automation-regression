import type { Page } from '@playwright/test';
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

  async setDateOfEstablishment(isoDate: string): Promise<void> {
    await this.field('Date of establishment of institute*').locator('input[type="date"]').fill(isoDate);
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
