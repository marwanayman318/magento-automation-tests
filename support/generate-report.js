// support/generate-report.js
const reporter = require("cucumber-html-reporter");

const options = {
  theme: "bootstrap",
  jsonFile: "reports/cucumber_report.json",
  output: "reports/cucumber_report.html",
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
    "Test Environment": "Local",
    Browser: "Chrome",
    Platform: process.platform,
    Executed: "Automated",
  },
};

reporter.generate(options);
