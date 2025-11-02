export default {
  requireModule: ['ts-node/register'],
  require: ['tests/step-definitions/**/*.ts'],
  format: [
    'progress',
    'html:test-results/cucumber-report.html',
    'json:test-results/cucumber-report.json',
    'junit:test-results/cucumber-junit.xml'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true,
  dryRun: false,
  failFast: false,
  strict: true,
  parallel: 2
};