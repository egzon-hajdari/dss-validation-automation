import { expect, test, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * "Validate a signature" page (/validation): locators and actions for the upload form.
 * To add a locator: declare it as a field of the class and initialise it in the constructor.
 */
export class ValidateSignaturePage {
  static readonly path = '/validation';
  static readonly title = 'Validate a signature';

  readonly heading: Locator;
  readonly signedFileInput: Locator;
  readonly submitButton: Locator;

  /** Defines the page locators. */
  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: ValidateSignaturePage.title, exact: true });
    this.signedFileInput = page.getByLabel('Signed file', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  /** Checks the page is open: correct URL and heading visible. */
  async expectOpen(): Promise<void> {
    await test.step(`"${ValidateSignaturePage.title}" page is open`, async () => {
      await expect(this.page).toHaveURL(ValidateSignaturePage.path);
      await expect(this.heading).toBeVisible();
    }, { box: true });
  }

  /** Uploads a file to the "Signed file" input. */
  async uploadSignedFile(filePath: string): Promise<void> {
    await test.step(`Upload signed file "${path.basename(filePath)}"`, async () => {
      await this.signedFileInput.setInputFiles(filePath);
    }, { box: true });
  }

  /** Submits the form with the options currently selected. */
  async submit(): Promise<void> {
    await test.step('Click "Submit"', async () => {
      await this.submitButton.click();
    }, { box: true });
  }
}
