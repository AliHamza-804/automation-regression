import { type Locator, type Page } from '@playwright/test';
import { selectDropdownOption } from '../helpers/dropdown';
import { fieldByLabel, getFieldErrorText } from '../helpers/validation';
import type { TestFile } from '../helpers/test-files';
import { validOwnerProfile } from '../data/registration-data';

const URL = '/register-institute/institute/ownership-details';

/** Owner and Principal share every field label except CNIC ("CNIC*" vs "Principal CNIC*"),
 *  so the two instances of each shared label are told apart by DOM order (`nth(0)` = Owner,
 *  `nth(1)` = Principal) rather than by section heading (the heading text itself varies with
 *  Organization Type — "Sole Proprietor of the Institute", "Owner of the Institute", ...). */
class PersonSection {
  constructor(
    private readonly page: Page,
    private readonly index: 0 | 1,
    private readonly cnicLabel: 'CNIC*' | 'Principal CNIC*',
  ) {}

  field(labelText: string): Locator {
    return fieldByLabel(this.page, labelText).nth(this.index);
  }

  textbox(labelText: string) {
    return this.field(labelText).getByRole('textbox');
  }

  async errorFor(labelText: string): Promise<string> {
    return getFieldErrorText(this.field(labelText));
  }

  get profilePictureDropzone() {
    const label = this.index === 0 ? 'Owner Profile Picture*' : 'Principal Profile Picture*';
    return this.page
      .getByText(label)
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('input[type="file"]');
  }

  async uploadProfilePicture(file: TestFile): Promise<void> {
    await this.profilePictureDropzone.setInputFiles(file);
  }

  async fillName(value: string): Promise<void> {
    await this.textbox('Name*').fill(value);
  }

  async selectGender(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.field('Gender*').getByRole('combobox'), value);
  }

  async fillCnic(value: string): Promise<void> {
    await this.textbox(this.cnicLabel).fill(value);
  }

  async fillMobile(value: string): Promise<void> {
    await this.textbox('Mobile No*').fill(value);
  }

  async fillLandline(value: string): Promise<void> {
    await this.textbox('Landline No').fill(value);
  }

  async fillEmail(value: string): Promise<void> {
    await this.textbox('Email*').fill(value);
  }

  async fillAddress(value: string): Promise<void> {
    await this.textbox('Address*').fill(value);
  }

  async fillValid(overrides: Partial<typeof validOwnerProfile> = {}): Promise<void> {
    const data = { ...validOwnerProfile, ...overrides };
    await this.fillName(data.name);
    await this.selectGender(data.gender);
    await this.fillCnic(data.cnic);
    await this.fillMobile(data.mobile);
    await this.fillAddress(data.address);
  }
}

/** Step 1, sub-step 3: Ownership Details — TC-021..TC-029. */
export class OwnershipDetailsPage {
  readonly owner: PersonSection;
  readonly principal: PersonSection;

  constructor(private readonly page: Page) {
    this.owner = new PersonSection(page, 0, 'CNIC*');
    this.principal = new PersonSection(page, 1, 'Principal CNIC*');
  }

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  get sameAsOwnerCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Owner and Principal are the same' });
  }

  async setOwnerAndPrincipalSame(checked: boolean): Promise<void> {
    const checkbox = this.sameAsOwnerCheckbox;
    if ((await checkbox.isChecked()) !== checked) {
      await checkbox.click();
    }
  }
}
