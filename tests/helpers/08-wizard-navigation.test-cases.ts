// Test case implementation imported by tests/registration/08-wizard-navigation.spec.ts.
import { expect, test } from '../../src/fixtures';
import { BasicInfoPage } from '../../src/pages/basic-info.page';
import { AddressDetailsPage } from '../../src/pages/address-details.page';
import { OwnershipDetailsPage } from '../../src/pages/ownership-details.page';
import { BuildingCoveredAreaPage } from '../../src/pages/building-covered-area.page';
import { AreaSectionsPage } from '../../src/pages/area-sections.page';
import { OtherFacilitiesPage } from '../../src/pages/other-facilities.page';
import { expectNextDisabled, expectNextEnabled, nextButton } from '../../src/helpers/validation';
import { ownerProfilePicture } from '../../src/helpers/asset-files';
import { otherFacilityCheckboxes, mandatoryOtherFacility } from '../../src/data/registration-data';

const runId = Date.now();

// TC-046/047/048 — Wizard Navigation: a full, in-order walk of all 7 steps, checking at
// each step that Next is blocked with a required field missing (TC-047) and unblocked
// once the step is genuinely valid (TC-046), finishing with the Back-retains-data and
// boundary-data edge cases from TC-048.
export function registerWizardNavigationTestCases(): void {
  test('[Step 1 Navigation] Basic Info blocks then allows proceeding to Address Details', async ({ page }) => {
    const basicInfo = new BasicInfoPage(page);
    await basicInfo.goto();
    await expectNextDisabled(page); // TC-047

    await basicInfo.fillValid();
    await expectNextEnabled(page); // TC-046
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/address-details/);
  });

  test('[Step 1 Navigation] Address Details blocks then allows proceeding to Ownership Details', async ({ page }) => {
    const addressDetails = new AddressDetailsPage(page);
    await addressDetails.goto();
    await expectNextDisabled(page);

    await addressDetails.fillValid();
    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/ownership-details/);
  });

  test('[Step 1 Navigation] Ownership Details blocks then allows proceeding to Building Details', async ({ page }) => {
    const ownership = new OwnershipDetailsPage(page);
    await ownership.goto();
    await expectNextDisabled(page);

    await ownership.owner.uploadProfilePicture(ownerProfilePicture());
    await ownership.owner.fillValid();
    await ownership.setOwnerAndPrincipalSame(true);
    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/building\/covered-area/);
  });

  test('[Step 2 Navigation] previously entered Step 1 data is retained on Back', async ({ page }) => {
    const covered = new BuildingCoveredAreaPage(page);
    await covered.goto();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/ownership-details/);
    // TC-048 edge: navigating back doesn't wipe what was already saved.
    await expect(page.getByRole('checkbox', { name: 'Owner and Principal are the same' })).toBeChecked();
  });

  test('[Step 3 Navigation] Covered Area blocks then allows proceeding to Indoor Facilities', async ({ page }) => {
    const covered = new BuildingCoveredAreaPage(page);
    await covered.goto();
    await expectNextDisabled(page);

    await covered.fillValid();
    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/indoor-facilities/);
  });

  test('[Step 4 Navigation] Indoor Facilities blocks then allows proceeding to Outdoor Facilities', async ({ page }) => {
    const area = new AreaSectionsPage(page);
    await area.gotoIndoor();
    await expectNextDisabled(page);

    await area.selectTab('Class Rooms');
    await area.addEntry({ label: `Class Rooms nav-${runId}`, length: '1000', width: '1000' });
    await area.selectTab('Labs/Workshops');
    await area.addEntry({ label: `Labs/Workshops nav-${runId}`, length: '800', width: '600' });

    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/outdoor-facilities/);
  });

  test('[Step 5 Navigation] Outdoor Facilities blocks then allows proceeding to Other Facilities', async ({ page }) => {
    const area = new AreaSectionsPage(page);
    await area.gotoOutdoor();
    await expectNextDisabled(page);

    await area.selectTab('Multipurpose Hall / Auditorium');
    await area.addEntry({ label: `Multipurpose Hall nav-${runId}`, length: '2000', width: '1500' });

    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/other-facilities/);
  });

  test('[Step 6 Navigation] Other Facilities blocks then allows proceeding to Document Uploads', async ({ page }) => {
    const facilities = new OtherFacilitiesPage(page);
    await facilities.goto();
    for (const name of otherFacilityCheckboxes) {
      await facilities.check(name, false);
    }
    await expectNextDisabled(page);

    await facilities.check(mandatoryOtherFacility, true);
    await expectNextEnabled(page);
    await nextButton(page).click();
    await expect(page).toHaveURL(/\/attachments/);
  });
}
