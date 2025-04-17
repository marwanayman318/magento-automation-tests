Feature: Product Search
    As a customer
    I want to search for products
    So I can find what I'm looking for

    Scenario: User searches for a product and applies a filter
        Given I am on the home page
        When I search for "jacket"
        Then I should see results that include "jacket"
