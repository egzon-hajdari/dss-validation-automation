import { test as base } from '@playwright/test';
import { SideMenu } from '../components/SideMenu';
import { ErrorPage } from '../pages/ErrorPage';
import { HomePage } from '../pages/HomePage';
import { ValidateSignaturePage } from '../pages/ValidateSignaturePage';
import { ValidationResultsPage } from '../pages/ValidationResultsPage';

type Fixtures = {
  sideMenu: SideMenu;
  homePage: HomePage;
  validateSignaturePage: ValidateSignaturePage;
  validationResultsPage: ValidationResultsPage;
  errorPage: ErrorPage;
};

/**
 * Single place where page objects are created and handed to tests as fixtures.
 * Add new pages here; tests request them by name and never instantiate them.
 * Tests import `test` and `expect` from here instead of from '@playwright/test'.
 */
export const test = base.extend<Fixtures>({
  sideMenu: async ({ page }, use) => {
    await use(new SideMenu(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  validateSignaturePage: async ({ page }, use) => {
    await use(new ValidateSignaturePage(page));
  },
  validationResultsPage: async ({ page }, use) => {
    await use(new ValidationResultsPage(page));
  },
  errorPage: async ({ page }, use) => {
    await use(new ErrorPage(page));
  },
});

export { expect } from '@playwright/test';
