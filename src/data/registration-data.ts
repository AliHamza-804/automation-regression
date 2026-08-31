/** Shared "known-good" values for the registration wizard, reused as the baseline that
 *  individual field tests override one value in (see each page object's `fillValid`). */

export const validBasicInfo = {
  organizationType: 'Company',
  instituteName: 'Al-Noor Model School',
  headName: 'Muhammad Ahmed',
  instituteGender: 'Co-Education',
  campusType: 'Main Campus',
  landline: '041-1234567',
  whatsapp: '03001234567',
  dateOfEstablishment: '2005-03-15', // yyyy-mm-dd, for <input type="date">
  website: 'https://www.alnoorschool.edu.pk',
  ntn: '1234567',
  bankSearch: 'Habib Bank',
  bankName: 'Habib Bank Limited',
  branchName: 'Model Town Branch',
  branchCode: '0283',
  accountTitle: 'Ali Hamza',
  accountNumber: '01234567890123',
  // A real Pakistani IBAN shape: PK + 2 check digits + 4-letter bank code + 16 digits.
  iban: 'PK36SCBL0000001123456702',
  accountType: 'Savings',
};

export const validAddressDetails = {
  division: 'Faisalabad Division',
  district: 'Faisalabad',
  city: 'Faisalabad',
  tehsil: 'Faisalabad City',
  addressSearchText: 'Faisalabad Clock Tower',
  // "#" is rejected by the address format validator (letters/numbers/commas/periods/slashes/hyphens only).
  address: 'House 12, Street 5, Model Town, Faisalabad',
};

export const validOwnerProfile = {
  name: 'Ali Hamza Akram',
  gender: 'Male',
  cnic: '3310112345671',
  mobile: '03211234567',
  landline: '041-9876543',
  email: 'alihamzaakram@example.com',
  address: 'House 12, Street 5, Model Town, Faisalabad',
};

export const validBuildingCoveredArea = {
  unit: 'Marla',
  landInMarla: '5',
  marlaValue: '273.5',
  coveredArea: '1367.5',
};

/** Indoor Facilities tabs, in on-screen order — the first two are mandatory (>= 1 entry). */
export const indoorFacilitySections = [
  'Class Rooms',
  'Stairs',
  'Basement',
  'Labs/Workshops',
  'Computer Labs',
  'Library',
  'Staff Room',
  'Office',
  'Store',
  'Chairs',
] as const;

export const mandatoryIndoorFacilitySections = ['Class Rooms', 'Labs/Workshops'] as const;

/** Outdoor Facilities tabs — only the first is mandatory. "Other Option" has no PDF-mapped equivalent. */
export const outdoorFacilitySections = ['Multipurpose Hall / Auditorium', 'Open Space', 'Play Ground', 'Parking'] as const;

export const mandatoryOutdoorFacilitySections = ['Multipurpose Hall / Auditorium'] as const;

export const otherFacilityCheckboxes = ['Transport', 'Washroom', 'Mosque', 'Canteen', 'Hostel'] as const;
export const mandatoryOtherFacility = 'Canteen';

/** The 7 required Attachments accordion sections (Additional Attachments from the PDF has no
 *  equivalent in this build — there is no such section in the app). */
export const attachmentSections = [
  'CNIC Details',
  'NTN Details',
  'Bank Details',
  'Building layout',
  'Building ownership',
  'Institute Photographs',
  'Affidavit',
] as const;

export const institutePhotographSlots = [
  'Right SideView of Institute',
  'Full View of Institute',
  'Left Side View of Institute',
  'Front View of Institute',
] as const;
