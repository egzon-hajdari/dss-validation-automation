import { test } from '../fixtures';
import { TD01 } from '../test-data/documents';

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
