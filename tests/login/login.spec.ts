import { test } from '@playwright/test';
import { registerLoginTestCases } from '../../src/testcases/login.test-cases';

test.describe('Login', registerLoginTestCases);
