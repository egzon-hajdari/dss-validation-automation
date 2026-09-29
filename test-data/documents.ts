import path from 'node:path';
import type { SimpleReport } from '../pages/ValidationResultsPage';

/** A test file and the values its Simple Report must show. */
export interface TestDocument {
  /** Test data id, e.g. "TD-01". */
  id: string;
  /** Short description of the document, e.g. "test-valid-signature-signed-LTA". */
  description: string;
  /** Absolute path of the file to upload. */
  filePath: string;
  /** Values expected in the Simple Report, keyed by the label shown on the page. */
  expected: SimpleReport;
}

/** A file that DSS rejects, and the error message it must show. */
export interface UnsupportedDocument {
  /** Test data id, e.g. "TD-03". */
  id: string;
  /** Short description of the document, e.g. "sample PNG image". */
  description: string;
  /** Absolute path of the file to upload. */
  filePath: string;
  /** Message shown after "Oops... An error occurred!" on the error page. */
  expectedError: string;
}

/** Paths of the test files, resolved from this folder. */
const td01File = path.resolve(__dirname, 'pdf/TD-01 test-valid-signature-signed-LTA.pdf');
const td02File = path.resolve(__dirname, 'xml/TD-02_signed-xades.xml');
const td03File = path.resolve(__dirname, 'others/TD-03 sample.png');
const td07File = path.resolve(__dirname, 'pdf/TD-07 two-signatures.pdf');

/** TD-01: the valid signed PDF provided with the task (PAdES-BASELINE-LTA, 1 signature, 2 timestamps). */
export const TD01: TestDocument = {
  id: 'TD-01',
  description: 'test-valid-signature-signed-LTA',
  filePath: td01File,
  expected: {
    signatures: [
      {
        fields: {
          'Qualification:': 'QESig',
          'Qualification Details:': 'The organization name is missing in the trusted certificate!',
          'Signature format:': 'PAdES-BASELINE-LTA',
          'Indication:': 'TOTAL_PASSED',
          'Certificate Chain:': 'Noé Colbach (Signature) Citizen CA Belgium Root CA4Certipost n.v./s.a.',
          'On claimed time:': '2021-10-13 08:50:34 (UTC)',
          'Best signature time:': '2021-10-13 08:50:40 (UTC)',
          'Maximum validity time:': '2031-09-14 06:17:01 (UTC)',
          'Signature position:': '1 out of 1',
          'Signature scope:': 'Partial PDF (PARTIAL)The document ByteRange : [0, 31517, 69407, 773]',
        },
        timestamps: [
          {
            'Qualification:': 'QTSA',
            'Indication:': 'PASSED',
            'Certificate Chain:': 'Ministero della Difesa - Time Stamp Unit eIDAS 202109140827 Ministero della Difesa - Time Stamp Authority eIDASMinistero della Difesa',
            'Production time:': '2021-10-13 08:50:40 (UTC)',
          },
          {
            'Qualification:': 'TSA',
            'Qualification Details:': 'The certificate is not related to a granted status at time-stamp lowest POE time!',
            'Indication:': 'INDETERMINATE',
            'Sub indication:': 'NO_CERTIFICATE_CHAIN_FOUND_NO_POE',
            'AdES Validation Details:': "No prospective certificate chain valid at validation time has been found! The algorithm RSA with SHA1 with key size 2048 is no longer considered reliable for timestamp's CA certificate! The past time-stamp validation is not conclusive!",
            'Certificate Chain:': 'SK TIMESTAMPING AUTHORITY 2021SK ID Solutions AS EE Certification Centre Root CA',
            'Production time:': '2021-10-14 08:49:54 (UTC)',
            'Timestamp scope:': 'Full PDF (FULL)The document ByteRange : [0, 95717, 133607, 774]',
          },
        ],
      },
    ],
    documentInformation: {
      'PDF/A Profile:': 'PDF/A-1B',
      'Signatures status:': '1 valid signatures, out of 1',
      'Document name:': path.basename(td01File),
    },
  },
};

