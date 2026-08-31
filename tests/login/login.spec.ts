import { test } from '@playwright/test';
import { registerLoginTestCases } from '../helpers/login.test-cases';

test.describe('Login', registerLoginTestCases);
