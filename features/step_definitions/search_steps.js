const { Given, When, Then, After } = require("@cucumber/cucumber");
const assert = require("assert");

const { getDriver, quitDriver } = require("../../support/driver");
const HomePage = require("../../pages/HomePage");

let driver;
let homePage;

Given("I am on the home page", async function () {
  driver = getDriver();
  homePage = new HomePage(driver);
  await homePage.open();
});

When("I search for {string}", async function (term) {
  await homePage.search(term);
});

Then(
  "I should see results that include {string}",
  { timeout: 30000 },
  async function (term) {
    const result = await homePage.resultsContain(term);
    assert.strictEqual(result, true, `No results include "${term}"`);
  }
);

After(async function () {
  await quitDriver();
});
