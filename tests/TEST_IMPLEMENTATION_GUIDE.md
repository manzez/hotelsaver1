# Test Data Attributes Guide

To make the test suite work effectively, add these `data-testid` attributes to your components:

## SearchBar Component (`components/SearchBar.tsx`)

```tsx
// City selector
<select data-testid="city-select">
  
// Date inputs
<input data-testid="check-in-date" />
<input data-testid="check-out-date" />
<div data-testid="date-picker" /> // Date picker container

// Guest controls  
<button data-testid="adults-plus">+</button>
<button data-testid="adults-minus">-</button>
<span data-testid="adults-count">{adults}</span>

<button data-testid="children-plus">+</button>
<button data-testid="children-minus">-</button>
<span data-testid="children-count">{children}</span>

<button data-testid="rooms-plus">+</button>
<button data-testid="rooms-minus">-</button>
<span data-testid="rooms-count">{rooms}</span>

<div data-testid="guest-selector" /> // Guest picker container

// Budget selector
<button data-testid="budget-u80">Under ₦80k</button>
<button data-testid="budget-80_130">₦80k–₦130k</button>
<button data-testid="budget-130_200">₦130k–₦200k</button>
<button data-testid="budget-200p">₦200k+</button>
<div data-testid="budget-selector" /> // Budget container

// Search button
<button data-testid="search-button">Search Hotels</button>
<form data-testid="search-form">
```

## Search Results (`app/search/page.tsx`)

```tsx
// Results container
<div data-testid="search-results">

// Hotel cards
<div data-testid="hotel-card">
  <h3 data-testid="hotel-name">{hotel.name}</h3>
  <span data-testid="hotel-city">{hotel.city}</span>
  <div data-testid="hotel-stars">{stars}</div>
  <span data-testid="hotel-price">₦{price.toLocaleString()}</span>
</div>

// Nights calculation
<span data-testid="nights-count">{nights} nights</span>

// Tax display
<span data-testid="tax-amount">₦{tax.toLocaleString()}</span>
```

## Hotel Details (`app/hotel/[id]/page.tsx`)

```tsx
<h1 data-testid="hotel-name">{hotel.name}</h1>
<button data-testid="negotiate-button">Get Our Best Price</button>
```

## Negotiation Page (`app/negotiate/page.tsx`)

```tsx
// Negotiation states
<div data-testid="negotiation-loading">Finding best price...</div>
<div data-testid="negotiation-result">

// Price display
<span data-testid="original-price">₦{originalPrice.toLocaleString()}</span>
<span data-testid="discounted-price">₦{discountedPrice.toLocaleString()}</span>
<span data-testid="savings-amount">₦{savings.toLocaleString()}</span>

// Timer
<div data-testid="countdown-timer">{formatTime(remaining)}</div>

// Status messages
<div data-testid="expired-message">This offer has expired</div>
<div data-testid="no-offer-message">No discount available</div>
<div data-testid="negotiation-error">Error occurred</div>

// Actions
<button data-testid="book-now-button">Book Now</button>
<button data-testid="retry-negotiation">Try Again</button>
```

## Booking Page (`app/book/page.tsx`)

```tsx
// Booking summary
<div data-testid="booking-summary">
  <h2 data-testid="property-name">{property.name}</h2>
  <span data-testid="check-in-display">{formatDate(checkIn)}</span>
  <span data-testid="check-out-display">{formatDate(checkOut)}</span>
  <span data-testid="booking-total">₦{total.toLocaleString()}</span>
  <span data-testid="guest-summary">{adults} adults, {children} children, {rooms} rooms</span>
</div>

// Contact form
<input data-testid="name-input" />
<div data-testid="name-error">Name is required</div>

<input data-testid="email-input" type="email" />
<div data-testid="email-error">Valid email required</div>

<input data-testid="phone-input" />
<div data-testid="phone-error">Phone number required</div>

<textarea data-testid="special-requests"></textarea>

<button data-testid="submit-booking">Complete Booking</button>

// Confirmation
<div data-testid="booking-success">Booking Confirmed!</div>
<span data-testid="booking-id">BK{timestamp}</span>
<div data-testid="confirmation-details">
  <span data-testid="confirm-guest-name">{guestName}</span>
  <span data-testid="confirm-email">{email}</span>
  <span data-testid="confirm-total">₦{total.toLocaleString()}</span>
</div>

// Error states
<div data-testid="expired-price-error">Price has expired</div>
<div data-testid="property-not-found">Property not found</div>
<div data-testid="price-missing-error">Price information missing</div>
<div data-testid="network-error">Network connection failed</div>
<button data-testid="retry-booking">Try Again</button>
```

