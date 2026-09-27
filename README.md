# DSS Validation – Test Automation Framework

UI test automation framework for the **DSS web application** (https://dss-demo.nowina.lu),
built with **Playwright + TypeScript**.

It uses the Page Object Model, Playwright fixtures and data-driven assertions:
tests describe the scenario, page objects handle the UI, and expected results live in test data.

---

## Contents
- [Delivered test](#delivered-test)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Running the tests](#running-the-tests)
- [Reading the results](#reading-the-results)
- [Reports](#reports)
- [Extending the framework](#extending-the-framework)
- [Design decisions](#design-decisions)
- [Limitations](#limitations)

---

## Delivered test
| | |
|---|---|
| Test case | **TC-01: Validate a valid signed PDF with default settings** |
| Test data | **TD-01**: the signed PDF provided with the task (`test-data/pdf/`), PAdES-BASELINE-LTA, 1 signature, 2 timestamps |
| Spec | `tests/validate-signature.spec.ts` |
| Run it | `npx playwright test --grep TC-01` |

**Why this test case**
- **Highest business value:** validating a correctly signed document is the main purpose of the "Validate a signature" page.
- **Deterministic:** the provided file has a known expected result (`TOTAL_PASSED`), so the outcome is unambiguous.
- **Best fit for automation:** a stable happy path worth re-running on every build, which makes it the natural smoke test.

**What it checks**
1. The application opens and "Validate a signature" is reached through the side menu (URL and page title checked on each page).
2. The PDF is uploaded and submitted with default settings.
3. The "Validation results" page opens with the Simple Report selected.
4. The Simple Report matches the expected content of TD-01:
   - **Signature:** indication `TOTAL_PASSED`, format, certificate chain, signing times, position and scope
   - **Timestamps:** both timestamps (expanded from the collapsed section), with their indication, times and scope
   - **Document Information:** signature status and document name

**Values that depend on external data**
Some asserted values come from the EU Trusted Lists and the DSS validation policy, not only from the file:
the signature's qualification and maximum validity time, the trust service names in the certificate chains,
and the qualification and indication of timestamp 2 (`INDETERMINATE`, because DSS no longer trusts RSA with SHA1).
They are asserted on purpose to cover the full report. If the Trusted Lists or the policy change,
update them in `test-data/documents.ts`: a failure on these fields alone is not a DSS regression.

**Not automated here**
Negative cases (tampered, unsigned or unsupported files) and XML signatures reuse the same page objects:
they only need new test data and a new spec. Detached signatures (original files) and the other report tabs
also need new locators and methods in the page objects.

---

## Prerequisites
- **Node.js 20+** and npm (check with `node -v`)
- **Git**
- Internet access to the DSS instance under test

## Installation
```bash
git clone https://github.com/egzon-hajdari/dss-validation-automation.git
cd dss-validation-automation
npm install
npx playwright install chromium
```

## Project structure
```
├── config/env.ts                    # environments, base URL, validation timeout
├── components/                      # UI parts shared by several pages (e.g. SideMenu)
├── pages/                           # one page object per DSS page
├── fixtures/index.ts                # page objects registered as Playwright fixtures
├── test-data/
│   ├── documents.ts                 # test documents + expected Simple Report values
│   ├── pdf/                         # PDF test files
│   ├── xml/                         # XML test files
│   └── others/                      # other file types
├── tests/                           # test specs (*.spec.ts)
├── playwright.config.ts             # timeouts, reporters, browser, evidence on failure
└── .github/workflows/playwright.yml # CI: type check + tests on every push / PR
```

**Layers:** `tests` describe *what* is checked → `fixtures` provide the page objects → `pages` / `components`
know *how* to interact with the UI → `test-data` / `config` hold *which* data and environment.
A UI change touches only `pages`/`components`; new expected values touch only `test-data`.

## Configuration

### Environments
All environments are defined in `config/env.ts`:
```ts
const environments = {
  demo: 'https://dss-demo.nowina.lu',
  prod: 'https://dss.nowina.lu',
};
const DEFAULT_ENV: EnvironmentName = 'demo';
```

| Variable | Default | Purpose |
|---|---|---|
| `TEST_ENV` | `demo` | Environment to run against: `demo` or `prod` |
| `BASE_URL` | – | Any other URL (e.g. a local or CI instance). Takes priority over `TEST_ENV` |
| `VALIDATION_TIMEOUT` | `60000` | Max wait (ms) for the server-side validation. The test timeout follows it (+30 s) |

An unknown `TEST_ENV` stops the run before any browser opens:
`Unknown TEST_ENV "staging". Use one of: demo, prod`.

**To add an environment:** add one line to `environments` in `config/env.ts`.

### Playwright settings (`playwright.config.ts`)
| Setting | Value | Why |
|---|---|---|
| Browser | Chromium | No browser-specific behaviour in scope |
| Retries | `0` | A flaky result should be visible, not hidden |
| Screenshot / trace | On failure only | Evidence for failed runs, no overhead on passing ones |
| `forbidOnly` | On in CI | A forgotten `test.only` fails the CI build |

## Running the tests
All tests are in the **`tests/`** folder.

| What | Command |
|---|---|
| All tests, headless (no browser window) | `npm test` |
| All tests, **with the browser visible** | `npm run test:headed` |
| **UI Mode**: run, watch and time-travel through each step | `npm run test:ui` |
| **Step-by-step debugging** (Playwright Inspector) | `npx playwright test --debug` |
| **A specific test case** by its id | `npx playwright test --grep TC-xx` |
| A specific test file | `npx playwright test tests/<file>.spec.ts` |
| Tests with a tag | `npx playwright test --grep @smoke` |
| **Against prod** | `npm run test:prod` or `TEST_ENV=prod npx playwright test` |
| Against any URL | `BASE_URL=http://localhost:8080 npx playwright test` |
| Type check only | `npm run typecheck` |

Options can be combined, e.g. `TEST_ENV=prod npx playwright test --grep TC-xx --headed`.

> **Windows (PowerShell):** set variables with `$env:TEST_ENV="prod"; npx playwright test`.

## Reading the results
Every page action is printed as a step in the terminal:
```
1.1 › Open the main page
1.2 › Side menu: open "Validate a signature"
1.3 › "Validate a signature" page is open
1.4 › Upload signed file "<file name>"
1.5 › Click "Submit"
1.6 › "Validation results" page is open
1.7 › Simple Report shows the expected values
✓  1 [chromium] › TC-xx: <test case title> @smoke
1 passed
```

- **Pass:** `✓` and `N passed`, exit code `0`.
- **Fail:** `✘` and `N failed`, exit code `1`. Each wrong value is named, with its expected and received values.
  Field checks are **soft assertions**, so all mismatches are reported in one run:
  ```
  Error: Signature 1 – Indication:
    - TOTAL_FAILED
    + TOTAL_PASSED
  ```

## Reports
| Report | How to open | Contains |
|---|---|---|
| Terminal | Printed during the run | Steps, pass/fail, errors |
| **HTML report** | `npm run report` | Steps, named assertions, tags, linked test data (`test data: TDxx: …`) |
| Screenshot (failure only) | Linked in the HTML report, or `test-results/<test>/test-failed-1.png` | The page at the moment of failure |
| Trace (failure only) | Linked in the HTML report, or `npx playwright show-trace test-results/<test>/trace.zip` | Step-by-step replay with DOM snapshots, network and console |
| CI | GitHub Actions → run → **Artifacts** → `playwright-report` | The same HTML report |

## Extending the framework

### Add a page
1. Create `pages/<PageName>Page.ts`, named after the page as shown on the website:
   ```ts
   export class ValidateCertificatePage {
     static readonly path = '/certificate-validation';
     static readonly title = 'Validate a certificate';

     readonly heading: Locator;

     constructor(private readonly page: Page) {
       this.heading = page.getByRole('heading', { name: ValidateCertificatePage.title, exact: true });
     }

     async expectOpen(): Promise<void> {
       await test.step(`"${ValidateCertificatePage.title}" page is open`, async () => {
         await expect(this.page).toHaveURL(ValidateCertificatePage.path);
         await expect(this.heading).toBeVisible();
       }, { box: true });
     }
   }
   ```
2. Register it in `fixtures/index.ts` (add it to the `Fixtures` type and create it below), so tests can request it by name.
3. If the page is reached from the side menu, add a `goTo…()` method to `components/SideMenu.ts`:
   ```ts
   async goToValidateCertificate(): Promise<void> {
     await this.open('Validate a certificate');
   }
   ```

### Add locators and methods
- **Locators:** declare the field in the class and initialise it in the constructor.
  Prefer user-facing locators: `getByRole`, `getByLabel`, `getByText`. Use CSS or ids only when the page offers nothing better.
- **Methods:** one method per user action or page check. Wrap the body in `test.step('…', …, { box: true })`,
  so the action is printed and any failure points to the test line that called it.
- **Naming:** method names and step titles describe the **page action**, never the scenario
  (e.g. `submit()` → `Click "Submit"`, not "Submit with default options"), so any test can reuse them.
- **Checks** that belong to the page (is it open? does the report match?) are `expect…()` methods. Expected values are never hard-coded in a page.

### Write a test case
```ts
import { test } from '../fixtures';
import { TDxx } from '../test-data/documents';

test.describe('<Feature>', () => {
  test('TC-xx: <test case title>', {
    tag: '@smoke',
    annotation: { type: 'test data', description: `${TDxx.id}: ${TDxx.description}` },
  }, async ({ homePage, sideMenu, validateSignaturePage, validationResultsPage }) => {
    // Arrange
    await homePage.open();
    await sideMenu.goToValidateSignature();
    await validateSignaturePage.expectOpen();

    // Act
    await validateSignaturePage.uploadSignedFile(TDxx.filePath);
    await validateSignaturePage.submit();

    // Assert
    await validationResultsPage.expectOpen();
    await validationResultsPage.expectSimpleReport(TDxx.expected);
  });
});
```
- **Title:** `TC-xx: <test case title>`. **TC** = test case id, **TD** = test data id.
- Import `test` from `../fixtures`, not from `@playwright/test`.
- Each test targets **one specific document**. The `annotation` links it in the HTML report.
- Structure the body as **Arrange / Act / Assert**.

### Add test data
1. Put the file in the folder for its type: `test-data/pdf/`, `test-data/xml/` or `test-data/others/`.
2. Add an entry in `test-data/documents.ts`:
   ```ts
   const tdxxFile = path.resolve(__dirname, 'pdf/TD-xx <file name>.pdf');

   export const TDxx: TestDocument = {
     id: 'TD-xx',
     description: '<short description>',
     filePath: tdxxFile,
     expected: {
       signatures: [
         {
           fields: { 'Indication:': 'TOTAL_PASSED', 'Signature format:': 'PAdES-BASELINE-B' },
           timestamps: [{ 'Indication:': 'PASSED' }],   // optional
         },
       ],
       documentInformation: {
         'Signatures status:': '1 valid signatures, out of 1',
         'Document name:': path.basename(tdxxFile),
       },
     },
   };
   ```

Rules for expected values:
- **Labels** must match the page exactly, including the colon: `'Signature format:'`.
- **Values** are the full text of the row. Spaces and line breaks are ignored; icons have no text.
  Some rows have no space between parts in the HTML, so run the test once: the error shows the exact text the page contains.
- **Order:** entries in `signatures` and `timestamps` follow the order on the page. Their number is the expected number of cards.
- **`timestamps` is optional:** leave it out for files without timestamps (don't write an empty list).
- **Adding or removing a field** needs no code change, only `documents.ts`.

## Design decisions
- **Page Object Model + shared components:** pages hold locators and actions; the side menu, shown on every page, is its own component.
  Composition over a base class, which keeps each page simple.
- **Playwright fixtures:** page objects are created in one place (`fixtures/index.ts`) and requested by name in tests.
- **Built-in Playwright features only:** `test.step`, fixtures, soft assertions, tags, annotations, HTML report, traces. No custom framework code.
- **Data-driven assertions:** expected values live in `test-data/documents.ts` as *label → value* pairs. `expectSimpleReport()` checks whatever the data lists.
- **Hard vs soft assertions:** card counts are hard (field checks are meaningless if a card is missing). Field values are soft (all mismatches reported in one run).
- **Scoped field lookup:** fields are read only from their own card, because a signature card contains nested timestamp cards with their own `Indication:`.
  Labels are matched exactly, so `Indication:` does not match `Sub indication:`.
- **User-facing locators:** role, label and text first, so tests don't break when CSS changes.
- **No sleeps:** Playwright auto-waits. The only extended wait is the server-side validation (`VALIDATION_TIMEOUT`).
- **No retries, Chromium only, demo by default:** failures stay visible, and the shared prod instance isn't hit by default.
- **Navigation through the side menu,** as a user would, so the navigation itself is covered.
- **One place per change:** URLs in `config/env.ts`, page paths and titles in each page, page creation in `fixtures/index.ts`, expected values in `test-data/documents.ts`.

## Limitations
- **Shared public instance:** the default target is a public DSS demo running a SNAPSHOT build. Downtime, slowness or UI changes can fail tests without any change in the tests.
- **Values that depend on external data:** some report values (qualification, validity times, trust service names, timestamp indications)
  come from the **EU Trusted Lists** and the **DSS validation policy**, not only from the file. If those change, expected values may need updating without any regression in DSS.
- **Simple Report only:** the Detailed Report, Diagnostic tree and ETSI Validation Report tabs are not mapped yet.
- **Side menu links that open a new tab** (Documentation, Report a bug, Contact us) are listed but not supported by `SideMenu.open()`.
- **Chromium only.**
- **Environment variable syntax** in the npm scripts (`TEST_ENV=prod …`) works on macOS/Linux. Use the PowerShell syntax on Windows.
