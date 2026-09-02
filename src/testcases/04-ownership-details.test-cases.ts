import { expect, test } from '../fixtures';
import { OwnershipDetailsPage } from '../pages/ownership-details.page';
import { expectNextEnabled } from '../helpers/validation';
import { unsupportedFormatFile, oversizedImageFile } from '../helpers/test-files';
import { ownerProfilePicture } from '../helpers/asset-files';
import {
  ownerNameCases,
  cnicCases,
  ownerMobileCases,
  ownerLandlineCases,
  ownerEmailCases,
  ownerAddressCases,
} from '../data/ownership.data';
import type { FieldCase } from '../data/basic-info.data';

export function registerOwnershipDetailsTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const ownership = new OwnershipDetailsPage(page);
    await ownership.goto();
  });

  // TC-021 Owner Profile Image
  test.describe('TC-021 Owner Profile Image', () => {
    test('[Positive] a valid image is uploaded and previewed', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.uploadProfilePicture(ownerProfilePicture());
      await expect(ownership.owner.profilePictureDropzone).toHaveJSProperty('files.length', 1);
    });

    test('[Negative] an unsupported file format is not accepted', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.uploadProfilePicture(unsupportedFormatFile());
      await expect(ownership.owner.profilePictureDropzone).not.toHaveJSProperty('files.length', 1);
    });

    test('[Negative] an oversized file is not accepted', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.uploadProfilePicture(oversizedImageFile());
      await expect(ownership.owner.profilePictureDropzone).not.toHaveJSProperty('files.length', 1);
    });

    test('[Negative] Next stays disabled while the profile picture is missing (mandatory field)', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.fillValid();
      await ownership.setOwnerAndPrincipalSame(true);
      await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    });
  });

  // TC-023 Owner Gender
  test.describe('TC-023 Owner Gender', () => {
    test('[Positive] "Male" is selected and saved', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.selectGender('Male');
      await expect(ownership.owner.field('Gender*').getByRole('combobox')).toHaveText('Male');
    });

    test('[Positive] "Female" is selected correctly', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.selectGender('Female');
      await expect(ownership.owner.field('Gender*').getByRole('combobox')).toHaveText('Female');
    });
  });

  // TC-029 Owner/Principal checkbox
  test.describe('TC-029 Owner/Principal checkbox', () => {
    test('[Positive] checking it copies Owner details into Principal and disables that section', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.uploadProfilePicture(ownerProfilePicture());
      await ownership.owner.fillValid();

      await ownership.setOwnerAndPrincipalSame(true);

      await expect(ownership.principal.textbox('Name*')).toBeDisabled();
      await expect(ownership.principal.textbox('Name*')).toHaveValue(await ownership.owner.textbox('Name*').inputValue());
      await expect(ownership.principal.textbox('Principal CNIC*')).toBeDisabled();
    });

    test('[Positive] unchecking it re-enables the Principal section for independent entry', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.setOwnerAndPrincipalSame(true);
      await ownership.setOwnerAndPrincipalSame(false);
      await expect(ownership.principal.textbox('Name*')).toBeEnabled();
    });

    test('[Edge] toggling repeatedly leaves no residual/incorrect data behind', async ({ page }) => {
      const ownership = new OwnershipDetailsPage(page);
      await ownership.owner.uploadProfilePicture(ownerProfilePicture());
      await ownership.owner.fillValid();
      // Verified live: "Same as Owner" copies the account's saved owner name, not
      // whatever is currently (unsaved) typed into the Owner Name field — so we read
      // the live value back rather than asserting a hardcoded override echoes through.
      const ownerName = await ownership.owner.textbox('Name*').inputValue();

      await ownership.setOwnerAndPrincipalSame(true);
      await expect(ownership.principal.textbox('Name*')).toHaveValue(ownerName);

      await ownership.setOwnerAndPrincipalSame(false);
      await ownership.principal.fillName('Independent Principal');
      await expect(ownership.principal.textbox('Name*')).toHaveValue('Independent Principal');

      await ownership.setOwnerAndPrincipalSame(true);
      await expect(ownership.principal.textbox('Name*')).toHaveValue(ownerName);
    });
  });

  // ---- Generic data-driven text-field cases (Owner section) ---------------
  function runFieldCases(
    tcId: string,
    fieldLabel: string,
    cases: FieldCase[],
    fill: (ownership: OwnershipDetailsPage, value: string) => Promise<void>,
  ) {
    test.describe(`${tcId} Owner ${fieldLabel}`, () => {
      for (const c of cases) {
        test(`[${c.scenario}] ${c.description}`, async ({ page }) => {
          const ownership = new OwnershipDetailsPage(page);
          await ownership.owner.uploadProfilePicture(ownerProfilePicture());
          await ownership.owner.fillValid();
          await fill(ownership, c.value);
          await ownership.owner.textbox(fieldLabel).blur();

          if (c.expectError) {
            await expect(async () => {
              expect(await ownership.owner.errorFor(fieldLabel)).toMatch(c.expectError!);
            }).toPass();
          } else {
            await expect(async () => {
              expect(await ownership.owner.errorFor(fieldLabel)).toBe('');
            }).toPass();
          }
        });
      }
    });
  }

  runFieldCases('TC-022', 'Name*', ownerNameCases, (o, v) => o.owner.fillName(v));
  runFieldCases('TC-024', 'CNIC*', cnicCases, (o, v) => o.owner.fillCnic(v));
  runFieldCases('TC-025', 'Mobile No*', ownerMobileCases, (o, v) => o.owner.fillMobile(v));
  runFieldCases('TC-026', 'Landline No', ownerLandlineCases, (o, v) => o.owner.fillLandline(v));
  runFieldCases('TC-027', 'Email*', ownerEmailCases, (o, v) => o.owner.fillEmail(v));
  runFieldCases('TC-028', 'Address*', ownerAddressCases, (o, v) => o.owner.fillAddress(v));

  test('[Cross-field] Next stays disabled until Owner (or Owner+Principal) is fully valid', async ({ page }) => {
    const ownership = new OwnershipDetailsPage(page);
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    await ownership.owner.uploadProfilePicture(ownerProfilePicture());
    await ownership.owner.fillValid();
    await ownership.setOwnerAndPrincipalSame(true);
    await expectNextEnabled(page);
  });
}

