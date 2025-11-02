Feature: Food Ordering
  As a hungry customer
  I want to browse and order Nigerian cuisine
  So that I can enjoy authentic local dishes

  Background:
    Given I am on the HotelSaver homepage
    And I navigate to the "Food" section

  @food @menu @display
  Scenario: Browse Nigerian food menu
    Given I am on the food ordering page
    Then I should see featured Nigerian dishes:
      | Dish Name              | Description                    | Price Range |
      | Jollof Rice & Chicken  | National dish, party staple   | ₦3,000-5,000 |
      | Pounded Yam & Egusi    | Traditional swallow + soup    | ₦4,000-6,000 |
      | Efo Riro              | Spinach stew variant          | ₦3,500-5,500 |
      | Goat Meat Pepper Soup  | Spicy comfort food            | ₦4,500-7,000 |
      | Suya                   | Popular street food           | ₦2,000-4,000 |
      | Ofada Rice & Ayamase   | Local rice with green stew    | ₦3,800-5,800 |
      | Moi Moi               | Steamed bean cake             | ₦1,500-2,500 |
      | Akara                 | Bean fritters                 | ₦1,000-2,000 |
      | Puff-Puff             | Sweet snack                   | ₦800-1,500   |

  @food @ordering @single-item
  Scenario: Order single food item
    Given I am browsing the food menu
    When I select "Jollof Rice & Chicken" for "₦4,500"
    And I specify quantity as "2"
    And I click "Add to Cart"
    Then I should see the item in my cart
    And the cart total should be "₦9,000"
    When I proceed to checkout
    Then I should see order summary:
      | Item                  | Quantity | Unit Price | Total   |
      | Jollof Rice & Chicken | 2        | ₦4,500     | ₦9,000  |

  @food @ordering @multiple-items
  Scenario: Order multiple different food items
    Given I am creating a food order
    When I add the following items to cart:
      | Item                    | Quantity | Price    |
      | Jollof Rice & Chicken   | 1        | ₦4,500   |
      | Pounded Yam & Egusi     | 2        | ₦5,000   |
      | Suya                    | 1        | ₦3,000   |
      | Puff-Puff              | 3        | ₦1,200   |
    Then my cart total should be "₦21,100"
    And I should see all 4 different items in the cart

  @food @delivery @options
  Scenario: Food delivery options and pricing
    Given I have items worth "₦15,000" in my cart
    When I proceed to delivery options
    Then I should see delivery choices:
      | Delivery Type | Time        | Cost     | Area Coverage    |
      | Standard      | 45-60 mins  | ₦1,500   | Within 10km     |
      | Express       | 25-35 mins  | ₦2,500   | Within 5km      |
      | Premium       | 15-25 mins  | ₦4,000   | Within 3km      |
    When I select "Express delivery"
    Then my total should be "₦17,500" (₦15,000 + ₦2,500)

  @food @ordering @confirmation
  Scenario: Complete food order process
    Given I have selected food items totaling "₦12,000"
    And I have chosen "Standard delivery" for "₦1,500"
    When I provide delivery details:
      | Field            | Value                      |
      | Name             | David Johnson             |
      | Phone            | +234 802 345 6789        |
      | Delivery Address | 15 Admiralty Way, Lekki  |
      | Special Instructions | No pepper in the soup   |
    And I submit the order
    Then I should receive order confirmation
    And I should get an order number starting with "FD"
    And I should see estimated delivery time "45-60 minutes"
    And I should receive SMS confirmation

  @food @customization
  Scenario: Customize food orders with special requests
    Given I am ordering "Pounded Yam & Egusi"
    When I add special customizations:
      | Customization      | Additional Cost |
      | Extra meat         | ₦1,000         |
      | Less spicy         | Free           |
      | Extra portions     | ₦2,000         |
      | No vegetables      | Free           |
    Then the total should reflect customizations
    And the order should include all special requests

  @food @group-orders
  Scenario: Large group food order
    Given I am ordering for a group of "8 people"
    When I select "Party Pack - Jollof Rice & Chicken" for "₦25,000"
    And I add "Mixed Pepper Soup (Large)" for "₦15,000"
    And I add "Assorted Puff-Puff (20 pieces)" for "₦8,000"
    Then my total should be "₦48,000"
    And I should see "Serves 8-10 people" in the order notes
    When I proceed with group delivery
    Then I should see special group delivery options

  @food @payment @methods
  Scenario: Food payment options
    Given I have completed my food order for "₦18,500"
    When I proceed to payment
    Then I should see payment options:
      | Payment Method    | Processing Time | Additional Fee |
      | Cash on Delivery  | Immediate      | Free          |
      | Bank Transfer     | 1-2 hours      | Free          |
      | Online Payment    | Immediate      | ₦200          |
    When I select "Cash on Delivery"
    Then my total remains "₦18,500"

  @food @tracking
  Scenario: Track food order status
    Given I have placed order "FD123456789"
    Then I should be able to track the order status
    And I should see status updates:
      | Status           | Estimated Time | Description              |
      | Order Received   | 0 minutes     | Your order is confirmed  |
      | Preparing        | 15 minutes    | Kitchen is preparing     |
      | Ready for Pickup | 30 minutes    | Food ready, driver assigned |
      | Out for Delivery | 35 minutes    | Driver is on the way     |
      | Delivered        | 55 minutes    | Order completed          |

  @food @negative @out-of-stock
  Scenario: Handle out of stock items
    Given I try to order "Goat Meat Pepper Soup"
    When the item is out of stock
    Then I should see "Currently unavailable" message
    And I should see suggested alternatives:
      | Alternative Item       | Price    |
      | Beef Pepper Soup       | ₦5,500   |
      | Catfish Pepper Soup    | ₦6,000   |
      | Chicken Pepper Soup    | ₦4,500   |

  @food @delivery-area
  Scenario: Order outside delivery area
    Given I am ordering food
    When I enter delivery address "123 Remote Location, Outskirts"
    And the address is outside delivery zone
    Then I should see "Delivery not available in this area"
    And I should see pickup option:
      | Option        | Details                    |
      | Self Pickup   | Available at restaurant    |
      | Meet Point    | Nearest delivery boundary |