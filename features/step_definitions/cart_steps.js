// features/step_definitions/cart.js
const logger = require("../../support/logger");
const { Given, When, Then, After } = require("@cucumber/cucumber");
const { Builder, By, until } = require("selenium-webdriver");
const { Select } = require("selenium-webdriver/lib/select");
const assert = require("assert");

// Reusable price parser
const parsePrice = (text) => parseFloat(text.replace(/[^\d.]/g, ""));

Given("I'm on the product page for {string}", async function (productName) {
  this.productName = productName;
  this.driver = await new Builder().forBrowser("chrome").build();
  const slug = productName.toLowerCase().replace(/\s+/g, "-");
  await this.driver.get(
    `https://magento.softwaretestingboard.com/${slug}.html`
  );
});

When("I select size {string} and color {string}", async function (size, color) {
  const sizeMap = {
    XS: "option-label-size-143-item-166",
    S: "option-label-size-143-item-167",
    M: "option-label-size-143-item-168",
    L: "option-label-size-143-item-169",
    XL: "option-label-size-143-item-170",
  };
  const colorMap = {
    Blue: "option-label-color-93-item-50",
    Orange: "option-label-color-93-item-56",
    Purple: "option-label-color-93-item-57",
    Green: "option-label-color-93-item-53",
    Red: "option-label-color-93-item-58",
    Black: "option-label-color-93-item-49",
  };

  const sizeId = sizeMap[size];
  const colorId = colorMap[color];

  if (!sizeId || !colorId) {
    throw new Error(`Invalid size or color: size=${size}, color=${color}`);
  }

  const sizeEl = await this.driver.wait(
    until.elementLocated(By.id(sizeId)),
    10000
  );
  await this.driver.wait(until.elementIsVisible(sizeEl), 10000);
  await sizeEl.click();

  const colorEl = await this.driver.wait(
    until.elementLocated(By.id(colorId)),
    10000
  );
  await this.driver.wait(until.elementIsVisible(colorEl), 10000);
  await colorEl.click();
});

When("I add the product to cart", async function () {
  const priceElement = await this.driver.findElement(
    By.css(".price-wrapper .price")
  );
  const priceText = await priceElement.getText();
  const price = parseFloat(priceText.replace("$", ""));

  await this.driver.findElement(By.id("product-addtocart-button")).click();

  await this.driver.sleep(3000);

  if (!this.cartItems) {
    this.cartItems = [];
  }

  this.cartItems.push({
    name: this.productName, // dynamic name from Given step
    price: price,
    quantity: 1,
  });
});

Then("I should see the product in my cart", async function () {
  await this.driver.get(
    "https://magento.softwaretestingboard.com/checkout/cart/"
  );
  const cartLink = await this.driver.wait(
    until.elementLocated(By.css("#shopping-cart-table .product-item-name a")),
    10000
  );
  await this.driver.wait(until.elementIsVisible(cartLink), 5000);
  const actualText = (await cartLink.getText()).trim();
  assert.strictEqual(
    actualText,
    this.productName,
    `Expected cart item to be "${this.productName}", but found "${actualText}"`
  );
});

Then(
  "I should see the cart counter increased by {int}",
  async function (expectedCount) {
    const counterEl = await this.driver.wait(
      until.elementLocated(By.css(".counter.qty")),
      5000
    );
    const countText = await counterEl.getText();
    assert.strictEqual(
      parseInt(countText, 10),
      expectedCount,
      `Expected cart counter to be ${expectedCount}, but was ${countText}`
    );
  }
);

When("I remove the product from the cart", async function () {
  const deleteButton = await this.driver.wait(
    until.elementLocated(By.css('a.action-delete[title="Remove item"]')),
    10000
  );
  await deleteButton.click();
  await this.driver.sleep(3000);
});

