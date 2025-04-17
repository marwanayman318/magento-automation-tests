Feature: Manage Shopping Cart

  Scenario: Add a product to the cart
    Given I'm on the product page for "Radiant Tee"
    When I select size "M" and color "Blue"
    And I add the product to cart
    Then I should see the product in my cart
    And I should see the cart counter increased by 1

  Scenario: Remove a product from the shopping cart
    Given I'm on the product page for "Radiant Tee"
    When I select size "M" and color "Blue"
    And I add the product to cart
    Then I should see the product in my cart
    When I remove the product from the cart
    Then the cart should be empty

  Scenario: Complete checkout with a single item
    Given I'm on the product page for "Radiant Tee"
    When I select size "M" and color "Blue"
    And I add the product to cart
    And I proceed to checkout
    And I fill in the shipping information
    And I place the order
    Then I should see a confirmation message

  Scenario: Add multiple products to the cart
    Given I add the following products to the cart:
      | Product     | Size | Color |
      | Radiant Tee | M    | Blue  |
      | Hero Hoodie | S    | Black |
    Then I should see all products in the cart
    And I should see the cart counter increased by 2

  Scenario: Subtotal and total price should be calculated correctly
    Given I'm on the product page for "Juno Jacket"
    When I select size "L" and color "Green"
    And I add the product to cart
    And I proceed to checkout
    And I fill in the shipping information
    Then I should see the correct subtotal and total in the cart


