Feature: Apartment Listings and Links
  As a user looking for longer-term accommodation
  I want to view apartment listings and access detailed information
  So that I can find suitable extended-stay options

  Background:
    Given I am on the HotelSaver homepage
    And apartment listings are available

  @apartments @display @positive
  Scenario: View apartment listings on homepage
    Given I am on the main page
    Then I should see an apartments section
    And I should see featured apartments with:
      | Information     | Display Format        |
      | Property Name   | Clear title           |
      | Location        | City and area         |
      | Price Range     | Per month in Naira    |
      | Property Type   | Apartment/Studio/etc  |
      | Key Features    | Bedrooms, bathrooms   |
      | Images          | Property photos       |

  @apartments @navigation @links
  Scenario: Navigate to apartment details
    Given I see apartment listings
    When I click on "Luxury 2BR Apartment - Victoria Island"
    Then I should be redirected to the apartment details page
    And the URL should contain the apartment identifier
    And I should see detailed apartment information

  @apartments @filtering
  Scenario: Filter apartments by criteria
    Given I am viewing apartment listings
    When I apply filters:
      | Filter Type    | Selection          |
      | Location       | Lagos             |
      | Price Range    | ₦200k - ₦500k     |
      | Bedrooms       | 2+                |
      | Amenities      | Swimming Pool     |
    Then I should see only apartments matching all criteria
    And the results should be updated dynamically

  @apartments @search
  Scenario: Search for specific apartment types
    Given I am on the apartments page
    When I search for "studio apartment Lekki"
    Then I should see studio apartments in Lekki area
    And each result should highlight "studio" and "Lekki" in the listing
    And I should see relevant price ranges for studio apartments

  @apartments @details @comprehensive
  Scenario: View comprehensive apartment details
    Given I click on "Modern 3BR Penthouse - Ikoyi"
    Then I should see complete apartment information:
      | Section          | Details                           |
      | Basic Info       | Price, size, bedrooms, bathrooms |
      | Description      | Full property description         |
      | Amenities        | Swimming pool, gym, parking, etc  |
      | Location         | Address, nearby landmarks         |
      | Availability     | Available dates                   |
      | Contact Info     | Property manager details          |
      | Virtual Tour     | 360° photos or video              |
      | Floor Plan       | Apartment layout                  |

  @apartments @contact @inquiry
  Scenario: Make apartment inquiry
    Given I am viewing apartment "Serviced 1BR - VI"
    When I click "Make Inquiry" or "Contact Owner"
    Then I should see an inquiry form with fields:
      | Field               | Type      | Required |
      | Full Name           | Text      | Yes      |
      | Email Address       | Email     | Yes      |
      | Phone Number        | Tel       | Yes      |
      | Preferred Move Date | Date      | No       |
      | Lease Duration      | Dropdown  | No       |
      | Message/Questions   | Textarea  | No       |

  @apartments @inquiry-submission
  Scenario: Submit apartment inquiry
    Given I have filled the apartment inquiry form
    When I submit the inquiry for "Executive 2BR - Banana Island"
    Then I should see confirmation message
    And I should receive inquiry reference number starting with "AP"
    And the property owner should be notified
    And I should receive a copy of my inquiry via email

  @apartments @external-links
  Scenario: External apartment platform integration
    Given some apartments link to external platforms
    When I click on an apartment with external listing
    Then I should see a clear indication it will redirect
    And I should see warning: "You're leaving HotelSaver"
    When I confirm to proceed
    Then I should be redirected to the external platform
    And the apartment details should be preserved in the URL

  @apartments @comparison
  Scenario: Compare multiple apartments
    Given I am browsing apartments
    When I select "Compare" on multiple apartments
    Then I should see a comparison view with:
      | Comparison Aspect | Details                    |
      | Side-by-side      | Up to 3 apartments         |
      | Price             | Monthly rates              |
      | Features          | Bedrooms, bathrooms, etc   |
      | Amenities         | Available facilities       |
      | Location          | Areas and proximity        |
      | Availability      | Move-in dates             |

  @apartments @mobile-responsive
  Scenario: Apartment browsing on mobile
    Given I am using a mobile device
    When I browse apartment listings
    Then the layout should be mobile-optimized
    And I should be able to:
      | Action               | Expected Result           |
      | Swipe through photos | Smooth image carousel     |
      | Tap to call owner    | Direct phone dialing      |
      | Share listing        | Native sharing options    |
      | Save favorites       | Quick bookmark feature    |

  @apartments @availability @calendar
  Scenario: Check apartment availability
    Given I am viewing "Luxury Studio - Lekki Phase 1"
    When I click "Check Availability"
    Then I should see an availability calendar
    And blocked dates should be clearly marked
    And available periods should be highlighted
    When I select my preferred dates
    Then I should see pricing for that specific period

  @apartments @negative @no-results
  Scenario: No apartments match search criteria
    Given I search for apartments with very specific criteria
    When no apartments match my filters:
      | Filter          | Value                 |
      | Location        | Remote area           |
      | Price Range     | Under ₦50,000        |
      | Bedrooms        | 5+                   |
      | Pet-friendly    | Yes                  |
    Then I should see "No apartments found" message
    And I should get suggestions to:
      | Suggestion              |
      | Broaden search criteria |
      | Try different locations |
      | Contact us for custom search |

  @apartments @integration @booking-flow
  Scenario: Apartment inquiry from hotel search
    Given I am searching for hotels for "long-term stay"
    When I set dates for "30+ days"
    Then I should see suggestion: "Consider apartments for extended stays"
    When I click "View Apartments"
    Then I should be redirected to apartments with my dates pre-filled