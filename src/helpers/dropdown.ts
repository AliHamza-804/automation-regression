import { expect, type Locator, type Page } from '@playwright/test';

/**
 * All dropdowns in this app are MUI Autocomplete-style comboboxes: clicking
 * the combobox (or its "Open dropdown" button) opens a `listbox` appended to
 * the end of the document, with `option` roles inside. Some listboxes embed
 * a search textbox as their first "option" (Bank Name, Division, District,
 * City, Tehsil, NA, PP, UC); plain enum dropdowns (Organization Type,
 * Gender, Account Type, Unit, ...) list options directly with no search box.
 */

/** Opens a combobox and clicks the option with the given exact text. */
export async function selectDropdownOption(page: Page, combobox: Locator, optionText: string): Promise<void> {
  await combobox.click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

/** Opens a searchable combobox, types into its embedded search box, then picks the (single/first) matching option. */
export async function searchAndSelectDropdownOption(
  page: Page,
  combobox: Locator,
  searchText: string,
  optionText: string,
): Promise<void> {
  await combobox.click();
  const listbox = page.getByRole('listbox');
  await listbox.getByRole('textbox').fill(searchText);
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

/** Opens a combobox and returns the visible option labels (search box option, if any, excluded). */
export async function listDropdownOptions(page: Page, combobox: Locator): Promise<string[]> {
  await combobox.click();
  const listbox = page.getByRole('listbox');
  const options = await listbox.getByRole('option').all();
  const labels: string[] = [];
  for (const option of options) {
    const text = (await option.textContent())?.trim() ?? '';
    if (text) labels.push(text);
  }
  await page.keyboard.press('Escape');
  return labels;
}

/** Asserts a combobox is disabled (used for cascading dropdowns before their parent is chosen). */
export async function expectDropdownDisabled(combobox: Locator): Promise<void> {
  await expect(combobox).toBeDisabled();
}
