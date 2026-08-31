export interface NumericFieldCase {
  tcId: string;
  scenario: 'Positive' | 'Negative' | 'Edge';
  description: string;
  value: string;
  expectError?: RegExp;
}

// TC-031 Land In: Marla
export const landInMarlaCases: NumericFieldCase[] = [
  { tcId: 'TC-031', scenario: 'Positive', description: 'accepts a valid marla count', value: '5' },
  { tcId: 'TC-031', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-031', scenario: 'Negative', description: 'rejects zero', value: '0', expectError: /./ },
  { tcId: 'TC-031', scenario: 'Negative', description: 'rejects a negative value', value: '-5', expectError: /./ },
  { tcId: 'TC-031', scenario: 'Edge', description: 'accepts a decimal value', value: '5.5' },
  { tcId: 'TC-031', scenario: 'Edge', description: 'accepts (or caps) a very large value', value: '999999' },
];

// TC-032 Marla Value
export const marlaValueCases: NumericFieldCase[] = [
  { tcId: 'TC-032', scenario: 'Positive', description: 'accepts a valid marla value', value: '273.5' },
  { tcId: 'TC-032', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-032', scenario: 'Negative', description: 'rejects zero', value: '0', expectError: /./ },
  { tcId: 'TC-032', scenario: 'Negative', description: 'rejects a negative value', value: '-273.5', expectError: /./ },
];

// TC-033 Covered Area
export const coveredAreaCases: NumericFieldCase[] = [
  { tcId: 'TC-033', scenario: 'Positive', description: 'accepts a valid covered area', value: '1367.5' },
  { tcId: 'TC-033', scenario: 'Negative', description: 'required when empty', value: '', expectError: /required/i },
  { tcId: 'TC-033', scenario: 'Negative', description: 'rejects zero', value: '0', expectError: /./ },
  { tcId: 'TC-033', scenario: 'Negative', description: 'rejects a negative value', value: '-100', expectError: /./ },
];
