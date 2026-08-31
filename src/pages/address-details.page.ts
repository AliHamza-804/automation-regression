import { expect, type Page } from '@playwright/test';
import { searchAndSelectDropdownOption, listDropdownOptions } from '../helpers/dropdown';
import { fieldByLabel, getFieldErrorText } from '../helpers/validation';
import { validAddressDetails } from '../data/registration-data';

const URL = '/register-institute/institute/address-details';

/** Step 1, sub-step 2: Address Details — TC-020, TC-040/041/042 (cascading location dropdowns + map). */
export class AddressDetailsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  field(labelText: string) {
    return fieldByLabel(this.page, labelText);
  }

  combobox(labelText: string) {
    return this.field(labelText).getByRole('combobox');
  }

  async errorFor(labelText: string): Promise<string> {
    return getFieldErrorText(this.field(labelText));
  }

  /** Province is pre-set to "Punjab" and always disabled/read-only. */
  get provinceCombobox() {
    return this.combobox('Province*');
  }

  async selectDivision(searchText: string, optionText: string): Promise<void> {
    await searchAndSelectDropdownOption(this.page, this.combobox('Division*'), searchText, optionText);
  }

  async selectDistrict(optionText: string): Promise<void> {
    await searchAndSelectDropdownOption(this.page, this.combobox('District*'), optionText, optionText);
  }

  async selectCity(optionText: string): Promise<void> {
    await searchAndSelectDropdownOption(this.page, this.combobox('City*'), optionText, optionText);
  }

  async selectTehsil(optionText: string): Promise<void> {
    await searchAndSelectDropdownOption(this.page, this.combobox('Tehsil*'), optionText, optionText);
  }

  /** NA/PP/UC are optional in this build (no asterisk, Next enables without them) and their
   *  option lists are seat-specific data this suite doesn't hardcode — this just picks whichever
   *  option the cascade resolves to first, for the "verify a selection sticks" positive cases. */
  async selectFirstAvailableOption(labelText: string): Promise<string | undefined> {
    const combobox = this.combobox(labelText);
    const options = await listDropdownOptions(this.page, combobox);
    if (options.length === 0) return undefined;
    await combobox.click();
    await this.page.getByRole('option', { name: options[0], exact: true }).click();
    return options[0];
  }

  get nationalConstituencyCombobox() {
    return this.combobox('National Constituency (NA)');
  }

  get provincialConstituencyCombobox() {
    return this.combobox('Provincial Constituency (PP)');
  }

  get unionCouncilCombobox() {
    return this.combobox('Union Council (UC)');
  }

  // ---- Map location picker ------------------------------------------------
  get locationField() {
    return this.field('Location*').getByRole('textbox');
  }

  private get mapDialog() {
    return this.page.getByText(/Select Institute Location/);
  }

  async openLocationPicker(): Promise<void> {
    await this.locationField.click();
    await expect(this.mapDialog).toBeVisible();
  }

  async searchLocation(query: string): Promise<void> {
    await this.page.getByPlaceholder('Search for a location...').fill(query);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  async confirmLocation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirm Location' }).click();
    await expect(this.mapDialog).toBeHidden();
  }

  async cancelLocationPicker(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(this.mapDialog).toBeHidden();
  }

  /** Opens the map and accepts whatever the default pin/city center resolves to. */
  async pickDefaultLocation(): Promise<void> {
    await this.openLocationPicker();
    await this.confirmLocation();
  }

  async fillAddress(value: string): Promise<void> {
    await this.field('Address of the Institute*').getByRole('textbox').fill(value);
  }

  /** Fills every required field (Division..Tehsil, map location, address) with known-good data. */
  async fillValid(overrides: Partial<typeof validAddressDetails> = {}): Promise<void> {
    const data = { ...validAddressDetails, ...overrides };
    await this.selectDivision(data.division, data.division);
    await this.selectDistrict(data.district);
    await this.selectCity(data.city);
    await this.selectTehsil(data.tehsil);
    await this.pickDefaultLocation();
    await this.fillAddress(data.address);
  }
}
