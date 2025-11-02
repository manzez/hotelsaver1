# HotelSaver Test Automation Guide

## Overview
Comprehensive test suite using Playwright + Cucumber for HotelSaver.ng application covering all booking flows, calculations, and services.

## Test Framework Architecture

### Technologies Used
- **Playwright**: Cross-browser automation (Chromium, Firefox, WebKit)
- **Cucumber**: BDD framework with Gherkin scenarios
- **TypeScript**: Type-safe step definitions and page objects
- **Node.js**: Runtime environment

### Project Structure
```
tests/
├── features/                     # Gherkin feature files
│   ├── hotel-search.feature      # Hotel search functionality
│   ├── negotiation-pricing.feature # Discount calculations
│   ├── booking-process.feature   # Reservation workflows
│   ├── services-booking.feature  # Service categories
│   ├── taxi-booking.feature      # Airport transfers
│   ├── food-ordering.feature     # Nigerian cuisine
│   ├── apartment-listings.feature # Rental properties
│   └── negative-scenarios.feature # Error handling
├── step-definitions/             # Test implementation
│   ├── search-steps.ts          # Hotel search logic
│   ├── pricing-steps.ts         # Calculation validation
│   ├── booking-steps.ts         # Booking workflows
│   └── services-steps.ts        # Services & taxi & food
├── page-objects/                # Page object models
│   ├── search.page.ts           # Search interface
│   ├── booking.page.ts          # Booking pages
│   ├── services.page.ts         # Services & food
│   └── navigation.page.ts       # Common navigation
├── support/                     # Test utilities
│   └── world.ts                 # Test context & helpers
├── playwright.config.ts         # Playwright configuration
└── cucumber.config.js          # Cucumber settings
```

## Key Features Tested

### 1. Hotel Search & Filtering
- **City Selection**: Lagos, Abuja, Port Harcourt, Owerri
- **Budget Ranges**: Under ₦80k, ₦80k-₦130k, ₦130k-₦200k, ₦200k+
- **Guest Configuration**: Adults, children, rooms with validation
- **Date Range Selection**: Check-in/check-out with night calculation
- **Mobile Responsiveness**: Adaptive UI for different screen sizes

### 2. Negotiation Pricing Calculations
- **Discount Application**: 15% default rate with per-property overrides
- **Room-based Pricing**: Base price × rooms × nights
- **VAT Calculation**: 7.5% on multi-night stays (nights > 1)
- **Timer Validation**: 5-minute offer expiry countdown
- **Price Preservation**: Negotiated rates maintained through booking

### 3. Booking Process Validation
- **Form Validation**: Required fields (name, email, phone)
- **Email Validation**: Format checking and browser validation
- **Reference Generation**: Unique booking IDs (BK + timestamp)
- **Contact Information**: Guest details capture and preservation
- **Special Requests**: Optional notes and requirements

### 4. Services Booking
- **Category Filtering**: Hair, Nails, Massage, Security, Catering, etc.
- **City-based Services**: Location-specific service providers
- **People-based Pricing**: Quantity adjustments for group services
- **Time Scheduling**: Date, time, and duration selection
- **Reference IDs**: Service bookings (SV + timestamp)

### 5. Taxi Booking
- **Route Planning**: Pickup and drop-off locations
- **Vehicle Types**: Different categories with pricing
- **Passenger Counts**: Group size accommodation
- **Pricing Estimation**: Distance and vehicle-based calculations
- **Reference IDs**: Taxi bookings (TX + timestamp)

### 6. Food Ordering
- **Nigerian Cuisine**: Traditional dishes (Jollof Rice, Egusi, Suya)
- **Cart Management**: Add, update, remove items with quantities
- **Delivery Calculations**: Subtotal + delivery fee = total
- **Address Collection**: Delivery location and contact details
- **Reference IDs**: Food orders (FD + timestamp)

### 7. Apartment Listings
- **Property Filtering**: City, price range, bedrooms, type
- **Property Details**: Bedrooms, bathrooms, size, amenities
- **Contact Forms**: Inquiry submission to property owners
- **WhatsApp Integration**: Direct owner communication

### 8. Error Handling & Edge Cases
- **Invalid Input Validation**: Malformed data handling
- **Server Error Responses**: API failure scenarios
- **Empty Result Sets**: No matches found messaging
- **Expired Negotiations**: Timer expiry handling
- **Network Failures**: Connectivity issue recovery

