import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Home page ("/"), which opens on the "Sign a document" page.
 * Used to check that the application has loaded.
 */
export class HomePage {
  static readonly path = '/';
  static readonly title = 'Sign a document';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: HomePage.title, exact: true });
  }

  /**
   * Opens the application and waits until it is ready to use.
   * Fails fast if the instance is unavailable (e.g. an error page), before any test step runs.
   */
  async open(): Promise<void> {
    await test.step('Open the main page', async () => {
      await this.page.goto(HomePage.path);
      await expect(this.page).toHaveURL(HomePage.path);
      await expect(this.heading).toBeVisible();
    }, { box: true });
  }
}
