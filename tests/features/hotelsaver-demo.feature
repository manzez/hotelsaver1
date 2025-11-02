Feature: HotelSaver Application Demo
  As a user
  I want to see the HotelSaver application running in the browser
  So I can verify the tests work with the actual application

  Scenario: Open HotelSaver homepage and interact with it
    Given I start the browser for HotelSaver demo
    When I navigate to "http://localhost:3000"
    Then I should see the HotelSaver homepage
    And I should see the search form
    When I interact with the search form
    Then I should see the form respond
    And I take a screenshot of the homepage

  Scenario: Test HotelSaver search functionality
    Given I have HotelSaver open in browser
    When I navigate to "http://localhost:3000" 
    And I fill in the search form
    And I submit the search
    Then I should see search results or navigation
    And I capture the results