## Business Logic Validation

### Pricing Calculations
- **Room Count Logic**: (adults + children) ÷ 3 = minimum rooms needed
- **Multi-room Pricing**: Subtotal = base_price × rooms × nights
- **VAT Application**: Only on stays longer than 1 night
- **Discount Accuracy**: Mathematical verification of percentage calculations
- **Currency Formatting**: Nigerian Naira (₦) with comma separators

### Booking Reference Systems
- **Unique Generation**: Timestamp-based IDs prevent collisions
- **Format Validation**: Prefix + numeric sequence (BK123456789)
- **Trackability**: References can be used for future lookups
- **Service-specific**: Different prefixes for each booking type

### Nigerian Market Features
- **City Coverage**: Four major Nigerian cities supported
- **Service Categories**: Culturally relevant services (braiding, security)
- **Traditional Food**: Authentic Nigerian dishes featured
- **Currency Handling**: All prices in Nigerian Naira (NGN)
- **WhatsApp Support**: Primary customer communication channel

## Test Execution

### Prerequisites
1. **Development Server**: Application running on localhost:3001
2. **Node.js**: Version 18+ installed
3. **Test Dependencies**: Playwright and Cucumber packages installed

### Running Tests

#### Command Line Options
```bash
# All test scenarios
./run-tests.bat

# Specific feature sets
./run-tests.bat search      # Hotel search only
./run-tests.bat negotiation # Pricing calculations
./run-tests.bat booking     # Booking process
./run-tests.bat services    # Service bookings
./run-tests.bat taxi        # Taxi bookings
./run-tests.bat food        # Food ordering
./run-tests.bat apartments  # Property listings
./run-tests.bat negative    # Error scenarios

# Debug mode (visible browser)
./run-tests.bat debug
```

#### Cross-browser Testing
- **Chromium**: Primary browser for development
- **Firefox**: Cross-browser compatibility validation
- **WebKit**: Safari engine testing (macOS/iOS compatibility)

### Test Data Management
- **Static Test Data**: Predefined scenarios with known outcomes
- **Dynamic Generation**: Timestamp-based references and IDs
- **Calculation Helpers**: Built-in functions for price/VAT/room validation
- **State Management**: Test context preservation across steps

## Validation Areas

### Critical Business Calculations
1. **Room Requirements**: Validate minimum rooms for guest count
2. **Pricing Accuracy**: Verify base × rooms × nights calculations
3. **VAT Application**: Confirm 7.5% only on multi-night stays
4. **Discount Math**: Validate percentage-based price reductions
5. **Total Calculations**: Subtotal + VAT = final amount

### User Experience Flows
1. **Search → Results**: Parameter preservation and filtering
2. **Results → Negotiation**: Price context maintenance
3. **Negotiation → Booking**: Discount rate preservation
4. **Booking → Confirmation**: Reference generation and display
5. **Error Recovery**: Graceful handling of failures

### Data Integrity
1. **Form Validation**: Required field enforcement
2. **Input Sanitization**: Malformed data handling
3. **State Persistence**: URL parameter accuracy
4. **Reference Uniqueness**: No duplicate booking IDs
5. **Price Consistency**: Same calculations across pages

## Expected Outcomes

### Successful Test Run Indicators
- ✅ All scenarios pass without errors
- ✅ Calculations match expected mathematical results
- ✅ Form validations work as designed
- ✅ Booking references generate unique IDs
- ✅ Navigation preserves search parameters
- ✅ Error messages display appropriately

### Common Issues to Monitor
- ❌ Timer cleanup causing memory leaks
- ❌ Hydration mismatches between server/client
- ❌ Price calculation rounding errors
- ❌ Form validation bypassed by direct submission
- ❌ Reference ID collisions in rapid succession
- ❌ Mobile responsive layout breaking

## Continuous Integration

### Pre-deployment Validation
- All test scenarios must pass before production deployment
- Cross-browser compatibility confirmed across Chromium, Firefox, WebKit
- Performance validation under realistic user load scenarios
- Mobile responsive design verified on various screen sizes

### Regression Testing
- Run full test suite after any pricing logic changes
- Validate booking flow integrity after UI modifications
- Confirm calculation accuracy after discount system updates
- Test error handling after API endpoint modifications

This comprehensive test suite ensures the reliability, accuracy, and user experience quality of the HotelSaver.ng platform across all major booking workflows and business calculations.