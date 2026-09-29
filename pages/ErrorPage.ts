import { expect, test, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';

/**
 * Error page ("Bad Request") that DSS shows instead of a result when a request is rejected,
 * e.g. an unsupported file submitted on "Validate a signature". It keeps the URL of the rejected page.
 * To add a locator: declare it as a field of the class and initialise it in the constructor.
 */
export class ErrorPage {
  static readonly title = 'Bad Request';
  static readonly alertPrefix = 'Oops... An error occurred!';

  readonly heading: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: ErrorPage.title, exact: true });
    this.alert = page.getByRole('alert');
  }

  /** Waits for the server response, then checks the error page shows the expected message. */
  async expectError(message: string): Promise<void> {
    await test.step(`"${ErrorPage.title}" page shows "${message}"`, async () => {
      await expect(this.heading).toBeVisible({ timeout: env.validationTimeout });
      await expect(this.alert, 'Error message').toHaveText(`${ErrorPage.alertPrefix} ${message}`);
    }, { box: true });
  }
}
