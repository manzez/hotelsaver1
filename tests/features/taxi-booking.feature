Feature: Airport Taxi Booking
  As a traveler arriving in Nigeria
  I want to book reliable airport transportation
  So that I can get to my destination safely and comfortably

  Background:
    Given I am on the HotelSaver homepage
    And I navigate to the "Airport Taxi" section

  @taxi @booking @one-way
  Scenario: Book one-way airport transfer to hotel
    Given I am on the airport taxi booking page
    When I select "Murtala Muhammed Airport (Lagos)" as pickup
    And I select "Eko Hotel & Suites, Victoria Island" as destination
    And I choose "Standard Car" vehicle type
    And I set pickup date as "Nov 5, 2025"
    And I set pickup time as "14:30"
    And I select "One-way" trip type
    Then I should see estimated price "₦15,000"
    When I proceed to book
    Then I should see booking details:
      | Field         | Value                           |
      | From          | Murtala Muhammed Airport        |
      | To            | Eko Hotel & Suites             |
      | Date          | Nov 5, 2025                    |
      | Time          | 14:30                          |
      | Vehicle       | Standard Car                    |
      | Trip Type     | One-way                        |
      | Price         | ₦15,000                        |

  @taxi @booking @round-trip
  Scenario: Book round-trip airport transfer
    Given I am booking airport taxi
    When I select round-trip option
    And I set pickup date as "Nov 5, 2025 at 14:00"
    And I set return date as "Nov 8, 2025 at 10:00"
    And I choose "Luxury SUV" vehicle
    Then I should see pricing:
      | Trip          | Price     |
      | Outbound      | ₦25,000   |
      | Return        | ₦25,000   |
      | Total         | ₦50,000   |
    And I should see "Round-trip discount applied" if applicable

  @taxi @vehicle-types
  Scenario Outline: Different vehicle types and pricing
    Given I am booking from airport to city center
    When I select "<vehicle_type>" vehicle
    Then I should see price "<expected_price>"
    And I should see vehicle capacity "<capacity>"

    Examples:
      | vehicle_type  | expected_price | capacity        |
      | Economy Car   | ₦12,000       | 3 passengers    |
      | Standard Car  | ₦15,000       | 4 passengers    |
      | Luxury Sedan  | ₦22,000       | 4 passengers    |
      | SUV           | ₦20,000       | 6 passengers    |
      | Luxury SUV    | ₦25,000       | 6 passengers    |
      | Mini Bus      | ₦35,000       | 10 passengers   |

  @taxi @airports
  Scenario Outline: Taxi booking from different Nigerian airports
    Given I want to book taxi from "<airport>"
    When I select the airport as pickup location
    Then I should see available vehicles for "<airport>"
    And pricing should be calculated from "<airport>" rates

    Examples:
      | airport                              |
      | Murtala Muhammed Airport (Lagos)     |
      | Nnamdi Azikiwe Airport (Abuja)       |
      | Port Harcourt International Airport  |
      | Sam Mbakwe Airport (Owerri)          |

  @taxi @booking-confirmation
  Scenario: Complete taxi booking process
    Given I have selected all taxi booking details
    When I fill in passenger information:
      | Field              | Value                 |
      | Full Name          | Jane Smith           |
      | Phone Number       | +234 803 456 7890   |
      | Email              | jane@example.com     |
      | Flight Number      | ET 901               |
      | Number of Passengers| 2                   |
      | Special Requests   | Child seat required  |
    And I submit the booking
    Then I should receive taxi booking confirmation
    And I should get a reference number starting with "TX"
    And I should receive driver contact details
    And I should see pickup instructions

  @taxi @pricing-calculation
  Scenario: Taxi pricing with additional charges
    Given I am booking a taxi with base price "₦15,000"
    When I add extra services:
      | Service           | Additional Cost |
      | Child seat        | ₦2,000         |
      | Extra luggage     | ₦3,000         |
      | Wait time (30min) | ₦5,000         |
    Then the total should be "₦25,000"
    And I should see itemized breakdown

  @taxi @negative @invalid-flight
  Scenario: Booking with invalid flight information
    Given I am booking airport pickup
    When I enter an invalid flight number "XX999"
    And I submit the booking
    Then I should see "Unable to verify flight details"
    And I should see option to "Proceed without flight tracking"
    Or I should see option to "Enter correct flight number"

  @taxi @wait-time
  Scenario: Taxi booking with flight delays
    Given I have booked taxi pickup for flight "BA 075"
    When my flight is delayed by 2 hours
    Then the system should automatically adjust pickup time
    And I should receive notification about the change
    And no additional charges should apply for flight delays

  @taxi @cancellation
  Scenario: Cancel taxi booking
    Given I have a confirmed taxi booking "TX123456789"
    When I request cancellation within 24 hours of pickup
    Then I should see cancellation policy
    And I should be able to cancel with appropriate charges
    And I should receive cancellation confirmation