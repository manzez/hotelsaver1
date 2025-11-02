Feature: Services Booking
  As a user looking for local services
  I want to search, compare and book various services
  So that I can get assistance during my stay

  Background:
    Given I am on the HotelSaver homepage
    And I navigate to the "Services" section

  @services @search @positive
  Scenario: Search for services by city and category
    Given I am on the services page
    When I select "Lagos" as the city
    And I select "Hair" as the service category
    And I click search
    Then I should see a list of hair service providers in Lagos
    And each result should show provider name, rating, and price
    And I should see services with category "Hair"

  @services @categories
  Scenario Outline: Browse different service categories
    Given I am on the services page
    When I select "<category>" category
    Then I should see services related to "<category>"
    And each service should display the correct category

    Examples:
      | category     |
      | Massage      |
      | Hair         |
      | Nails        |
      | Cleaning     |
      | Security     |
      | Catering     |
      | Chef         |
      | Car hire     |
      | Guide        |
      | Photography  |
      | Livestock    |
      | Braiding     |
      | Dry Cleaning |

  @services @booking @positive
  Scenario: Book a massage service
    Given I search for "Massage" services in "Lagos"
    And I see "Therapeutic Massage Centre" with price "₦25,000"
    When I click "Book Service"
    Then I should be on the service booking page
    And I should see service details:
      | Field          | Value                      |
      | Service        | Therapeutic Massage Centre |
      | Category       | Massage                    |
      | Price          | ₦25,000                   |
      | Duration       | 1-2 hours                  |
      | Location       | Lagos                      |

  @services @booking @form-validation
  Scenario: Service booking form validation
    Given I am booking a "Hair Braiding" service for "₦15,000"
    When I try to submit the booking form without required fields
    Then I should see validation errors:
      | Field           | Error Message                    |
      | Full Name       | Name is required                |
      | Phone Number    | Phone number is required        |
      | Service Date    | Please select a service date    |
      | Number of People| Please specify number of people |

  @services @booking @confirmation
  Scenario: Successful service booking
    Given I am booking "Professional Photography" for "₦50,000"
    When I fill in all required details:
      | Field           | Value                    |
      | Full Name       | John Doe                |
      | Phone           | +234 801 234 5678      |
      | Email           | john@example.com        |
      | Service Date    | Nov 10, 2025           |
      | People Count    | 3                       |
      | Special Request | Wedding photography     |
    And I submit the booking
    Then I should see booking confirmation
    And I should receive a service reference starting with "SV"
    And the status should be "Confirmed"

  @services @pricing @multiple-people
  Scenario: Service pricing for multiple people
    Given I am booking "Catering" service with base price "₦80,000"
    When I set the number of people to "5"
    Then the system should calculate pricing for 5 people
    And I should see the total adjusted price
    And the booking should reflect "5 people" in the details

  @services @cities
  Scenario Outline: Service availability across Nigerian cities
    Given I am searching for services
    When I select "<city>" as location
    Then I should see services available in "<city>"
    And all results should be tagged with "<city>"

    Examples:
      | city          |
      | Lagos         |
      | Abuja         |
      | Port Harcourt |
      | Owerri        |

  @services @negative
  Scenario: No services available
    Given I search for "Livestock" services in "Owerri"
    When no services are available in that category and location
    Then I should see "No services found" message
    And I should see suggestions to:
      | Option                           |
      | Try a different city            |
      | Browse other service categories |
      | Contact us for custom requests  |

  @services @special-categories
  Scenario: Book livestock services
    Given I search for "Livestock" services
    And I see "Premium Goat Supplier" with price "₦120,000"
    When I click to book the service
    Then I should see specialized fields for livestock:
      | Field              | Type     |
      | Animal Type        | Dropdown |
      | Quantity           | Number   |
      | Delivery Date      | Date     |
      | Delivery Location  | Text     |
      | Special Requirements| Textarea |