import { test } from '../fixtures';
import { TD01, TD02, TD03, TD07 } from '../test-data/documents';

/**
 * Validate a signature: a valid signed PDF, validated with default settings,
 * produces a Simple Report with the expected signature, timestamp and document details.
 */
test.describe('Validate a signature', () => {
  test('TC-01: Validate a valid signed PDF with default settings', {
    tag: '@smoke',
    annotation: { type: 'test data', description: `${TD01.id}: ${TD01.description}` },
  }, async ({
    homePage,
    sideMenu,
    validateSignaturePage,
    validationResultsPage,
  }) => {
    // Arrange: open the upload form
    await homePage.open();
    await sideMenu.goToValidateSignature();
    await validateSignaturePage.expectOpen();

    // Act: validate the signed PDF
    await validateSignaturePage.uploadSignedFile(TD01.filePath);
    await validateSignaturePage.submit();

    // Assert: the report matches the expected content of TD-01
    await validationResultsPage.expectOpen();
    await validationResultsPage.expectSimpleReport(TD01.expected);
  });
});


const tc02Documents = [TD02, TD07];

test.describe('Validate a signature: multiple documents', () => {
  for (const document of tc02Documents) {
    test(`TC-02: Validate a valid signed document with default settings [${document.id}]`, {
      annotation: { type: 'test data', description: `${document.id}: ${document.description}` },
    }, async ({
      homePage,
      sideMenu,
      validateSignaturePage,
      validationResultsPage,
    }) => {
      // Arrange: open the upload form
      await homePage.open();
      await sideMenu.goToValidateSignature();
      await validateSignaturePage.expectOpen();

      // Act: validate the signed document
      await validateSignaturePage.uploadSignedFile(document.filePath);
      await validateSignaturePage.submit();

      // Assert: the report matches the expected content of the document
      await validationResultsPage.expectOpen();
      await validationResultsPage.expectSimpleReport(document.expected);
    });
  }
});

/** Unsupported files covered by TC-03: one test is generated for each. Add documents from test-data/documents.ts here. */
const tc03Documents = [TD03];

/**
 * Negative case: DSS rejects a file it cannot validate with a clear error, instead of a report.
 */
test.describe('Validate a signature: unsupported files', () => {
  for (const document of tc03Documents) {
    test(`TC-03: Upload an unsupported file shows an error [${document.id}]`, {
      annotation: { type: 'test data', description: `${document.id}: ${document.description}` },
    }, async ({
      homePage,
      sideMenu,
      validateSignaturePage,
      errorPage,
    }) => {
      // Arrange: open the upload form
      await homePage.open();
      await sideMenu.goToValidateSignature();
      await validateSignaturePage.expectOpen();

      // Act: submit the unsupported file
      await validateSignaturePage.uploadSignedFile(document.filePath);
      await validateSignaturePage.submit();

      // Assert: DSS shows the expected error instead of a report
      await errorPage.expectError(document.expectedError);
    });
  }
});
