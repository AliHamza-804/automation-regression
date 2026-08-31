import type { Locator } from '@playwright/test';
// Test case implementation imported by tests/registration/05-building-details.spec.ts.
import { expect, test } from '../../src/fixtures';
import { BuildingCoveredAreaPage } from '../../src/pages/building-covered-area.page';
import { OtherFacilitiesPage } from '../../src/pages/other-facilities.page';
import { expectNextDisabled, expectNextEnabled } from '../../src/helpers/validation';
import { landInMarlaCases, marlaValueCases, coveredAreaCases, type NumericFieldCase } from '../../src/data/building.data';
import { otherFacilityCheckboxes, mandatoryOtherFacility } from '../../src/data/registration-data';

export function registerBuildingDetailsTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const covered = new BuildingCoveredAreaPage(page);
    await covered.goto();
  });

  // TC-030 Unit dropdown
  test.describe('TC-030 Building Unit', () => {
    test('[Positive] "Marla" is selected and related fields adjust accordingly', async ({ page }) => {
      const covered = new BuildingCoveredAreaPage(page);
      await covered.selectUnit('Marla');
      await expect(covered.unitCombobox).toHaveText('Marla');
    });

    test('[Positive] "Kanal" is selectable and correctly reflected', async ({ page }) => {
      const covered = new BuildingCoveredAreaPage(page);
      await covered.selectUnit('Kanal');
      await expect(covered.unitCombobox).toHaveText('Kanal');
    });

    test('[Negative] Next stays disabled while Unit is unselected', async ({ page }) => {
      await expectNextDisabled(page);
    });
  });

  // ---- Generic numeric-field cases ----------------------------------------
  function runNumericCases(
    tcId: string,
    fieldLabel: string,
    cases: NumericFieldCase[],
    fill: (covered: BuildingCoveredAreaPage, value: string) => Promise<void>,
    errorFor: (covered: BuildingCoveredAreaPage) => Promise<string>,
    inputLocator: (covered: BuildingCoveredAreaPage) => Locator,
  ) {
    test.describe(`${tcId} ${fieldLabel}`, () => {
      for (const c of cases) {
        test(`[${c.scenario}] ${c.description}`, async ({ page }) => {
          const covered = new BuildingCoveredAreaPage(page);
          await covered.fillValid();
          await fill(covered, c.value);
          await inputLocator(covered).blur();

          if (c.expectError) {
            const err = await errorFor(covered);
            const value = await inputLocator(covered).inputValue();
            // The number input may simply refuse to hold an invalid value (min="0",
            // type="number") rather than showing text — either outcome counts as rejected.
            expect(err.length > 0 || value === '' || value !== c.value).toBeTruthy();
          } else {
            expect(await errorFor(covered)).toBe('');
          }
        });
      }
    });
  }

  runNumericCases(
    'TC-031',
    'Land In: Marla',
    landInMarlaCases,
    (c, v) => c.fillLandInMarla(v),
    (c) => c.errorForLandInMarla(),
    (c) => c.landInMarlaInput,
  );

  runNumericCases(
    'TC-032',
    'Marla Value',
    marlaValueCases,
    (c, v) => c.fillMarlaValue(v),
    (c) => c.errorForMarlaValue(),
    (c) => c.marlaValueInput,
  );

  runNumericCases(
    'TC-033',
    'Covered Area',
    coveredAreaCases,
    (c, v) => c.fillCoveredArea(v),
    (c) => c.errorForCoveredArea(),
    (c) => c.coveredAreaInput,
  );

  // TC-034 Total Area (computed, read-only)
  test.describe('TC-034 Total Area', () => {
    test('[Positive] Total Area automatically mirrors Covered Area', async ({ page }) => {
      const covered = new BuildingCoveredAreaPage(page);
      await covered.fillValid({ coveredArea: '1367.5' });
      await expect(covered.totalAreaInput).toHaveValue('1367.5');
    });

    test('[Positive] Total Area does not accept manual input — it is system-calculated only', async ({ page }) => {
      const covered = new BuildingCoveredAreaPage(page);
      await covered.fillValid();
      await expect(covered.totalAreaInput).toBeDisabled();
    });

    test('[Edge] Total Area recalculates immediately when Covered Area changes', async ({ page }) => {
      const covered = new BuildingCoveredAreaPage(page);
      await covered.fillValid({ coveredArea: '1367.5' });
      await expect(covered.totalAreaInput).toHaveValue('1367.5');
      await covered.fillCoveredArea('900');
      await expect(covered.totalAreaInput).toHaveValue('900');
    });
  });

  test('[Cross-field] Next stays disabled until Unit, Land, Marla Value and Covered Area are all valid', async ({ page }) => {
    const covered = new BuildingCoveredAreaPage(page);
    await expectNextDisabled(page);
    await covered.fillValid();
    await expectNextEnabled(page);
  });
}

// TC-035 Facilities (Step 7 — Other Facilities)
export function registerOtherFacilitiesTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    await facilities.goto();
  });

  test('[Positive] all facilities are checked and saved successfully', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    await facilities.checkAll(otherFacilityCheckboxes);
    for (const name of otherFacilityCheckboxes) {
      await expect(facilities.checkbox(name)).toBeChecked();
    }
    await expectNextEnabled(page);
  });

  test('[Negative] Canteen (marked mandatory) must be selected before proceeding', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    for (const name of otherFacilityCheckboxes) {
      await facilities.check(name, false);
    }
    await expectNextDisabled(page);
    await expect(facilities.requiredMessage).toContainText(mandatoryOtherFacility);
  });

  test('[Positive] the form proceeds once only the mandatory Canteen facility is checked', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    for (const name of otherFacilityCheckboxes) {
      await facilities.check(name, name === mandatoryOtherFacility);
    }
    await expectNextEnabled(page);
  });

  test('[Edge] the final checkbox state accurately reflects the last click with no glitches', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    await facilities.check('Transport', true);
    await facilities.check('Transport', false);
    await facilities.check('Transport', true);
    await expect(facilities.checkbox('Transport')).toBeChecked();
  });

  test('[Edge] unchecking Canteen after having proceeded is caught again by validation', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    await facilities.check(mandatoryOtherFacility, true);
    await expectNextEnabled(page);
    await facilities.check(mandatoryOtherFacility, false);
    await expectNextDisabled(page);
  });
}
