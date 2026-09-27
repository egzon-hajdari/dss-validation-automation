import { expect, test, type Locator, type Page } from '@playwright/test';

/** Side menu entries, as displayed on every page. */
export const MENU_ITEMS = [
  'Sign a document',
  'Sign a digest',
  'Sign a PDF',
  'Sign with JAdES',
  'Sign with CB-AdES',
  'Sign multiple documents',
  'Counter sign a signature',
  'Extend a signature',
  'Timestamp document(s)',
  'Merge containers',
  'Validate a signature',
  'Validate a certificate',
  'QWAC validation',
  'EAA validation',
  'Replay Diagnostic Data',
  'Trusted Lists Summary',
  'OJ Trusted Certificates',
  'Documentation PDF',
  'Documentation HTML',
  'Report a bug',
  'Contact us',
] as const;

export type MenuItem = (typeof MENU_ITEMS)[number];

/**
 * Side menu is shown on every page. All navigation between pages goes through here.
 * The link of the current page has the "active" class.
 */
export class SideMenu {
  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.locator('.navigation');
  }

  /** Menu link by its visible name. */
  link(item: MenuItem): Locator {
    return this.root.getByRole('link', { name: item, exact: true });
  }

  /** Clicks a menu item and checks it became the active one. */
  async open(item: MenuItem): Promise<void> {
    await test.step(`Side menu: open "${item}"`, async () => {
      await this.link(item).click();
      await expect(this.link(item)).toHaveClass(/active/);
    }, { box: true });
  }

  /** Opens the "Validate a signature" page (/validation). */
  async goToValidateSignature(): Promise<void> {
    await this.open('Validate a signature');
  }
}
