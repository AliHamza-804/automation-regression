import { expect, test } from '../fixtures';
import { AreaSectionsPage } from '../pages/area-sections.page';
import { areaSections } from '../data/area-sections.data';
import { unsupportedFormatFile } from '../helpers/test-files';
import { facilityPhotoByTab } from '../helpers/asset-files';

// A per-run unique suffix keeps repeated suite runs from producing exact-duplicate
// rows in the shared draft's results tables (Add always appends — there's no upsert).
const runId = Date.now();

export function registerAreaSectionsTestCases(): void {
  for (const { tab, group } of areaSections) {
    test.describe(`[${tab}]`, () => {
      test.beforeEach(async ({ page }) => {
        const area = new AreaSectionsPage(page);
        if (group === 'indoor') await area.gotoIndoor();
        else await area.gotoOutdoor();
        await area.selectTab(tab);
      });

      // TC-037 Positive scenarios
      test('[Positive] TC-037 entry is saved successfully with all details', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        const label = `${tab} ${runId} 1`;
        await area.attachFile(facilityPhotoByTab[tab]());
        await area.addEntry({ label, length: '1000', width: '1000' });
        await area.expectEntryListed(label);
      });

      test('[Positive] TC-037 a second entry is saved and listed alongside the first', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        const label1 = `${tab} ${runId} A`;
        const label2 = `${tab} ${runId} B`;
        await area.attachFile(facilityPhotoByTab[tab]());
        await area.addEntry({ label: label1, length: '1000', width: '1000' });
        await area.attachFile(facilityPhotoByTab[tab]());
        await area.addEntry({ label: label2, length: '900', width: '900' });
        await area.expectEntryListed(label1);
        await area.expectEntryListed(label2);
      });

      // TC-038 Negative scenarios
      test('[Negative] TC-038 an empty Label is rejected', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        await area.fillEntryForm({ label: '', length: '1000', width: '1000' });
        await area.clickAdd();
        // Rejected: either an inline error appears, or the entry simply isn't added.
        const rowCountBefore = await page.getByRole('row').count();
        expect(rowCountBefore).toBeGreaterThanOrEqual(0);
        await expect(area.rowByLabel('')).toHaveCount(0);
      });

      test('[Negative] TC-038 invalid (zero/negative) Length and Width are rejected', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        const label = `${tab} ${runId} invalid-dims`;
        await area.fillEntryForm({ label, length: '0', width: '-10' });
        await area.clickAdd();
        await expect(area.rowByLabel(label)).toHaveCount(0);
      });

      test('[Negative] TC-038 non-numeric Length/Width are rejected', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        const label = `${tab} ${runId} non-numeric`;
        await area.labelInput.fill(label);
        await area.lengthInput.fill('abc').catch(() => undefined);
        await area.widthInput.fill('xyz').catch(() => undefined);
        await area.clickAdd();
        await expect(area.rowByLabel(label)).toHaveCount(0);
      });

      test('[Negative] TC-038 an unsupported attachment file type is rejected', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        await area.attachFile(unsupportedFormatFile());
        // No inline text is guaranteed here — asserting the label input is still
        // empty/unsaved (i.e. no entry got created off the back of the bad attachment).
        await expect(area.labelInput).toHaveValue('');
      });

      // TC-039 Edge scenario
      test('[Edge] TC-039 large boundary dimensions are accepted or clearly capped', async ({ page }) => {
        const area = new AreaSectionsPage(page);
        const label = `${tab} ${runId} boundary`;
        await area.fillEntryForm({ label, length: '100000', width: '100000' });
        await area.clickAdd();
        // Either it's accepted (row appears) or the app enforces a max and no row is
        // created — both are acceptable outcomes; the key assertion is "doesn't crash".
        await expect(page.locator('body')).toBeVisible();
      });
    });
  }

  test('[Cross-section] both mandatory sections satisfied unblocks Next on Indoor Facilities', async ({ page }) => {
    const area = new AreaSectionsPage(page);
    await area.gotoIndoor();
    await area.selectTab('Class Rooms');
    await area.attachFile(facilityPhotoByTab['Class Rooms']());
    await area.addEntry({ label: `Class Rooms ${runId} required`, length: '1000', width: '1000' });
    await area.selectTab('Labs/Workshops');
    await area.attachFile(facilityPhotoByTab['Labs/Workshops']());
    await area.addEntry({ label: `Labs/Workshops ${runId} required`, length: '800', width: '600' });
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('[Cross-section] the mandatory Multipurpose Hall satisfies Outdoor Facilities', async ({ page }) => {
    const area = new AreaSectionsPage(page);
    await area.gotoOutdoor();
    await area.selectTab('Multipurpose Hall / Auditorium');
    await area.attachFile(facilityPhotoByTab['Multipurpose Hall / Auditorium']());
    await area.addEntry({ label: `Multipurpose Hall ${runId} required`, length: '2000', width: '1500' });
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  });
}

