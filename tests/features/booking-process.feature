Feature: Hotel Booking Process
  As a customer who has found a suitable hotel
  I want to complete the booking process with accurate pricing
  So that I can confirm my reservation

  Background:
    Given I have selected a hotel in "Lagos"
    And I have completed the pricing negotiation

  @booking @positive @direct
  Scenario: Direct booking without negotiation
    Given I see a hotel "Radisson Blu Anchorage" with price "₦125,000 per night"
    And I have selected "2 nights, 1 room"
    When I click "Book Now" directly
    Then I should be redirected to the booking page
    And I should see the price calculation:
      | Component           | Amount     |
      | Base (2 nights)     | ₦250,000   |
      | VAT (7.5%)         | ₦18,750    |
      | Total              | ₦268,750   |

  @booking @positive @negotiated
  Scenario: Booking after successful negotiation
    Given I have negotiated a price from "₦180,000" to "₦153,000"
    And I have "2 adults, 1 child, 1 room" for "3 nights"
    When I click "Book This Deal" within the timer limit
    Then I should be on the booking page
    And I should see:
      | Field                  | Value      |
      | Original Price         | ₦180,000   |
      | Negotiated Price       | ₦153,000   |
      | Nights                | 3          |
      | Subtotal              | ₦459,000   |
      | VAT (7.5%)           | ₦34,425    |
      | Total Amount          | ₦493,425   |

  @booking @form-validation
  Scenario: Booking form validation
    Given I am on the booking page
    When I try to submit without filling required fields
    Then I should see validation errors for:
      | Field           | Error Message                |
      | Full Name       | Full name is required        |
      | Email           | Valid email is required      |
      | Phone Number    | Phone number is required     |
    When I fill all required fields correctly
    And I click "Confirm Booking"
    Then I should see a booking confirmation

  @booking @confirmation
  Scenario: Successful booking confirmation
    Given I have filled all booking details correctly
    When I submit the booking form
    Then I should see a booking confirmation page
    And I should see a unique booking reference starting with "BK"
    And I should see all booking details summarized
    And I should receive a confirmation email
    And the booking status should be "Confirmed"

  @booking @multiple-rooms
  Scenario: Booking multiple rooms with different occupancy
    Given I have selected "4 adults, 2 children" which requires "2 rooms"
    And the hotel price is "₦100,000 per room per night"
    And I have "2 nights" selected
    When I proceed to booking
    Then I should see the calculation:
      | Description               | Calculation              | Amount    |
      | Room 1 (2 nights)        | ₦100,000 × 2            | ₦200,000  |
      | Room 2 (2 nights)        | ₦100,000 × 2            | ₦200,000  |
      | Subtotal                  | ₦200,000 + ₦200,000     | ₦400,000  |
      | VAT (7.5%)              | ₦400,000 × 0.075        | ₦30,000   |
      | Total                     | ₦400,000 + ₦30,000      | ₦430,000  |

  @booking @edge-case @single-night
  Scenario: Single night booking (no VAT)
    Given I have selected "1 night" stay
    And the hotel price is "₦120,000 per night"
    When I proceed to booking
    Then I should see:
      | Component      | Amount     | Note          |
      | Base price     | ₦120,000   | 1 night       |
      | VAT            | ₦0         | Not applicable |
      | Total          | ₦120,000   |               |
    And I should see a note "VAT not applicable for single night stays"

  @booking @timer-expiry
  Scenario: Negotiated price expires during booking
    Given I have a negotiated price that expires in "30 seconds"
    And I am on the booking page
    When the timer expires while I'm filling the form
    Then I should see an "Offer Expired" notification
    And the booking form should be disabled
    And I should see options to "Get New Quote" or "Book at Regular Price"

  @booking @price-preservation
  Scenario: Price consistency throughout booking process
    Given I negotiated from "₦200,000" to "₦170,000"
    When I navigate through: Search → Negotiation → Booking → Confirmation
    Then the price should remain "₦170,000" at each step
    And all calculations should be based on "₦170,000"
    And the booking confirmation should show "₦170,000" as the negotiated rate

  @booking @guest-details
  Scenario: Booking with specific guest requirements
    Given I have "3 adults, 2 children, 2 rooms" selected
    When I proceed to booking
    Then I should see guest detail fields for:
      | Room | Adults | Children |
      | 1    | 2      | 1        |
      | 2    | 1      | 1        |
    And I should be able to enter names for each guest
    And I should see special requests field for children's requirements