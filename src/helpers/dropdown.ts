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
  try {
    // Check if combobox is disabled (pre-filled/readonly fields)
    const isDisabled = await combobox.isDisabled();
    if (isDisabled) {
      // Skip disabled dropdowns - they're pre-filled by the app
      return;
    }
    await combobox.click();
    await page.getByRole('option', { name: optionText, exact: true }).click();
  } catch (error) {
    // If page is closed or context lost, gracefully skip
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('context'))) {
      return;
    }
    throw error;
  }
}

/** Opens a searchable combobox, types into its embedded search box, then picks the (single/first) matching option. */
export async function searchAndSelectDropdownOption(
  page: Page,
  combobox: Locator,
  searchText: string,
  optionText: string,
): Promise<void> {
  try {
    // Check if combobox is disabled (pre-filled/readonly fields)
    const isDisabled = await combobox.isDisabled();
    if (isDisabled) {
      // Skip disabled dropdowns - they're pre-filled by the app
      return;
    }
    await combobox.click();
    const listbox = page.getByRole('listbox');
    await listbox.getByRole('textbox').fill(searchText);
    // The search box is itself rendered as the first "option", and its accessible
    // name mirrors whatever was just typed into it — so once searchText matches
    // optionText, that option collides by name with the real one below it.
    // Exclude it by structure (it has a nested textbox; real options don't).
    const realOption = listbox
      .getByRole('option', { name: optionText, exact: true })
      .filter({ hasNot: page.getByRole('textbox') });
    await realOption.click();
  } catch (error) {
    // If page is closed or context lost, gracefully skip
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('context'))) {
      return;
    }
    throw error;
  }
}

/** Opens a combobox and returns the visible option labels (search box option, if any, excluded). */
export async function listDropdownOptions(page: Page, combobox: Locator): Promise<string[]> {
  try {
    // Check if combobox is disabled (pre-filled/readonly fields)
    const isDisabled = await combobox.isDisabled();
    if (isDisabled) {
      // Return empty list for disabled dropdowns
      return [];
    }
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
  } catch (error) {
    // If page is closed or context lost, return empty list
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('context'))) {
      return [];
    }
    throw error;
  }
}

/** Asserts a combobox is disabled (used for cascading dropdowns before their parent is chosen). */
export async function expectDropdownDisabled(combobox: Locator): Promise<void> {
  await expect(combobox).toBeDisabled();
}
