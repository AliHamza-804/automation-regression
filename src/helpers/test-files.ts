/**
 * Most upload fixtures used by the tests are built in memory (Playwright's
 * `setInputFiles` accepts `{ name, mimeType, buffer }` directly) so nothing
 * binary needs to live in the repo for them. The app validates uploads by file
 * extension/MIME and size, not by decoding pixel data, so a minimal
 * (1x1) real PNG/JPEG is enough for every "valid image" scenario, and
 * plain byte buffers are enough for the "wrong format" / "oversized" /
 * "corrupt (0 KB)" negative scenarios.
 *
 * Positive-path uploads instead use real photos/scans from `assets/` (see
 * `asset-files.ts`) so previews and the final submission reflect the kind of
 * file a real applicant would attach.
 */

import fs from 'node:fs';

export interface TestFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** Reads a real file off disk into the same shape `setInputFiles` expects. */
export function fromDisk(path: string, mimeType: string, name?: string): TestFile {
  return { name: name ?? path.split('/').pop()!, mimeType, buffer: fs.readFileSync(path) };
}

// A real, decodable 1x1 PNG (transparent).
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// A real, decodable 1x1 baseline JPEG.
const TINY_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

export function validPng(name = 'valid-image.png'): TestFile {
  return { name, mimeType: 'image/png', buffer: Buffer.from(TINY_PNG_BASE64, 'base64') };
}

export function validJpeg(name = 'valid-image.jpg'): TestFile {
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from(TINY_JPEG_BASE64, 'base64') };
}

export function validPdf(name = 'valid-document.pdf'): TestFile {
  return { name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') };
}

/** An .exe — unsupported format, rejected by every image/document upload on the site. */
export function unsupportedFormatFile(name = 'malicious.exe'): TestFile {
  return { name, mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ' + '\0'.repeat(64)) };
}

/** A 0 KB file with an image extension — "corrupt/empty file" scenario. */
export function corruptZeroByteFile(name = 'corrupt-file.jpg'): TestFile {
  return { name, mimeType: 'image/jpeg', buffer: Buffer.alloc(0) };
}

/** An oversized file (default 15 MB) for "file size exceeds limit" scenarios; app's stated max is 2MB. */
export function oversizedImageFile(sizeBytes = 15 * 1024 * 1024, name = 'oversized-image.jpg'): TestFile {
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  return { name, mimeType: 'image/jpeg', buffer: Buffer.concat([jpegHeader, Buffer.alloc(sizeBytes - jpegHeader.length)]) };
}

export function oversizedPdfFile(sizeBytes = 25 * 1024 * 1024, name = 'oversized-document.pdf'): TestFile {
  const header = Buffer.from('%PDF-1.4\n');
  return { name, mimeType: 'application/pdf', buffer: Buffer.concat([header, Buffer.alloc(sizeBytes - header.length)]) };
}