Then("the cart should be empty", async function () {
  const emptyCartLocator = By.css(".cart-empty p");
  const emptyTextElement = await this.driver.wait(
    until.elementLocated(emptyCartLocator),
    10000
  );
  const message = await emptyTextElement.getText();
  assert(
    message.includes("You have no items in your shopping cart"),
    "Expected cart to be empty"
  );
});

When("I proceed to checkout", { timeout: 30000 }, async function () {
  const miniCartToggle = await this.driver.wait(
    until.elementLocated(By.css(".action.showcart")),
    10000
  );
  await miniCartToggle.click();
  await this.driver.sleep(1000);
  const checkoutButton = await this.driver.wait(
    until.elementLocated(By.id("top-cart-btn-checkout")),
    10000
  );
  await checkoutButton.click();
  await this.driver.wait(until.urlContains("checkout"), 10000);
});

When(
  "I fill in the shipping information",
  { timeout: 30000 },
  async function () {
    await this.driver.wait(
      until.elementLocated(By.css(".checkout-container")),
      15000
    );
    await this.driver.sleep(2000);

    try {
      const emailField = await this.driver.wait(
        until.elementLocated(By.id("customer-email")),
        10000
      );
      await this.driver.executeScript(
        "arguments[0].scrollIntoView(true);",
        emailField
      );
      await this.driver.wait(until.elementIsVisible(emailField), 5000);
      await emailField.clear();
      await emailField.sendKeys("ali@gmail.com");
    } catch (err) {
      console.warn("Email field not interactable, skipping input.");
    }

    await this.driver.findElement(By.name("firstname")).sendKeys("Ali");
    await this.driver.findElement(By.name("lastname")).sendKeys("Ahmed");
    await this.driver.findElement(By.name("company")).sendKeys("RedSW");
    await this.driver.findElement(By.name("street[0]"))?.sendKeys("123 Street");
    await this.driver.findElement(By.name("street[1]"))?.sendKeys("456 Street");
    await this.driver.findElement(By.name("street[2]"))?.sendKeys("Near Park");
    await this.driver.findElement(By.name("city")).sendKeys("Giza");

    const regionEl = await this.driver.wait(
      until.elementLocated(By.name("region_id")),
      10000
    );
    const regionSelect = new Select(regionEl);
    await regionSelect.selectByVisibleText("California");

    await this.driver.findElement(By.name("postcode")).sendKeys("12345");
    await this.driver.findElement(By.name("telephone")).sendKeys("0123456789");

    const countryEl = await this.driver.wait(
      until.elementLocated(By.name("country_id")),
      10000
    );
    const countrySelect = new Select(countryEl);
    await countrySelect.selectByVisibleText("Egypt");

    await this.driver.sleep(3000);

    const shippingMethod = await this.driver.wait(
      until.elementLocated(By.css("input[type='radio'][name^='ko_unique_']")),
      10000
    );
    await shippingMethod.click();

    const nextButton = await this.driver.wait(
      until.elementLocated(By.css(".button.action.continue.primary")),
      10000
    );
    await nextButton.click();
  }
);

Given(
  "I add the following products to the cart:",
  { timeout: 60000 },
  async function (dataTable) {
    this.driver = await new Builder().forBrowser("chrome").build();

    const sizeMap = {
      XS: "option-label-size-143-item-166",
      S: "option-label-size-143-item-167",
      M: "option-label-size-143-item-168",
      L: "option-label-size-143-item-169",
      XL: "option-label-size-143-item-170",
    };
    const colorMap = {
      Blue: "option-label-color-93-item-50",
      Orange: "option-label-color-93-item-56",
      Purple: "option-label-color-93-item-57",
      Green: "option-label-color-93-item-53",
      Red: "option-label-color-93-item-58",
      Black: "option-label-color-93-item-49",
    };

    for (const row of dataTable.hashes()) {
      const { Product, Size, Color } = row;
      const slug = Product.toLowerCase().replace(/\s+/g, "-");
      await this.driver.get(
        `https://magento.softwaretestingboard.com/${slug}.html`
      );

      const sizeId = sizeMap[Size];
      const colorId = colorMap[Color];

      const sizeEl = await this.driver.wait(
        until.elementLocated(By.id(sizeId)),
        10000
      );
      await this.driver.wait(until.elementIsVisible(sizeEl), 10000);
      await sizeEl.click();

      const colorEl = await this.driver.wait(
        until.elementLocated(By.id(colorId)),
        10000
      );
      await this.driver.wait(until.elementIsVisible(colorEl), 10000);
      await colorEl.click();

      const addBtn = await this.driver.wait(
        until.elementLocated(By.id("product-addtocart-button")),
        10000
      );
      await this.driver.wait(until.elementIsEnabled(addBtn), 10000);
      await addBtn.click();
      await this.driver.sleep(3000);
    }
  }
);

