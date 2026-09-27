/**
 * Central test configuration: all environments and settings live here.
 * Every value can be overridden with an environment variable,
 * so the same test runs locally, in CI, or against another instance without code changes.
 */

/** Supported environments and their URLs. Add a new environment here. */
const environments = {
  demo: 'https://dss-demo.nowina.lu',
  prod: 'https://dss.nowina.lu',
};

type EnvironmentName = keyof typeof environments;

/** Environment used when TEST_ENV is not set. */
const DEFAULT_ENV: EnvironmentName = 'demo';

const name = (process.env.TEST_ENV ?? DEFAULT_ENV) as EnvironmentName;
if (!(name in environments)) {
  throw new Error(`Unknown TEST_ENV "${name}". Use one of: ${Object.keys(environments).join(', ')}`);
}

export const env = {
  /** Base URL of the application under test. BASE_URL overrides the URL of TEST_ENV. */
  baseUrl: process.env.BASE_URL ?? environments[name],

  /** Max wait (ms) for the server-side validation result. */
  validationTimeout: Number(process.env.VALIDATION_TIMEOUT ?? 60_000),
};
