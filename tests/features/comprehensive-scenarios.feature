Feature: Comprehensive E2E Tests for HotelSaver Application

  Background:
    Given the user is on the HotelSaver homepage

  @EmailNotification
  Scenario: Successful booking triggers email notifications
    Given the user searches for a hotel in "Lagos"
    When the user selects the first available hotel
    And the user proceeds to the negotiation page
    And the user accepts the negotiated price
    And the user fills in their booking details with email "customer@example.com"
    And the user confirms the booking
    Then an email confirmation should be sent to "customer@example.com"
    And a notification email should be sent to the hotel's email address

  @HotelPortal @Positive
  Scenario: Hotel manager successfully logs in and views bookings
    Given a hotel manager navigates to the hotel portal login page
    When the manager enters the email "hotel@example.com" and password "password"
    And the manager clicks the "Login" button
    Then the manager should be redirected to the bookings dashboard
    And the manager should see a list of their hotel's bookings

  @HotelPortal @Negative
  Scenario: Hotel manager fails to log in with invalid credentials
    Given a hotel manager navigates to the hotel portal login page
    When the manager enters the email "wrong@example.com" and password "wrongpassword"
    And the manager clicks the "Login" button
    Then the manager should see an "Invalid credentials" error message
    And the manager should remain on the login page

  @HotelPortal @Positive
  Scenario: Hotel manager views their payments
    Given a logged-in hotel manager is on the bookings dashboard
    When the manager navigates to the payments overview page
    Then the manager should see a list of payments received

  @Admin @Facilities @Future
  Scenario Outline: Admin manages hotel facilities
    Given a logged-in admin is on the hotel management page for "<hotelId>"
    When the admin adds the facility "<facility>"
    Then the facility "<facility>" should be listed for "<hotelId>"
    When the admin removes the facility "<facility>"
    Then the facility "<facility>" should no longer be listed for "<hotelId>"

    Examples:
      | hotelId               | facility      |
      | transcorp-hilton-abuja | "Swimming Pool" |
      | eko-hotel-suites      | "Free Wi-Fi"  |

  @Admin @Pricing @Future @Positive
  Scenario: Admin successfully changes a hotel's base price
    Given a logged-in admin is on the pricing management page for "eko-hotel-suites"
    When the admin updates the base price to "150000"
    Then the base price for "eko-hotel-suites" should be "150000"
    And a confirmation message "Price updated successfully" should be displayed

  @Admin @Pricing @Future @Negative
  Scenario: Admin fails to change a hotel's base price with an invalid value
    Given a logged-in admin is on the pricing management page for "eko-hotel-suites"
    When the admin attempts to update the base price to "-100"
    Then an error message "Invalid price value" should be displayed
    And the base price for "eko-hotel-suites" should remain unchanged

  @Admin @Discounts @Future @Positive
  Scenario: Admin successfully changes a hotel's discount percentage
    Given a logged-in admin is on the discount management page for "transcorp-hilton-abuja"
    When the admin sets the discount percentage to "25"
    Then the discount for "transcorp-hilton-abuja" should be 25%
    And a confirmation message "Discount updated successfully" should be displayed

  @Admin @Discounts @Future @Negative
  Scenario: Admin fails to set a discount percentage outside the valid range
    Given a logged-in admin is on the discount management page for "transcorp-hilton-abuja"
    When the admin attempts to set the discount percentage to "110"
    Then an error message "Discount must be between 0 and 100" should be displayed
    And the discount for "transcorp-hilton-abuja" should remain unchanged
