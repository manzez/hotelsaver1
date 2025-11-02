Feature: Negative Scenarios and Edge Cases
  As a QA tester
  I want to test error handling and edge cases
  So that the application behaves gracefully under unexpected conditions

  @negative @search @validation
  Scenario: Search with invalid or malicious input
    Given I am on the search page
    When I enter malicious script in location field: "<script>alert('test')</script>"
    Then the input should be sanitized
    And I should not see any script execution
    When I enter extremely long text (1000+ characters) in location
    Then the input should be truncated or limited
    And I should see appropriate validation message

  @negative @dates @invalid
  Scenario: Invalid date selections
    Given I am using the date picker
    When I try to select a past date as check-in
    Then past dates should be disabled
    When I select check-out date before check-in date
    Then I should see error: "Check-out must be after check-in"
    When I select dates more than 1 year in advance
    Then I should see warning about advance booking limits

  @negative @guests @limits
  Scenario: Invalid guest counts
    Given I am setting guest numbers
    When I try to set "0 adults"
    Then the system should enforce minimum 1 adult
    When I try to set "50 adults"
    Then I should see maximum limit warning
    When I set "10 children" with "1 adult"
    Then I should see warning about adult-to-child ratio

  @negative @network @failures
  Scenario: Handle network connectivity issues
    Given I am using the application
    When the network connection is lost
    And I try to search for hotels
    Then I should see "Connection error" message
    And I should see "Retry" button
    When connection is restored
    And I click "Retry"
    Then the search should proceed normally

  @negative @api @errors
  Scenario: API endpoint failures
    Given the search API is temporarily unavailable
    When I perform a hotel search
    Then I should see "Service temporarily unavailable"
    And I should see estimated recovery time if available
    And I should see alternative actions:
      | Action                    | Description                |
      | Try again later          | Retry the same search      |
      | Browse popular locations | Pre-cached results         |
      | Contact support          | Get manual assistance      |

  @negative @booking @timeout
  Scenario: Booking session timeout
    Given I have items in my cart for booking
    When I leave the page idle for extended time
    And my session times out
    Then I should see session expiry warning before timeout
    When I return to complete booking
    Then I should be asked to re-authenticate
    And my cart contents should be preserved if possible

  @negative @payment @failures
  Scenario: Payment processing errors
    Given I am completing a booking payment
    When the payment gateway returns an error
    Then I should see clear error message
    And my booking should be held temporarily
    And I should see retry payment options
    When payment ultimately fails
    Then booking should be cancelled gracefully
    And I should receive appropriate notifications

  @negative @data @corruption
  Scenario: Handle corrupted or missing data
    Given hotel data is partially corrupted
    When I view a hotel with missing price information
    Then I should see "Price not available" instead of errors
    When hotel images fail to load
    Then I should see placeholder images
    And the page should remain functional

  @negative @browser @compatibility
  Scenario: Unsupported browser features
    Given I am using an older browser
    When modern features are not supported
    Then I should see graceful degradation
    And core functionality should remain available
    When JavaScript is disabled
    Then basic navigation should still work
    And I should see appropriate fallback content

  @negative @mobile @limitations
  Scenario: Mobile device limitations
    Given I am on a device with limited storage
    When the app tries to cache large amounts of data
    Then storage should be managed appropriately
    When device has slow connection
    Then images should load progressively
    And critical content should load first

  @edge-case @pricing @zero-amounts
  Scenario: Handle zero or negative pricing
    Given a hotel has pricing data issues
    When price calculation results in zero or negative amount
    Then I should see "Price unavailable - contact for rates"
    And booking should be disabled for that property
    And I should see alternative hotels

  @edge-case @dates @same-day
  Scenario: Same-day check-in and check-out
    Given I select the same date for check-in and check-out
    Then I should see "Same-day booking" notification
    And pricing should reflect hourly rates if available
    And I should see minimum booking duration requirements

  @edge-case @bulk @operations
  Scenario: Handle large-scale operations
    Given I am performing bulk operations
    When I try to book multiple services simultaneously
    Then the system should handle concurrent requests
    When I add 50+ items to cart
    Then performance should remain acceptable
    And I should see pagination or lazy loading

  @edge-case @special-characters
  Scenario: Handle international and special characters
    Given I enter names with special characters
    When I use "José García-Martínez" as guest name
    Then the name should be preserved correctly
    When I enter address with unicode characters
    Then address should be stored and displayed properly

  @edge-case @timezone @handling
  Scenario: Different timezone bookings
    Given users from different timezones are booking
    When I book from different timezone
    Then dates should be converted correctly to local time
    And booking confirmations should show appropriate timezone
    And cutoff times should respect local business hours

  @security @input-validation
  Scenario: Security input validation
    Given I am entering booking information
    When I try SQL injection in form fields
    Then input should be properly escaped
    When I try XSS attacks in text areas
    Then content should be sanitized
    When I upload files in unexpected fields
    Then file uploads should be rejected appropriately