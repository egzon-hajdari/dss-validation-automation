import { expect, test, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';
import { ValidateSignaturePage } from './ValidateSignaturePage';

/** Expected "label: value" pairs of a report card, e.g. { 'Indication:': 'TOTAL_PASSED' }. */
export type ReportFields = Record<string, string>;

/**
 * Expected content of one signature card.
 * `timestamps` is optional: leave it out to skip the Timestamps check.
 */
export interface SignatureReport {
  fields: ReportFields;
  timestamps?: ReportFields[];
}

/**
 * Expected content of the Simple Report, used in test-data/documents.ts.
 * Lists follow the order shown on the page; their length is the expected number of cards.
 */
export interface SimpleReport {
  signatures: SignatureReport[];
  documentInformation: ReportFields;
}

/**
 * "Validation results" page, shown on /validation after a file is submitted (same URL as the upload form).
 * To add a locator: declare it as a field of the class and initialise it in the constructor.
 */
export class ValidationResultsPage {
  static readonly path = ValidateSignaturePage.path;
  static readonly title = 'Validation results';

  readonly heading: Locator;
  readonly simpleReportTab: Locator;
  readonly simpleReport: Locator;
  readonly signatures: Locator;
  readonly documentInformation: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: ValidationResultsPage.title, exact: true });
    this.simpleReportTab = page.getByRole('tab', { name: 'Simple Report' });
    this.simpleReport = page.locator('#simple-report');
    this.signatures = this.cardWithHeader(/^\s*Signature\s/);
    this.documentInformation = this.cardWithHeader('Document Information');
  }

  /** Waits for the server-side validation, then checks the Simple Report is shown by default. */
  async expectOpen(): Promise<void> {
    await test.step(`"${ValidationResultsPage.title}" page is open`, async () => {
      await expect(this.heading).toBeVisible({ timeout: env.validationTimeout });
      await expect(this.page).toHaveURL(ValidationResultsPage.path);
      await expect(this.simpleReportTab).toHaveAttribute('aria-selected', 'true');
      await expect(this.simpleReport).toBeVisible();
    }, { box: true });
  }

  /**
   * Checks the Simple Report against the expected values: the number of signatures,
   * every field of each signature card, of its timestamps, and of "Document Information".
   */
  async expectSimpleReport(expected: SimpleReport): Promise<void> {
    await test.step('Simple Report shows the expected values', async () => {
      await expect(this.signatures, 'Number of signatures').toHaveCount(expected.signatures.length);

      for (const [index, signature] of expected.signatures.entries()) {
        for (const [label, value] of Object.entries(signature.fields)) {
          await expect.soft(this.signatureField(label, index), `Signature ${index + 1} – ${label}`).toHaveText(value);
        }

        if (!signature.timestamps) continue;
        await this.openTimestamps(index);
        await expect(this.timestamps(index), `Signature ${index + 1} – number of timestamps`).toHaveCount(signature.timestamps.length);

        for (const [tsIndex, fields] of signature.timestamps.entries()) {
          for (const [label, value] of Object.entries(fields)) {
            await expect
              .soft(this.timestampField(label, index, tsIndex), `Signature ${index + 1} – Timestamp ${tsIndex + 1} – ${label}`)
              .toHaveText(value);
          }
        }
      }

      for (const [label, value] of Object.entries(expected.documentInformation)) {
        await expect.soft(this.documentInformationField(label), `Document Information – ${label}`).toHaveText(value);
      }
    }, { box: true });
  }

  /** Value next to a label in a signature card (the first signature by default), e.g. "Indication:". */
  signatureField(label: string, signatureIndex = 0): Locator {
    return this.field(this.signatures.nth(signatureIndex), label);
  }

  /** Expands the collapsed "Timestamps" section of a signature card. */
  async openTimestamps(signatureIndex = 0): Promise<void> {
    await test.step(`Open "Timestamps" of signature ${signatureIndex + 1}`, async () => {
      const header = this.timestampsHeader(signatureIndex);
      if ((await header.getAttribute('aria-expanded')) !== 'true') {
        await header.click();
      }
      await expect(header).toHaveAttribute('aria-expanded', 'true');
      await expect(this.timestamps(signatureIndex).first()).toBeVisible();
    }, { box: true });
  }

  /** Timestamp cards inside a signature card, in the order shown. */
  timestamps(signatureIndex = 0): Locator {
    return this.signatures
      .nth(signatureIndex)
      .locator('.card')
      .filter({ has: this.page.locator(':scope > .card-header', { hasText: /^\s*Timestamp\s/ }) });
  }

  /** Value next to a label in a timestamp card of a signature, e.g. "Indication:". */
  timestampField(label: string, signatureIndex = 0, timestampIndex = 0): Locator {
    return this.field(this.timestamps(signatureIndex).nth(timestampIndex), label);
  }

  /** Value next to a label in the "Document Information" card, e.g. "Signatures status:". */
  documentInformationField(label: string): Locator {
    return this.field(this.documentInformation, label);
  }

  /** Collapsible "Timestamps" header inside a signature card. */
  private timestampsHeader(signatureIndex: number): Locator {
    return this.signatures
      .nth(signatureIndex)
      .locator(':scope > .card-body > .card > .card-header', { hasText: /^\s*Timestamps\b/ });
  }

  private cardWithHeader(header: string | RegExp): Locator {
    return this.simpleReport
      .locator('.card')
      .filter({ has: this.page.locator(':scope > .card-header', { hasText: header }) });
  }

  /**
   * Only the card's own rows are searched: a signature card also contains nested
   * timestamp cards with their own "Indication:", which must not match.
   */
  private field(card: Locator, label: string): Locator {
    return card
      .locator(':scope > .card-body > dl')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('dd');
  }
}
