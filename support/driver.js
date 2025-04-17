const { Builder, Capabilities } = require("selenium-webdriver");

const capabilities = Capabilities.chrome();
capabilities.set("chromeOptions", { w3c: false });

let driver;

module.exports = {
  getDriver: function () {
    if (!driver) {
      driver = new Builder().withCapabilities(capabilities).build();
    }
    return driver;
  },
  quitDriver: async function () {
    if (driver) {
      await driver.quit();
      driver = null;
    }
  },
};