/**
 * TD-02: an enveloped XAdES-BASELINE-B XML signed with a self-signed test certificate (1 signature, no timestamp).
 * The signer is not on any trusted list, so the expected result is INDETERMINATE / NO_CERTIFICATE_CHAIN_FOUND.
 * "Best signature time" is not asserted: without a timestamp, DSS shows the validation time, which changes on every run.
 */
export const TD02: TestDocument = {
  id: 'TD-02',
  description: 'signed-xades (untrusted signer)',
  filePath: td02File,
  expected: {
    signatures: [
      {
        fields: {
          'Qualification:': 'N/A',
          'Qualification Details:': 'Unable to build a certificate chain up to a trusted list! The signature/seal is an INDETERMINATE AdES digital signature!',
          'Signature format:': 'XAdES-BASELINE-B',
          'Indication:': 'INDETERMINATE',
          'Sub indication:': 'NO_CERTIFICATE_CHAIN_FOUND',
          'AdES Validation Details:': 'The certificate chain for signature is not trusted, it does not contain a trust anchor.',
          'Certificate Chain:': 'QA Test Signer A',
          'On claimed time:': '2026-09-26 04:34:52 (UTC)',
          'Maximum validity time:': 'N/A',
          'Signature position:': '1 out of 1',
          'Signature scope:': 'Full XML File (FULL)The full XML file with transformations.',
        },
      },
    ],
    documentInformation: {
      'Signatures status:': '0 valid signatures, out of 1',
      'Document name:': path.basename(td02File),
    },
  },
};

/**
 * TD-07: a PDF signed twice (PAdES-BASELINE-B), by two self-signed test certificates, no timestamp.
 * Neither signer is on a trusted list, so both signatures are INDETERMINATE / NO_CERTIFICATE_CHAIN_FOUND.
 * Signature 1 covers the first revision (PARTIAL), signature 2 the whole file (FULL).
 * "Best signature time" is not asserted: without a timestamp, DSS shows the validation time.
 */
export const TD07: TestDocument = {
  id: 'TD-07',
  description: 'two-signatures (untrusted signers)',
  filePath: td07File,
  expected: {
    signatures: [
      {
        fields: {
          'Qualification:': 'N/A',
          'Qualification Details:': 'Unable to build a certificate chain up to a trusted list! The signature/seal is an INDETERMINATE AdES digital signature!',
          'Signature format:': 'PAdES-BASELINE-B',
          'Indication:': 'INDETERMINATE',
          'Sub indication:': 'NO_CERTIFICATE_CHAIN_FOUND',
          'AdES Validation Details:': 'The certificate chain for signature is not trusted, it does not contain a trust anchor.',
          'Certificate Chain:': 'QA Test Signer A',
          'On claimed time:': '2026-09-25 16:59:48 (UTC)',
          'Maximum validity time:': 'N/A',
          'Signature position:': '1 out of 2',
          'Signature scope:': 'Partial PDF (PARTIAL)The document ByteRange : [0, 2637, 7201, 554]',
        },
      },
      {
        fields: {
          'Qualification:': 'N/A',
          'Qualification Details:': 'Unable to build a certificate chain up to a trusted list! The signature/seal is an INDETERMINATE AdES digital signature!',
          'Signature format:': 'PAdES-BASELINE-B',
          'Indication:': 'INDETERMINATE',
          'Sub indication:': 'NO_CERTIFICATE_CHAIN_FOUND',
          'AdES Validation Details:': 'The certificate chain for signature is not trusted, it does not contain a trust anchor.',
          'Certificate Chain:': 'QA Test Signer B',
          'On claimed time:': '2026-09-25 16:59:48 (UTC)',
          'Maximum validity time:': 'N/A',
          'Signature position:': '2 out of 2',
          'Signature scope:': 'Full PDF (FULL)The document ByteRange : [0, 8497, 13061, 544]',
        },
      },
    ],
    documentInformation: {
      'PDF/A Profile:': 'PDF/A-1B',
      'Signatures status:': '0 valid signatures, out of 2',
      'Document name:': path.basename(td07File),
    },
  },
};

/** TD-03: a PNG image, which is not a signature format DSS can validate. */
export const TD03: UnsupportedDocument = {
  id: 'TD-03',
  description: 'sample PNG image (unsupported format)',
  filePath: td03File,
  expectedError: 'Document format not recognized/handled',
};
