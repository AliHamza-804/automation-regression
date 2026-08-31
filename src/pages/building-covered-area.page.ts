import type { Page } from '@playwright/test';
import { selectDropdownOption } from '../helpers/dropdown';
import { fieldByLabel, getFieldErrorText } from '../helpers/validation';
import { validBuildingCoveredArea } from '../data/registration-data';

const URL = '/register-institute/building/covered-area';

/** Step 4: Building Details -> Covered Area — TC-030..TC-034. */
export class BuildingCoveredAreaPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URL);
  }

  get unitCombobox() {
    return this.page.getByRole('combobox', { name: 'Select a unit' });
  }

  get landInMarlaInput() {
    return this.page.getByRole('spinbutton', { name: 'Enter marla units' });
  }

  get marlaValueInput() {
    return this.page.getByRole('spinbutton', { name: 'Enter marla value' });
  }

  get coveredAreaInput() {
    return this.page.locator('input[name="coveredArea"]');
  }

  get totalAreaInput() {
    // Label + "*" render as two separate text nodes, so the outer field
    // container sits two levels above the label text (see fieldByLabel).
    return fieldByLabel(this.page, 'Total Area(In square feet)', undefined, 2).getByRole('spinbutton');
  }

  async errorForLandInMarla(): Promise<string> {
    return getFieldErrorText(fieldByLabel(this.page, 'Land In: Marla*'));
  }

  async errorForMarlaValue(): Promise<string> {
    return getFieldErrorText(fieldByLabel(this.page, 'Marla Value(sq ft in one marla)', undefined, 2));
  }

  async errorForCoveredArea(): Promise<string> {
    return getFieldErrorText(fieldByLabel(this.page, 'Covered Area(In square feet)', undefined, 2));
  }

  async errorForTotalArea(): Promise<string> {
    return getFieldErrorText(fieldByLabel(this.page, 'Total Area(In square feet)', undefined, 2));
  }

  async selectUnit(value: string): Promise<void> {
    await selectDropdownOption(this.page, this.unitCombobox, value);
  }

  async fillLandInMarla(value: string): Promise<void> {
    await this.landInMarlaInput.fill(value);
  }

  async fillMarlaValue(value: string): Promise<void> {
    await this.marlaValueInput.fill(value);
  }

  async fillCoveredArea(value: string): Promise<void> {
    await this.coveredAreaInput.fill(value);
  }

  async fillValid(overrides: Partial<typeof validBuildingCoveredArea> = {}): Promise<void> {
    const data = { ...validBuildingCoveredArea, ...overrides };
    await this.selectUnit(data.unit);
    await this.fillLandInMarla(data.landInMarla);
    await this.fillMarlaValue(data.marlaValue);
    await this.fillCoveredArea(data.coveredArea);
  }
}
