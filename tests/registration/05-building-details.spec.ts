import { test } from '../../src/fixtures';
import { registerBuildingDetailsTestCases, registerOtherFacilitiesTestCases } from '../../src/testcases/05-building-details.test-cases';

test.describe('Step 4 — Building Details / Covered Area', registerBuildingDetailsTestCases);
test.describe('Step 7 — Facilities', registerOtherFacilitiesTestCases);
