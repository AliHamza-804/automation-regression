import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Every field on this wizard renders as
 * `<div> <div>Label*</div> <div aria-label="Label">input+group</div> <p>error</p> </div>`
 * — the helper-text `<p>` is a SIBLING of the aria-labelled input wrapper,
 * not inside it, and it's empty until the field is touched/invalid (e.g.
 * "Date of establishment is required.", "Please enter a valid NTN Number (7
 * digits or 7 digits-1 digit format)."). `fieldByLabel` locates the outer
 * container (label text exactly as rendered, asterisk included for
 * required fields) so error lookups and input lookups both work from it;
 * `scope` narrows to a section when the same label appears more than once
 * on the page (e.g. Owner vs Principal "Gender*").
 */
export function fieldByLabel(page: Page, labelText: string, scope?: Locator, levels = 1): Locator {
  const root = scope ?? page;
  let locator = root.getByText(labelText, { exact: true });
  for (let i = 0; i < levels; i++) {
    locator = locator.locator('..');
  }
  return locator;
}

export async function getFieldErrorText(fieldContainer: Locator): Promise<string> {
  const paragraph = fieldContainer.locator('p').last();
  if ((await paragraph.count()) === 0) return '';
  return ((await paragraph.textContent()) ?? '').trim();
}

export async function expectFieldError(fieldContainer: Locator, expected: string | RegExp): Promise<void> {
  await expect(fieldContainer.locator('p').last()).toHaveText(expected);
}

export async function expectNoFieldError(fieldContainer: Locator): Promise<void> {
  const text = await getFieldErrorText(fieldContainer);
  expect(text).toBe('');
}

export function nextButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Next' });
}

export function backButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Back' });
}

export function submitButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Submit' });
}

export async function expectNextDisabled(page: Page): Promise<void> {
  await expect(nextButton(page)).toBeDisabled();
}

export async function expectNextEnabled(page: Page): Promise<void> {
  await expect(nextButton(page)).toBeEnabled();
}