// Check all products are in cart
Then("I should see all products in the cart", async function () {
  await this.driver.get(
    "https://magento.softwaretestingboard.com/checkout/cart/"
  );
  const itemElements = await this.driver.findElements(
    By.css("#shopping-cart-table .product-item-name a")
  );
  const itemCount = itemElements.length;
  assert(
    itemCount >= 2,
    `Expected at least 2 products in the cart, but found ${itemCount}`
  );
});

Then("I should see a confirmation message", async function () {
  const confirmation = await this.driver.wait(
    until.elementLocated(By.css(".checkout-success")),
    10000
  );
  const message = await confirmation.getText();
  assert(message.includes("Thank you for your purchase") || message.length > 0);
});

When("I place the order", { timeout: 30000 }, async function () {
  await this.driver.wait(
    until.elementLocated(By.css(".checkout-payment-method")),
    10000
  );
  const placeOrderBtn = await this.driver.wait(
    until.elementLocated(By.css("button.action.primary.checkout")),
    10000
  );
  await this.driver.executeScript(
    "arguments[0].scrollIntoView(true);",
    placeOrderBtn
  );
  await this.driver.wait(until.elementIsVisible(placeOrderBtn), 5000);
  await this.driver.wait(until.elementIsEnabled(placeOrderBtn), 5000);

  try {
    await placeOrderBtn.click();
  } catch (e) {
    console.warn("Click intercepted. Trying JS click...");
    await this.driver.executeScript("arguments[0].click();", placeOrderBtn);
  }

  await this.driver.sleep(5000);
});

Then(
  "I should see the correct subtotal and total in the cart",
  { timeout: 20000 },
  async function () {
    // Go to checkout summary page
    await this.driver.get(
      "https://magento.softwaretestingboard.com/checkout/#payment"
    );

    // Wait for the subtotal and total to be visible
    const subtotalEl = await this.driver.wait(
      until.elementLocated(By.css("tr.totals.sub span.price")),
      10000
    );
    const totalEl = await this.driver.wait(
      until.elementLocated(By.css("tr.grand.totals span.price")),
      10000
    );

    const subtotalText = await subtotalEl.getText();
    const totalText = await totalEl.getText();

    const actualSubtotal = parseFloat(subtotalText.replace("$", ""));
    const actualTotal = parseFloat(totalText.replace("$", ""));

    // Compute expected values from stored items
    const expectedSubtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const expectedTotal = expectedSubtotal + 5.0; // Flat rate shipping

    // Log for debug
    console.log(
      `Expected subtotal: $${expectedSubtotal}, Found: $${actualSubtotal}`
    );
    console.log(`Expected total: $${expectedTotal}, Found: $${actualTotal}`);

    // Assertions
    assert.strictEqual(
      actualSubtotal,
      expectedSubtotal,
      `Expected subtotal to be $${expectedSubtotal}`
    );
    assert.strictEqual(
      actualTotal,
      expectedTotal,
      `Expected total to be $${expectedTotal}`
    );

    await this.driver.sleep(3000);
  }
);

After(async function () {
  if (this.driver) {
    await this.driver.quit();
  }
});
