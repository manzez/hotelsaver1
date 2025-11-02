Feature: Hotel Search Functionality
  As a user planning a trip
  I want to search for hotels by location, dates, and preferences
  So that I can find accommodations that meet my needs

  Background:
    Given I am on the HotelSaver homepage
    And the search bar displays default dates "Nov 1 - Nov 3"

  @smoke @search
  Scenario: Default search with pre-filled dates
    When I view the search bar
    Then I should see "Nov 1 - Nov 3" as default dates
    And I should see "2 adults, 0 children, 1 room" as default guests
    And I should see "Under ₦80k" as default budget

  @search @positive
  Scenario: Search for hotels in Lagos with specific criteria
    Given I am on the homepage
    When I enter "Lagos" in the location field
    And I select check-in date as "Nov 5, 2025"
    And I select check-out date as "Nov 8, 2025"
    And I set guests to "3 adults, 1 child, 2 rooms"
    And I select budget range "₦130k–₦200k"
    And I select stay type "Hotel"
    And I click the search button
    Then I should be redirected to the search results page
    And I should see search results for Lagos
    And I should see "3 nights, 05 Nov–08 Nov" in the results summary
    And I should see hotels with prices between ₦130,000 and ₦200,000
    And I should see room configuration for "2 rooms"

  @search @positive
  Scenario Outline: Search hotels in different Nigerian cities
    Given I am on the homepage
    When I enter "<city>" in the location field
    And I click the search button
    Then I should see search results for "<city>"
    And I should see hotels located in "<city>"

    Examples:
      | city          |
      | Lagos         |
      | Abuja         |
      | Port Harcourt |
      | Owerri        |

  @search @negative
  Scenario: Search with invalid or empty location
    Given I am on the homepage
    When I clear the location field
    And I click the search button
    Then I should remain on the homepage
    And I should see a validation message

  @search @datepicker
  Scenario: Date picker functionality
    Given I am on the homepage
    When I click on the date picker field
    Then the date picker modal should open
    And I should see the default dates "Nov 1 - Nov 3" selected
    When I click on "Nov 10, 2025" for check-in
    Then I should see "Nov 10" as selected check-in date
    And the modal should remain open
    When I click on "Nov 15, 2025" for check-out
    Then I should see "Nov 15" as selected check-out date
    And I should see a visual connection between the selected dates
    When I click the "Done" button
    Then the date picker modal should close
    And I should see "Nov 10 - Nov 15" in the search bar

  @search @budget
  Scenario Outline: Filter hotels by budget range
    Given I am on the homepage
    When I enter "Lagos" in the location field
    And I select budget range "<budget_range>"
    And I click the search button
    Then I should see hotels with prices in the "<expected_range>" range

    Examples:
      | budget_range  | expected_range   |
      | Under ₦80k    | ₦0 - ₦80,000    |
      | ₦80k–₦130k    | ₦80,000 - ₦130,000 |
      | ₦130k–₦200k   | ₦130,000 - ₦200,000 |
      | ₦200k+        | ₦200,000+       |

  @search @mobile
  Scenario: Mobile search functionality
    Given I am using a mobile device
    And I am on the homepage
    When I tap on the location field
    Then I should see the mobile search interface
    When I enter "Abuja" in the location field
    And I tap the search button
    Then I should see search results optimized for mobile