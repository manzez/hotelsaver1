Feature: Demo Test for Visual Browser
  A simple test to demonstrate browser automation visually

  Scenario: Open browser and show HotelSaver homepage
    Given I open a browser
    When I navigate to the HotelSaver homepage  
    Then I should see the page content