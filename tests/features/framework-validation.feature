Feature: Framework Validation
  Basic validation that the test framework is properly configured

  Scenario: Application loads successfully
    Given I am on the HotelSaver homepage
    Then I should see the main navigation
    And I should see the search interface

  Scenario: Search functionality is accessible
    Given I am on the HotelSaver homepage
    When I enter "Lagos" as the destination city
    Then the search form should accept the input

  Scenario: Services page is accessible
    Given I am on the services page
    Then I should see the services interface