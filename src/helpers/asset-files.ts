/**
 * Real photos/scans used for positive-path upload tests, kept under `assets/`
 * at the repo root (see that folder's contents for the originals). Each
 * export mirrors one upload slot in the app so spec files don't need to know
 * the on-disk filename or MIME type.
 */

import path from 'node:path';
import { fromDisk, type TestFile } from './test-files';

const ASSETS_DIR = path.join(__dirname, '../../assets');

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function asset(relativePath: string, name?: string): TestFile {
  const fullPath = path.join(ASSETS_DIR, relativePath);
  const ext = path.extname(fullPath).toLowerCase();
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) throw new Error(`asset-files: unsupported extension "${ext}" for ${relativePath}`);
  return fromDisk(fullPath, mimeType, name);
}

// ---- Step 1: Institute Logo, Owner/Principal profile pictures ------------
export const instituteLogo = (name?: string) => asset('logo.jpg', name);
export const ownerProfilePicture = (name?: string) => asset('owner-profile.jpg', name);
export const principalProfilePicture = (name?: string) => asset('principal-profile.jpg', name);

// ---- Step 8: Attachments (documentSlots in documents.data.ts) -------------
export const cnicFront = () => asset('documents/cnic-front.png');
export const cnicBack = () => asset('documents/cnic-back.png');
export const ntnDetails = () => asset('documents/ntn.jpeg');
export const bankDetails = () => asset('documents/bank-detail.png');
export const buildingLayout = () => asset('documents/building-layout.jpg');
export const buildingOwnership = () => asset('documents/building-ownership.jpeg');
export const affidavit = () => asset('documents/affidavit.png');
export const instituteRightSideView = () => asset('documents/institute-right-side.jpeg');
export const instituteFullView = (name?: string) => asset('documents/institute-full-view.jpg', name);
export const instituteLeftSideView = () => asset('documents/institute-left-side.jpeg');
export const instituteFrontView = () => asset('documents/institute-front-view.jpeg');

// ---- Steps 5/6: Indoor/Outdoor Facility attachments, keyed by tab name ----
export const facilityPhotoByTab: Record<string, () => TestFile> = {
  'Class Rooms': () => asset('facilities/class-room.jpg'),
  Stairs: () => asset('facilities/stairs.jpg'),
  Basement: () => asset('facilities/basement.jpg'),
  'Labs/Workshops': () => asset('facilities/labs-workshops.jpg'),
  'Computer Labs': () => asset('facilities/computer-labs.jpg'),
  Library: () => asset('facilities/library.jpg'),
  'Staff Room': () => asset('facilities/staff-room.jpg'),
  Office: () => asset('facilities/office.jpg'),
  Store: () => asset('facilities/store.jpeg'),
  Chairs: () => asset('facilities/chairs.jpeg'),
  'Multipurpose Hall / Auditorium': () => asset('facilities/multipurpose-hall-auditorium.jpeg'),
  'Open Space': () => asset('facilities/open-space.jpeg'),
  'Play Ground': () => asset('facilities/play-ground.jpg'),
  Parking: () => asset('facilities/parking.jpeg'),
};
