Feature: Hotel Negotiation and Pricing
  As a potential customer
  I want to negotiate hotel prices and see accurate calculations
  So that I can get the best deals and understand total costs

  Background:
    Given I have searched for hotels in "Lagos"
    And I can see hotel search results

  @negotiation @pricing @positive
  Scenario: Negotiate price for single room booking
    Given I see a hotel "Eko Hotel & Suites" with base price "₦180,000 per night"
    When I click "Negotiate Price" button
    Then I should be redirected to the negotiation page
    And I should see the original price "₦180,000"
    When I submit the negotiation request
    Then I should see a discounted offer
    And I should see the discount percentage applied (15% default)
    And I should see the savings amount "₦27,000"
    And I should see the new price "₦153,000"
    And I should see a 5-minute countdown timer
    And I should see "Original: ₦180,000, You save: ₦27,000"

  @negotiation @pricing @calculation
  Scenario: Calculate total cost for multiple nights and rooms
    Given I have selected dates "Nov 5 - Nov 8" (3 nights)
    And I have selected "2 adults, 1 child, 2 rooms"
    And I see a hotel with base price "₦120,000 per night per room"
    When I click "Negotiate Price" button
    Then I should see the calculation breakdown:
      | Item                    | Calculation              | Amount    |
      | Base price per room     | ₦120,000 × 2 rooms      | ₦240,000  |
      | Subtotal (3 nights)     | ₦240,000 × 3 nights     | ₦720,000  |
      | Discount (15%)          | ₦720,000 × 0.15         | ₦108,000  |
      | Discounted subtotal     | ₦720,000 - ₦108,000     | ₦612,000  |
      | VAT (7.5%)             | ₦612,000 × 0.075        | ₦45,900   |
      | Total amount           | ₦612,000 + ₦45,900      | ₦657,900  |

  @negotiation @pricing @calculation
  Scenario: Calculate pricing with different room configurations
    Given I have selected dates "Nov 1 - Nov 4" (3 nights)
    And I have selected "6 adults, 2 children, 3 rooms"
    And I see a hotel with base price "₦150,000 per night per room"
    When I negotiate the price
    Then the system should calculate:
      | Component               | Value                    |
      | Rooms needed           | 3 rooms                  |
      | Base per night         | ₦450,000 (₦150,000 × 3) |
      | Total before discount  | ₦1,350,000 (3 nights)   |
      | Discount amount        | ₦202,500 (15%)          |
      | After discount         | ₦1,147,500              |
      | VAT                    | ₦86,063                 |
      | Final total            | ₦1,233,563              |

  @negotiation @timer @positive
  Scenario: Negotiation timer functionality
    Given I have received a negotiated price offer
    When I see the 5-minute countdown timer
    Then the timer should count down from "5:00"
    And the timer should update every second
    When the timer reaches "0:00"
    Then I should see "Offer expired" message
    And the "Book Now" button should be disabled
    And I should see a "Try Again" button

  @negotiation @negative
  Scenario: Failed negotiation - no discount available
    Given I see a hotel with base price "₦200,000 per night"
    And the hotel has no available discounts
    When I click "Negotiate Price" button
    And I submit the negotiation request
    Then I should see "No discount available at this time"
    And I should see the original price "₦200,000"
    And I should see a "Book at Regular Price" button
    And I should not see a countdown timer

  @negotiation @edge-case
  Scenario: Negotiate with minimum stay requirement
    Given I have selected dates "Nov 1 - Nov 2" (1 night)
    When I try to negotiate a price
    Then I should see appropriate pricing for single night
    And VAT should not be applied for single night stays
    And the calculation should be: base price × discount only

  @negotiation @booking-flow
  Scenario: Complete negotiation to booking flow
    Given I have successfully negotiated a price of "₦153,000"
    And I have a 5-minute timer active
    When I click "Book This Deal"
    Then I should be redirected to the booking page
    And I should see the negotiated price "₦153,000" preserved
    And I should see all booking details pre-filled
    And the timer should continue counting down on booking page