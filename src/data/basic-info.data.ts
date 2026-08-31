/** Data-driven cases for Step 1 / Basic Info + Bank Details fields — TC-003..TC-019.
 *  `expectError` is the pattern the field's inline helper-text paragraph should match;
 *  `undefined` means the value is expected to be accepted with no error shown. */

export interface FieldCase {
  tcId: string;
  scenario: 'Positive' | 'Negative' | 'Edge';
  description: string;
  value: string;
  expectError?: RegExp;
}

// TC-005 Institute Name
export const instituteNameCases: FieldCase[] = [
  { tcId: 'TC-005', scenario: 'Positive', description: 'accepts a normal name', value: 'Al-Noor Model School' },
  { tcId: 'TC-005', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  {
    tcId: 'TC-005',
    scenario: 'Negative',
    description: 'rejects special-character-only input',
    value: '@@##$$%%',
    expectError: /./,
  },
  { tcId: 'TC-005', scenario: 'Negative', description: 'rejects numeric-only input', value: '123456', expectError: /./ },
  { tcId: 'TC-005', scenario: 'Edge', description: 'truncates or errors past max length', value: 'A'.repeat(300) },
  { tcId: 'TC-005', scenario: 'Edge', description: 'accepts a single character (or shows min-length error)', value: 'A' },
  { tcId: 'TC-005', scenario: 'Edge', description: 'trims leading/trailing spaces', value: '  Al-Noor School  ' },
];

// TC-006 Head Name
export const headNameCases: FieldCase[] = [
  { tcId: 'TC-006', scenario: 'Positive', description: 'accepts a normal name', value: 'Muhammad Ahmed' },
  { tcId: 'TC-006', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  {
    tcId: 'TC-006',
    scenario: 'Negative',
    description: 'rejects invalid leading characters',
    value: '12@#Ahmed',
    expectError: /./,
  },
  { tcId: 'TC-006', scenario: 'Edge', description: 'enforces a max length (or errors)', value: 'A'.repeat(200) },
];

// TC-008 Institute Landline No (optional field)
export const landlineCases: FieldCase[] = [
  { tcId: 'TC-008', scenario: 'Positive', description: 'accepts a valid landline', value: '041-1234567' },
  { tcId: 'TC-008', scenario: 'Negative', description: 'rejects letters', value: '041ABCDEFG', expectError: /./ },
  { tcId: 'TC-008', scenario: 'Negative', description: 'rejects an obviously short number', value: '0411234', expectError: /./ },
  { tcId: 'TC-008', scenario: 'Edge', description: 'formats or rejects symbol-heavy input', value: '(041) 123-4567' },
  { tcId: 'TC-008', scenario: 'Edge', description: 'enforces a max length (or errors)', value: '04112345678901' },
];

// TC-009 Whatsapp Number
export const whatsappCases: FieldCase[] = [
  { tcId: 'TC-009', scenario: 'Positive', description: 'accepts a valid mobile number', value: '03001234567' },
  { tcId: 'TC-009', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-009', scenario: 'Negative', description: 'rejects letters', value: '0300ABCDEFG', expectError: /./ },
  { tcId: 'TC-009', scenario: 'Negative', description: 'rejects a too-short number', value: '030012', expectError: /./ },
  { tcId: 'TC-009', scenario: 'Negative', description: 'enforces max length (or errors)', value: '030012345678901', expectError: /./ },
  { tcId: 'TC-009', scenario: 'Edge', description: 'accepts or normalizes the +92 country-code form', value: '+923001234567' },
];

// TC-011 Website (optional field)
export const websiteCases: FieldCase[] = [
  { tcId: 'TC-011', scenario: 'Positive', description: 'accepts a full https URL', value: 'https://www.alnoorschool.edu.pk' },
  { tcId: 'TC-011', scenario: 'Positive', description: 'accepts an empty value (optional field)', value: '' },
  { tcId: 'TC-011', scenario: 'Edge', description: 'accepts or auto-prepends protocol for a bare domain', value: 'www.alnoorschool.edu.pk' },
  { tcId: 'TC-011', scenario: 'Negative', description: 'rejects an obviously invalid URL', value: 'not a valid url', expectError: /./ },
  { tcId: 'TC-011', scenario: 'Edge', description: 'enforces a max length (or errors)', value: `https://example.com/${'a'.repeat(500)}` },
];

// TC-012 NTN Number — required 7-digit (or 7 digit-1 digit) format is a *verified* real message.
export const ntnCases: FieldCase[] = [
  { tcId: 'TC-012', scenario: 'Positive', description: 'accepts a valid 7-digit NTN', value: '1234567' },
  { tcId: 'TC-012', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  {
    tcId: 'TC-012',
    scenario: 'Negative',
    description: 'rejects fewer than 7 digits',
    value: '12345',
    expectError: /valid NTN Number/i,
  },
  {
    tcId: 'TC-012',
    scenario: 'Negative',
    description: 'rejects more than 7 (non-check-digit) digits',
    value: '123456789',
    expectError: /valid NTN Number/i,
  },
  { tcId: 'TC-012', scenario: 'Negative', description: 'rejects non-numeric characters', value: '12AB@56', expectError: /valid NTN Number/i },
  { tcId: 'TC-012', scenario: 'Edge', description: 'preserves a leading zero as a valid 7-digit NTN', value: '0123456' },
];

// TC-013..TC-019 Bank Details
export const branchNameCases: FieldCase[] = [
  { tcId: 'TC-014', scenario: 'Positive', description: 'accepts a normal branch name', value: 'Model Town Branch' },
  { tcId: 'TC-014', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-014', scenario: 'Negative', description: 'rejects special-character-only input', value: '123@#$', expectError: /./ },
  { tcId: 'TC-014', scenario: 'Edge', description: 'enforces a max length (or errors)', value: 'A'.repeat(200) },
];

export const branchCodeCases: FieldCase[] = [
  { tcId: 'TC-015', scenario: 'Positive', description: 'accepts a valid branch code', value: '0283' },
  { tcId: 'TC-015', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-015', scenario: 'Negative', description: 'rejects letters', value: 'ABCD', expectError: /./ },
  { tcId: 'TC-015', scenario: 'Negative', description: 'rejects an obviously invalid length', value: '02839999', expectError: /./ },
  { tcId: 'TC-015', scenario: 'Edge', description: 'preserves leading zeros', value: '0001' },
];

export const accountTitleCases: FieldCase[] = [
  { tcId: 'TC-016', scenario: 'Positive', description: 'accepts a normal account title', value: 'Ali Hamza' },
  { tcId: 'TC-016', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-016', scenario: 'Negative', description: 'rejects invalid characters', value: 'Ali123@Hamza', expectError: /./ },
  { tcId: 'TC-016', scenario: 'Edge', description: 'enforces a max length (or errors)', value: 'A'.repeat(200) },
];

export const accountNumberCases: FieldCase[] = [
  { tcId: 'TC-017', scenario: 'Positive', description: 'accepts a 10-16 digit account number', value: '01234567890123' },
  { tcId: 'TC-017', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-017', scenario: 'Negative', description: 'rejects letters', value: 'ABC1234567', expectError: /./ },
  { tcId: 'TC-017', scenario: 'Negative', description: 'rejects an obviously too-short number', value: '123', expectError: /./ },
  { tcId: 'TC-017', scenario: 'Edge', description: 'enforces the 16-digit max (or errors)', value: '123456789012345678901' },
];

// TC-018 IBAN — verified real messages for missing "PK" prefix / wrong length.
export const ibanCases: FieldCase[] = [
  { tcId: 'TC-018', scenario: 'Positive', description: 'accepts a valid Pakistani IBAN', value: 'PK36SCBL0000001123456702' },
  { tcId: 'TC-018', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  {
    tcId: 'TC-018',
    scenario: 'Negative',
    description: "rejects an IBAN missing the 'PK' prefix",
    value: '4328897240772842',
    expectError: /valid Pakistani IBAN/i,
  },
  {
    tcId: 'TC-018',
    scenario: 'Negative',
    description: 'rejects an IBAN of the wrong length',
    value: 'PK4328897240772842',
    expectError: /valid Pakistani IBAN/i,
  },
  { tcId: 'TC-018', scenario: 'Edge', description: 'accepts or normalizes a lowercase IBAN', value: 'pk36scbl0000001123456702' },
];
