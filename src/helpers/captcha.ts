import type { Locator } from '@playwright/test';
import { createWorker } from 'tesseract.js';
import { Jimp } from 'jimp';

const CAPTCHA_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * The sign-in captcha is drawn on a <canvas>, so its text isn't in the DOM or
 * any network response — OCR against the rendered pixels is the only way to
 * read it. Upscaling first (the source canvas is ~150x30px) is what makes
 * tesseract reliable here.
 */
export async function readCaptchaText(canvas: Locator): Promise<string> {
  const dataUrl = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL('image/png'));
  const buffer = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

  const image = await Jimp.read(buffer);
  image
    .resize({ w: image.bitmap.width * 8, h: image.bitmap.height * 8 })
    .greyscale()
    .contrast(0.6);
  const processed = await image.getBuffer('image/png');

  const worker = await createWorker('eng');
  try {
    await worker.setParameters({ tessedit_char_whitelist: CAPTCHA_CHARSET });
    const {
      data: { text },
    } = await worker.recognize(processed);
    return text.replace(/[^A-Za-z0-9]/g, '');
  } finally {
    await worker.terminate();
  }
}
