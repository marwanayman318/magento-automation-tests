const { By } = require("selenium-webdriver");

class HomePage {
  constructor(driver) {
    this.driver = driver;
    this.url = "https://magento.softwaretestingboard.com/";
    this.searchBar = By.id("search");
    this.searchButton = By.className("action search");
    this.productTitles = By.className("product-item-link");
  }

  async open() {
    await this.driver.get(this.url);
  }

  async search(term) {
    await this.driver.findElement(this.searchBar).sendKeys(term);
    await this.driver.findElement(this.searchButton).click();
  }

  async resultsContain(term) {
    const elements = await this.driver.findElements(this.productTitles);
    for (let el of elements) {
      const text = await el.getText();
      console.log("Result Title: ", text);
      if (text.toLowerCase().includes(term.toLowerCase())) {
        return true;
      }
    }
    return false;
  }
}

module.exports = HomePage;
