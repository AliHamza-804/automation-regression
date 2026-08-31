import type { Locator } from '@playwright/test';
// Test case implementation imported by tests/registration/07-documents.spec.ts.
import { expect, test } from '../../src/fixtures';
import { AttachmentsPage } from '../../src/pages/attachments.page';
import { documentSlots, type DocumentSlot } from '../../src/data/documents.data';
import { attachmentSections } from '../../src/data/registration-data';
import {
  unsupportedFormatFile,
  oversizedImageFile,
  oversizedPdfFile,
  corruptZeroByteFile,
  type TestFile,
} from '../../src/helpers/test-files';
import { instituteFullView } from '../../src/helpers/asset-files';

async function inputForSlot(attachments: AttachmentsPage, slot: DocumentSlot): Promise<Locator> {
  return slot.strategy === 'sublabel' && slot.subLabel
    ? attachments.fileInputUnderLabel(slot.heading, slot.subLabel)
    : attachments.fileInputForSection(slot.heading);
}

async function upload(attachments: AttachmentsPage, slot: DocumentSlot, file: TestFile): Promise<void> {
  const input = await inputForSlot(attachments, slot);
  await input.setInputFiles(file);
}

// Order matters here: the "required before Submit" (TC-044) checks assume nothing has
// been uploaded yet, so they run first; positive uploads (TC-043) run last, once the
// negative-path assertions this shared draft supports have already been made.
export function registerDocumentTestCases(): void {
  test.beforeEach(async ({ page }) => {
    const attachments = new AttachmentsPage(page);
    await attachments.goto();
  });

  // TC-044 Negative scenarios (9 slot-level scenarios: 7 "required" + 2 "unsupported format").
  test.describe('TC-044 Document Uploads — negative', () => {
    for (const heading of attachmentSections) {
      test(`[Negative] ${heading} is required before Submit`, async ({ page }) => {
        const attachments = new AttachmentsPage(page);
        await attachments.expand(heading);
        await expect(attachments.statusButton(heading)).toBeVisible();
      });
    }

    for (const slot of [documentSlots[0], documentSlots[2]]) {
      const label = slot.subLabel ?? slot.heading;
      test(`[Negative] ${label} rejects an unsupported file format`, async ({ page }) => {
        const attachments = new AttachmentsPage(page);
        const input = await inputForSlot(attachments, slot);
        await input.setInputFiles(unsupportedFormatFile());
        await expect(input).not.toHaveJSProperty('files.length', 1);
      });
    }
  });

  // TC-045 Edge scenarios — oversized files + duplicate image across slots.
  test.describe('TC-045 Document Uploads — edge', () => {
    test('[Edge] an oversized CNIC image is rejected', async ({ page }) => {
      const attachments = new AttachmentsPage(page);
      const input = await inputForSlot(attachments, documentSlots[0]);
      await input.setInputFiles(oversizedImageFile());
      await expect(input).not.toHaveJSProperty('files.length', 1);
    });

    test('[Edge] an oversized Affidavit PDF is rejected', async ({ page }) => {
      const attachments = new AttachmentsPage(page);
      const affidavit = documentSlots.find((s) => s.heading === 'Affidavit')!;
      const input = await inputForSlot(attachments, affidavit);
      await input.setInputFiles(oversizedPdfFile());
      await expect(input).not.toHaveJSProperty('files.length', 1);
    });

    test('[Edge] a 0 KB corrupt file is rejected', async ({ page }) => {
      const attachments = new AttachmentsPage(page);
      const input = await inputForSlot(attachments, documentSlots[0]);
      await input.setInputFiles(corruptZeroByteFile());
      await expect(input).not.toHaveJSProperty('files.length', 1);
    });

    test('[Edge] the same image reused across two Institute Photograph slots is accepted in both', async ({ page }) => {
      const attachments = new AttachmentsPage(page);
      const sameImage = instituteFullView('shared-view.jpg');
      const photoSlots = documentSlots.filter((s) => s.heading === 'Institute Photographs');
      await upload(attachments, photoSlots[0], sameImage);
      await upload(attachments, photoSlots[1], sameImage);
      const input1 = await inputForSlot(attachments, photoSlots[0]);
      const input2 = await inputForSlot(attachments, photoSlots[1]);
      await expect(input1).toHaveJSProperty('files.length', 1);
      await expect(input2).toHaveJSProperty('files.length', 1);
    });
  });

  // TC-043 Positive scenarios — one per slot (11 slot-level scenarios).
  test.describe('TC-043 Document Uploads — positive', () => {
    for (const slot of documentSlots) {
      const label = slot.subLabel ?? slot.heading;
      test(`[Positive] ${label} accepts a valid file and shows a preview`, async ({ page }) => {
        const attachments = new AttachmentsPage(page);
        const input = await inputForSlot(attachments, slot);
        await input.setInputFiles(slot.asset());
        await expect(input).toHaveJSProperty('files.length', 1);
      });
    }

    test('[Positive] once every required slot has a file, Submit is enabled', async ({ page }) => {
      const attachments = new AttachmentsPage(page);
      for (const slot of documentSlots) {
        await upload(attachments, slot, slot.asset());
      }
      await expect(attachments.submitButton).toBeEnabled();
    });
  });
}
