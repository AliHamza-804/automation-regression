import { test } from '../../src/fixtures';
import { registerFinalSubmissionTestCases } from '../helpers/09-final-submission.test-cases';

test.describe('Final Submission', () => {
  test.skip(
    process.env.RUN_FINAL_SUBMISSION !== 'true',
    'Guarded: submitting is irreversible. Set RUN_FINAL_SUBMISSION=true to run this file.',
  );
  registerFinalSubmissionTestCases();
});
