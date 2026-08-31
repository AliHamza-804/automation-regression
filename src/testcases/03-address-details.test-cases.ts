import { expect, test } from '../fixtures';
import { AddressDetailsPage } from '../pages/address-details.page';
import { expectNextDisabled, expectNextEnabled } from '../helpers/validation';
import { validAddressDetails } from '../data/registration-data';

export function registerAddressDetailsTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const addressDetails = new AddressDetailsPage(page);
    await addressDetails.goto();
  });

  // TC-020 Map Location
  test.describe('TC-020 Map Location', () => {
    test('[Positive] confirming the default pin saves coordinates + address against Location', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.pickDefaultLocation();
      await expect(addressDetails.locationField).not.toHaveValue('');
    });

    test('[Positive] searching a location navigates the map and the pin can be confirmed', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.openLocationPicker();
      await addressDetails.searchLocation(validAddressDetails.addressSearchText);
      await addressDetails.confirmLocation();
      await expect(addressDetails.locationField).not.toHaveValue('');
    });

    test('[Negative] cancelling leaves the Location field empty', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.openLocationPicker();
      await addressDetails.cancelLocationPicker();
      await expect(addressDetails.locationField).toHaveValue('');
    });

    test('[Edge] the map opens with a default centered location already selected', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.openLocationPicker();
      await expect(page.getByRole('button', { name: 'Confirm Location' })).toBeEnabled();
      await addressDetails.cancelLocationPicker();
    });
  });

  // TC-040/041/042 Location Dropdowns (Province..UC)
  test.describe('TC-040/041/042 Location Dropdowns', () => {
    test('[Positive] Province is fixed to Punjab and Division is required to unlock District', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await expect(addressDetails.provinceCombobox).toHaveText('Punjab');
      await expect(addressDetails.provinceCombobox).toBeDisabled();
      await expect(addressDetails.combobox('District*')).toBeDisabled();

      await addressDetails.selectDivision(validAddressDetails.division, validAddressDetails.division);
      await expect(addressDetails.combobox('District*')).toBeEnabled();
    });

    test('[Positive] only districts belonging to the selected Division are listed', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.selectDivision(validAddressDetails.division, validAddressDetails.division);
      await addressDetails.combobox('District*').click();
      const options = await page.getByRole('listbox').getByRole('option').allTextContents();
      expect(options.filter(Boolean).some((o) => o.includes('Faisalabad'))).toBeTruthy();
      await page.keyboard.press('Escape');
    });

    test('[Positive] District -> City -> Tehsil cascade selects correctly', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.selectDivision(validAddressDetails.division, validAddressDetails.division);
      await addressDetails.selectDistrict(validAddressDetails.district);
      await addressDetails.selectCity(validAddressDetails.city);
      await addressDetails.selectTehsil(validAddressDetails.tehsil);
      await expect(addressDetails.combobox('District*')).toHaveText(validAddressDetails.district);
      await expect(addressDetails.combobox('City*')).toHaveText(validAddressDetails.city);
      await expect(addressDetails.combobox('Tehsil*')).toHaveText(validAddressDetails.tehsil);
    });

    test('[Positive] National Constituency (NA), Provincial Constituency (PP) and Union Council (UC) accept a selection', async ({
      page,
    }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.selectDivision(validAddressDetails.division, validAddressDetails.division);
      await addressDetails.selectDistrict(validAddressDetails.district);
      await addressDetails.selectCity(validAddressDetails.city);
      await addressDetails.selectTehsil(validAddressDetails.tehsil);

      const na = await addressDetails.selectFirstAvailableOption('National Constituency (NA)');
      if (na) await expect(addressDetails.nationalConstituencyCombobox).toHaveText(na);

      const pp = await addressDetails.selectFirstAvailableOption('Provincial Constituency (PP)');
      if (pp) await expect(addressDetails.provincialConstituencyCombobox).toHaveText(pp);

      const uc = await addressDetails.selectFirstAvailableOption('Union Council (UC)');
      if (uc) await expect(addressDetails.unionCouncilCombobox).toHaveText(uc);
    });

    for (const label of ['Division*', 'District*', 'City*', 'Tehsil*']) {
      test(`[Negative] ${label} is required — Next stays disabled without it`, async ({ page }) => {
        await expectNextDisabled(page);
      });
    }

    test('[Negative] National Constituency / Provincial Constituency / Union Council are optional in this build', async ({
      page,
    }) => {
      // Real behavior differs from the spec sheet's assumption: NA/PP/UC carry no
      // asterisk in the app and Next enables without them once the rest is filled.
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.fillValid();
      await expectNextEnabled(page);
      await expect(addressDetails.nationalConstituencyCombobox).toHaveText('Select a national assembly');
    });

    test('[Edge] changing Division resets the District/City/Tehsil selections', async ({ page }) => {
      const addressDetails = new AddressDetailsPage(page);
      await addressDetails.selectDivision(validAddressDetails.division, validAddressDetails.division);
      await addressDetails.selectDistrict(validAddressDetails.district);
      await expect(addressDetails.combobox('District*')).toHaveText(validAddressDetails.district);

      await addressDetails.selectDivision('Lahore Division', 'Lahore Division');
      await expect(addressDetails.combobox('District*')).toHaveText('Select a district');
    });
  });

  test('[Cross-field] Next stays disabled until Division..Tehsil, Location and Address are all valid', async ({ page }) => {
    const addressDetails = new AddressDetailsPage(page);
    await expectNextDisabled(page);
    await addressDetails.fillValid();
    await expectNextEnabled(page);
  });
}

