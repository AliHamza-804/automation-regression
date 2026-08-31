// Test case implementation imported by tests/registration/09-final-submission.spec.ts.
import { expect, test } from '../../src/fixtures';
import { AttachmentsPage } from '../../src/pages/attachments.page';
import { documentSlots } from '../../src/data/documents.data';

/**
 * TC-036 Final Submission is real and irreversible: clicking Submit here files an
 * actual application against this institute's account, the same way
 * `AttachmentsPage.submit()`-style helpers are flagged in the README for the
 * pre-existing attachments flow. It's guarded behind an explicit opt-in env var
 * and skipped by default so routine `npm test` runs never accidentally submit —
 * run deliberately with `RUN_FINAL_SUBMISSION=true npx playwright test tests/registration/09-final-submission.spec.ts`.
 */
export function registerFinalSubmissionTestCases(): void {
  test('[Positive] the application submits end-to-end with a success message and reference ID', async ({ page }) => {
    const attachments = new AttachmentsPage(page);
    await attachments.goto();

    for (const slot of documentSlots) {
      const input =
        slot.strategy === 'sublabel' && slot.subLabel
          ? await attachments.fileInputUnderLabel(slot.heading, slot.subLabel)
          : await attachments.fileInputForSection(slot.heading);
      await input.setInputFiles(slot.asset());
    }

    await attachments.expectAllSectionsAttached();
    await expect(attachments.submitButton).toBeEnabled();

    await attachments.submitButton.click();
    await expect(page.getByText(/application.*(submitted|reference|id)/i)).toBeVisible({ timeout: 15_000 });
  });

  // Note: this file's tests share the one live draft and run in declaration order, so by
  // the time this runs, the "[Positive] end-to-end" test above has already attached every
  // document — there's no way to isolate a genuinely "nothing attached yet" precondition
  // without a second account. TC-036's "missing document blocks submission" and "button
  // disables after first click" scenarios are documented here as manual/exploratory
  // follow-ups rather than asserted against unreliable shared state:
  //   - Missing document: remove any one uploaded file (if the UI exposes a remove
  //     control) and confirm Submit re-disables and names the missing section.
  //   - Duplicate-submit guard: immediately after a real submit, confirm Submit is
  //     disabled and a second click does not create a second application record.
}
