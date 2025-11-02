Feature: Visual Browser Automation Demo
  As a developer
  I want to see Playwright browser automation working
  So I can verify the test framework is functional

  Scenario: Show browser automation with visual interactions
    Given I open a browser with visual settings
    When I navigate to a working website
    Then I should see the page load successfully
    And I should see browser interactions happening
    When I perform some visual actions
    Then I should see the actions complete
    And I close the browser gracefully

  Scenario: Demonstrate test framework capabilities
    Given I have a functional browser
    When I navigate to Google
    And I search for "HotelSaver Nigeria"
    Then I should see search results
    And I take a screenshot for verification