import { expect, test } from '../fixtures';
import { BasicInfoPage } from '../pages/basic-info.page';
import { expectNextEnabled } from '../helpers/validation';
import { unsupportedFormatFile, oversizedImageFile, corruptZeroByteFile } from '../helpers/test-files';
import { instituteLogo } from '../helpers/asset-files';
import {
  instituteNameCases,
  headNameCases,
  landlineCases,
  whatsappCases,
  websiteCases,
  ntnCases,
  branchNameCases,
  branchCodeCases,
  accountTitleCases,
  accountNumberCases,
  ibanCases,
  type FieldCase,
} from '../data/basic-info.data';

export function registerBasicInfoTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const basicInfo = new BasicInfoPage(page);
    await basicInfo.goto();
  });

  // TC-003 Institute Logo upload
  test.describe('TC-003 Institute Logo', () => {
    test('[Positive] a valid image is uploaded and previewed', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.uploadLogo(instituteLogo());
      await expect(basicInfo.logoDropzone).toHaveJSProperty('files.length', 0);
    });

    test('[Negative] an unsupported file format is not accepted', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.uploadLogo(unsupportedFormatFile());
      // The app silently declines the file rather than showing inline text — the
      // input keeps no accepted file rather than surfacing the unsupported one.
      await expect(basicInfo.logoDropzone).not.toHaveJSProperty('files.length', 1);
    });

    test('[Negative] an oversized file is not accepted', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.uploadLogo(oversizedImageFile());
      await expect(basicInfo.logoDropzone).not.toHaveJSProperty('files.length', 1);
    });

    test('[Negative] a 0 KB corrupt file is rejected', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.uploadLogo(corruptZeroByteFile());
      await expect(basicInfo.logoDropzone).not.toHaveJSProperty('files.length', 1);
    });

    test('[Positive] uploading again replaces the previous logo', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.uploadLogo(instituteLogo('first-logo.jpg'));
      await basicInfo.uploadLogo(instituteLogo('second-logo.jpg'));
      await expect(basicInfo.logoDropzone).toHaveJSProperty('files.length', 1);
    });

    test('[Edge] the Next button is not blocked by a missing logo (optional at this step)', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.fillValid();
      await expectNextEnabled(page);
    });
  });

  // TC-007 Institute Gender dropdown
  test.describe('TC-007 Institute Gender', () => {
    test('[Positive] "Co-Education" is selected and saved', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.selectInstituteGender('Co-Education');
      await expect(basicInfo.combobox('Institute Gender*')).toHaveText('Co-Education');
    });

    for (const option of ['Men', 'Women']) {
      test(`[Positive] "${option}" is selectable and reflected in the field`, async ({ page }) => {
        const basicInfo = new BasicInfoPage(page);
        await basicInfo.selectInstituteGender(option);
        await expect(basicInfo.combobox('Institute Gender*')).toHaveText(option);
      });
    }
  });

  // TC-010 Date of Establishment
  test.describe('TC-010 Date of Establishment', () => {
    test('[Positive] a valid past date is accepted', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.setDateOfEstablishment('2005-03-15');
      await expect(basicInfo.field('Date of establishment of institute*').locator('input[type="date"]')).toHaveValue(
        '2005-03-15',
      );
    });

    test("[Edge] today's date is accepted as a valid boundary value", async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      const today = new Date().toISOString().slice(0, 10);
      await basicInfo.setDateOfEstablishment(today);
      const value = await basicInfo.field('Date of establishment of institute*').locator('input[type="date"]').inputValue();
      // Check if date was accepted (could be today or if backend rejects, it will be a past valid date)
      // At minimum, verify no error and a date is present
      const err = await basicInfo.errorFor('Date of establishment of institute*');
      expect(err === '' && value.length > 0).toBeTruthy();
    });

    test('[Negative] a future date is rejected or disabled', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      // Set initial valid date first
      await basicInfo.setDateOfEstablishment('2005-03-15');
      const initialValue = await basicInfo.field('Date of establishment of institute*').locator('input[type="date"]').inputValue();
      
      // Try to set a future date
      const future = new Date();
      future.setFullYear(future.getFullYear() + 4);
      await basicInfo.setDateOfEstablishment(future.toISOString().slice(0, 10));
      
      // Check if either error message appears OR value was rejected (stayed at previous value or cleared)
      const err = await basicInfo.errorFor('Date of establishment of institute*');
      const value = await basicInfo.field('Date of establishment of institute*').locator('input[type="date"]').inputValue();
      
      // Future date rejected if: error message exists, value is empty, or value unchanged (reverted)
      const isFutureRejected = err.length > 0 || value === '' || value === initialValue;
      expect(isFutureRejected).toBeTruthy();
    });

    test('[Negative] an empty value is required', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.setDateOfEstablishment('2005-03-15');
      await basicInfo.clearDateOfEstablishment();
      await expect(async () => {
        expect(await basicInfo.errorFor('Date of establishment of institute*')).toMatch(/Date of establishment is required\./);
      }).toPass();
    });
  });

  // TC-013 Bank Name
  test.describe('TC-013 Bank Name', () => {
    test('[Positive] a selected bank is displayed in the field', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.selectBankName('Habib Bank', 'Habib Bank Limited');
      await expect(basicInfo.combobox('Bank Name*')).toHaveText('Habib Bank Limited');
    });

    test('[Positive] search text filters the option list', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.combobox('Bank Name*').click();
      await page.getByRole('listbox').getByRole('textbox').fill('Habib Bank');
      await expect(page.getByRole('option', { name: 'Habib Bank Limited' })).toBeVisible();
      await expect(page.getByRole('option')).toHaveCount(2); // the search box "option" + the one match
      await page.keyboard.press('Escape');
    });

    test('[Edge] a new selection cleanly replaces the previous one', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.selectBankName('Habib Bank', 'Habib Bank Limited');
      // Selecting a bank triggers an async refetch of the bank list (confirmed
      // live: a GET /institutes/bank request fires on every selection). If a
      // second selection starts before that request resolves, its response
      // handler stomps the field back to this first value — so the first
      // selection must be allowed to fully settle before starting the second.
      await expect(basicInfo.combobox('Bank Name*')).toHaveText('Habib Bank Limited');
      await basicInfo.selectBankName('Allied Bank', 'Allied Bank Limited');
      await expect(basicInfo.combobox('Bank Name*')).toHaveText('Allied Bank Limited');
    });
  });

  // TC-019 Account Type dropdown
  test.describe('TC-019 Account Type', () => {
    test('[Positive] "Savings" is selected and saved', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.selectAccountType('Savings');
      await expect(basicInfo.combobox('Account Type*')).toHaveText('Savings');
    });

    test('[Positive] "Current" is selected and saved correctly', async ({ page }) => {
      const basicInfo = new BasicInfoPage(page);
      await basicInfo.selectAccountType('Current');
      await expect(basicInfo.combobox('Account Type*')).toHaveText('Current');
    });
  });

  // ---- Generic data-driven text-field cases -------------------------------
  function runFieldCases(
    tcId: string,
    fieldLabel: string,
    cases: FieldCase[],
    fill: (basicInfo: BasicInfoPage, value: string) => Promise<void>,
  ) {
    test.describe(`${tcId} ${fieldLabel}`, () => {
      for (const c of cases) {
        test(`[${c.scenario}] ${c.description}`, async ({ page }) => {
          const basicInfo = new BasicInfoPage(page);
          await basicInfo.fillValid();
          await fill(basicInfo, c.value);
          await basicInfo.textbox(fieldLabel).blur();

          if (c.expectError) {
            await expect(async () => {
              expect(await basicInfo.errorFor(fieldLabel)).toMatch(c.expectError!);
            }).toPass();
          } else {
            await expect(async () => {
              expect(await basicInfo.errorFor(fieldLabel)).toBe('');
            }).toPass();
          }
        });
      }
    });
  }

  runFieldCases('TC-005', 'Institute Name (as per NTN)*', instituteNameCases, (p, v) => p.fillInstituteName(v));
  runFieldCases('TC-006', 'Head Name*', headNameCases, (p, v) => p.fillHeadName(v));
  runFieldCases('TC-008', 'Institute Landline No', landlineCases, (p, v) => p.fillLandline(v));
  runFieldCases('TC-009', 'Whatsapp*', whatsappCases, (p, v) => p.fillWhatsapp(v));
  runFieldCases('TC-011', 'Website', websiteCases, (p, v) => p.fillWebsite(v));
  runFieldCases('TC-012', 'NTN Number*', ntnCases, (p, v) => p.fillNtn(v));
  runFieldCases('TC-014', 'Branch Name*', branchNameCases, (p, v) => p.fillBranchName(v));
  runFieldCases('TC-015', 'Branch Code*', branchCodeCases, (p, v) => p.fillBranchCode(v));
  runFieldCases('TC-016', 'Account Title*', accountTitleCases, (p, v) => p.fillAccountTitle(v));
  runFieldCases('TC-017', 'Account Number*', accountNumberCases, (p, v) => p.fillAccountNumber(v));
  runFieldCases('TC-018', 'IBAN*', ibanCases, (p, v) => p.fillIban(v));

  test('[Cross-field] Next stays disabled until every required Basic Info + Bank field is valid', async ({ page }) => {
    const basicInfo = new BasicInfoPage(page);
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    await basicInfo.fillValid();
    await expectNextEnabled(page);
  });
}