## Navigation (`components/ClientLayout.tsx`)

```tsx
// Header navigation
<button data-testid="nav-hotels">Hotels</button>
<button data-testid="nav-services">Services</button>
<button data-testid="nav-food">Food</button>

// Mobile menu
<button data-testid="mobile-menu-button">☰</button>
<div data-testid="mobile-menu">
  <a data-testid="menu-hotels">Hotels</a>
  <a data-testid="menu-services">Services</a>
  <a data-testid="menu-food">Food</a>
</div>

// Contact links
<a data-testid="whatsapp-contact" href="https://wa.me/2347077775545">WhatsApp</a>
<a data-testid="footer-whatsapp" href="https://wa.me/2347077775545">Contact Us</a>
```

## Services Page (`app/services/page.tsx`)

```tsx
// Category navigation
<div data-testid="category-tabs">
  <button data-testid="category-hair">Hair</button>
  <button data-testid="category-nails">Nails</button>
  <button data-testid="category-massage">Massage</button>
  <button data-testid="category-cleaning">Cleaning</button>
  <button data-testid="category-security">Security</button>
</div>

// Search
<input data-testid="service-search" placeholder="Search services..." />
<button data-testid="search-services-button">Search</button>

// Service cards
<div data-testid="service-card">
  <h3 data-testid="service-title">{service.title}</h3>
  <span data-testid="service-category">{service.category}</span>
  <span data-testid="service-price">₦{service.amountNGN.toLocaleString()}</span>
</div>
```

## Service Details (`app/services/[id]/page.tsx`)

```tsx
<h1 data-testid="service-name">{service.provider}</h1>
<span data-testid="service-price">₦{service.amountNGN.toLocaleString()}</span>
<button data-testid="book-service-button">Book Service</button>

// Booking form
<input data-testid="service-name-input" />
<input data-testid="service-email-input" />
<input data-testid="service-phone-input" />
<input data-testid="service-date-input" type="date" />
<button data-testid="submit-service-booking">Book Now</button>

// Confirmation
<div data-testid="service-booking-confirmation">Service Booked!</div>
<span data-testid="service-reference-id">SV{timestamp}</span>
```

## Food Page (`app/food/page.tsx`)

```tsx
// Food cards
<div data-testid="dish-card">
  <h3 data-testid="dish-name">{dish.name}</h3>
  <span data-testid="dish-price">₦{dish.price.toLocaleString()}</span>
  <button data-testid="order-dish-button">Order Now</button>
</div>

// Categories
<button data-testid="food-category-rice">Rice Dishes</button>
<button data-testid="food-category-soup">Soups</button>
<button data-testid="food-category-swallow">Swallow</button>
<button data-testid="food-category-grilled">Grilled</button>
<button data-testid="food-category-snacks">Snacks</button>

// Order form
<input data-testid="customer-name" />
<input data-testid="customer-phone" />
<textarea data-testid="delivery-address"></textarea>
<input data-testid="order-quantity" type="number" />
<span data-testid="order-total">₦{total.toLocaleString()}</span>
<button data-testid="submit-food-order">Place Order</button>

// Confirmation
<div data-testid="food-order-confirmation">Order Confirmed!</div>
<span data-testid="food-order-id">FO{timestamp}</span>

// Location filters
<button data-testid="city-lagos">Lagos</button>
<div data-testid="lagos-restaurants">Lagos Restaurants</div>
```

## Running the Tests

```bash
# Install dependencies
cd tests
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test

# Run specific test suite
npm run test:search
npm run test:booking
npm run test:api

# Run tests in headed mode (see browser)
npm run test:headed

# Generate test report
npm run test:report

# Run mobile tests only
npm run test:mobile

# Debug mode
npm run test:debug
```

## Test Structure

- **01-search-flow.spec.ts**: Search functionality, date calculations, mobile compatibility
- **02-negotiation-flow.spec.ts**: Discount application, timer functionality, price preservation  
- **03-booking-flow.spec.ts**: Form validation, confirmation flow, price calculations
- **04-services-food.spec.ts**: Services marketplace, food ordering, navigation consistency
- **05-edge-cases.spec.ts**: Network failures, browser compatibility, security testing
- **api/api-endpoints.spec.ts**: Backend API testing, data validation, error handling

Each test file contains 15-20 test cases covering positive flows, negative scenarios, and edge cases.