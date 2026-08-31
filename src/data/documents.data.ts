import { institutePhotographSlots } from './registration-data';
import {
  cnicBack,
  cnicFront,
  ntnDetails,
  bankDetails,
  buildingLayout,
  buildingOwnership,
  instituteRightSideView,
  instituteFullView,
  instituteLeftSideView,
  instituteFrontView,
  affidavit,
} from '../helpers/asset-files';
import type { TestFile } from '../helpers/test-files';

export type UploadStrategy = 'sublabel' | 'first-in-section';

export interface DocumentSlot {
  heading: string;
  /** Descriptive text under the dropzone, when the section has more than one upload
   *  (verified for CNIC Details and Institute Photographs); otherwise undefined and
   *  the section's first file input is used directly. */
  subLabel?: string;
  strategy: UploadStrategy;
  /** Real photo/scan for this slot's positive-path upload, from `assets/documents`. */
  asset: () => TestFile;
}

const institutePhotographAssets: Record<(typeof institutePhotographSlots)[number], () => TestFile> = {
  'Right SideView of Institute': instituteRightSideView,
  'Full View of Institute': instituteFullView,
  'Left Side View of Institute': instituteLeftSideView,
  'Front View of Institute': instituteFrontView,
};

export const documentSlots: DocumentSlot[] = [
  { heading: 'CNIC Details', subLabel: 'Back side of Owner/ Sole Proprietor CNIC', strategy: 'sublabel', asset: cnicBack },
  { heading: 'CNIC Details', subLabel: 'Front side of Owner/ Sole Proprietor CNIC', strategy: 'sublabel', asset: cnicFront },
  { heading: 'NTN Details', strategy: 'first-in-section', asset: ntnDetails },
  { heading: 'Bank Details', strategy: 'first-in-section', asset: bankDetails },
  { heading: 'Building layout', strategy: 'first-in-section', asset: buildingLayout },
  { heading: 'Building ownership', strategy: 'first-in-section', asset: buildingOwnership },
  ...institutePhotographSlots.map((subLabel) => ({
    heading: 'Institute Photographs',
    subLabel,
    strategy: 'sublabel' as const,
    asset: institutePhotographAssets[subLabel],
  })),
  { heading: 'Affidavit', strategy: 'first-in-section', asset: affidavit },
];
