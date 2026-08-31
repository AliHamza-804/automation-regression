import type { FieldCase } from './basic-info.data';

// TC-022 Owner Name
export const ownerNameCases: FieldCase[] = [
  { tcId: 'TC-022', scenario: 'Positive', description: 'accepts a normal name', value: 'Ali Hamza Akram' },
  { tcId: 'TC-022', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-022', scenario: 'Negative', description: 'rejects invalid characters', value: 'Ali123@#', expectError: /./ },
  { tcId: 'TC-022', scenario: 'Edge', description: 'enforces a max length (or errors)', value: 'A'.repeat(200) },
];

// TC-024 Owner CNIC — verified real message shape ("13 digits") mirrors NTN's convention.
export const cnicCases: FieldCase[] = [
  { tcId: 'TC-024', scenario: 'Positive', description: 'accepts a valid 13-digit CNIC', value: '3310112345671' },
  { tcId: 'TC-024', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-024', scenario: 'Negative', description: 'rejects fewer than 13 digits', value: '33101123', expectError: /./ },
  {
    tcId: 'TC-024',
    scenario: 'Negative',
    description: 'rejects more than 13 digits',
    value: '33101123456789',
    expectError: /./,
  },
  { tcId: 'TC-024', scenario: 'Negative', description: 'rejects non-numeric input', value: '33101ABCD671', expectError: /./ },
  { tcId: 'TC-024', scenario: 'Edge', description: 'accepts (or normalizes) a dashed CNIC', value: '33101-1234567-1' },
];

// TC-025 Owner Mobile No
export const ownerMobileCases: FieldCase[] = [
  { tcId: 'TC-025', scenario: 'Positive', description: 'accepts a valid mobile number', value: '03211234567' },
  { tcId: 'TC-025', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-025', scenario: 'Negative', description: 'rejects non-numeric input', value: '0321ABCDEFG', expectError: /./ },
  { tcId: 'TC-025', scenario: 'Negative', description: 'rejects an obviously short number', value: '03211', expectError: /./ },
];

// TC-026 Owner Landline No (optional)
export const ownerLandlineCases: FieldCase[] = [
  { tcId: 'TC-026', scenario: 'Positive', description: 'accepts a valid landline', value: '041-9876543' },
  { tcId: 'TC-026', scenario: 'Positive', description: 'accepts an empty value (optional field)', value: '' },
  { tcId: 'TC-026', scenario: 'Negative', description: 'rejects non-numeric input', value: '041ABCDEFG', expectError: /./ },
];

// TC-027 Owner Email
export const ownerEmailCases: FieldCase[] = [
  { tcId: 'TC-027', scenario: 'Positive', description: 'accepts a valid email', value: 'alihamza@example.com' },
  { tcId: 'TC-027', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  {
    tcId: 'TC-027',
    scenario: 'Negative',
    description: 'rejects a missing @ symbol',
    value: 'alihamzaexample.com',
    expectError: /./,
  },
  { tcId: 'TC-027', scenario: 'Negative', description: 'rejects a missing top-level domain', value: 'alihamza@example', expectError: /./ },
  { tcId: 'TC-027', scenario: 'Edge', description: 'treats email as case-insensitive', value: 'ALIHAMZA@EXAMPLE.COM' },
  { tcId: 'TC-027', scenario: 'Edge', description: 'enforces a max length (or errors)', value: `${'a'.repeat(250)}@example.com` },
];

// TC-028 Owner Address — the app's format validator only allows letters/numbers/commas/periods/slashes/hyphens.
export const ownerAddressCases: FieldCase[] = [
  {
    tcId: 'TC-028',
    scenario: 'Positive',
    description: 'accepts a full address using only allowed characters',
    value: 'House 12, Street 5, Model Town, Faisalabad',
  },
  { tcId: 'TC-028', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-028', scenario: 'Edge', description: 'enforces a max length (or errors)', value: 'A, '.repeat(400) },
  {
    tcId: 'TC-028',
    scenario: 'Edge',
    description: 'rejects (or strips) unsupported symbols such as "#" and emoji',
    value: 'House #12 😊 St. 5!!',
    expectError: /only letters, numbers, commas, periods, slashes, and hyphens/i,
  },
];
