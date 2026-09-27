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

/** Paths of the test files, resolved from this folder. */
const td01File = path.resolve(__dirname, 'pdf/TD-01 test-valid-signature-signed-LTA.pdf');

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
