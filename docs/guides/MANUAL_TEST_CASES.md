# HotelSaver.ng Manual Test Cases

## Test Case Structure for Excel Import

### Column Headers:
Test_ID | Test_Category | Test_Name | Test_Description | Preconditions | Test_Steps | Expected_Result | Actual_Result | Status | Priority | Notes

---

## SEARCH & NAVIGATION TEST CASES

### TC001 | Search | Basic City Search | Verify search functionality with city selection
**Preconditions:** User on homepage
**Test Steps:**
1. Navigate to homepage (/)
2. Type "Lagos" in destination searchbox
3. Select "Lagos (City)" from dropdown
4. Select check-in date (tomorrow)
5. Select check-out date (day after tomorrow)
6. Keep default guests (2 adults, 0 children, 1 room)
7. Keep default budget "Under ₦80k"
8. Click "Negotiate Hotels"
**Expected Result:** Redirected to /search?city=Lagos&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&adults=2&children=0&rooms=1&budget=u80&stayType=any
**Priority:** High

### TC002 | Search | Hotel Name Search | Verify search by hotel name functionality
**Preconditions:** User on homepage
**Test Steps:**
1. Navigate to homepage (/)
2. Type "Protea" in destination searchbox
3. Select "Protea Hotel by Marriott Owerri Select - Owerri" from dropdown
**Expected Result:** Redirected directly to hotel detail page /hotel/protea-hotel-by-marriott-owerri-select-owerri
**Priority:** High

### TC003 | Search | Hotel Name Search Results | Verify search results for hotel name queries
**Preconditions:** User on homepage
**Test Steps:**
1. Navigate to homepage (/)
2. Type "Golden" in destination searchbox
3. Press Enter or click search without selecting dropdown option
**Expected Result:** Redirected to search results showing hotels with "Golden" in name across all cities
**Priority:** High

### TC004 | Search | Budget Filter Test | Verify budget filtering works correctly
**Preconditions:** User on homepage
**Test Steps:**
1. Navigate to homepage (/)
2. Select "Lagos" as destination
3. Change budget to "₦200k+"
4. Click "Negotiate Hotels"
5. Verify search results only show hotels ≥ ₦200,000
**Expected Result:** Only luxury hotels (₦200,000+) displayed in results
**Priority:** High

### TC005 | Search | Guest Count Variation | Test different guest combinations
**Preconditions:** User on homepage
**Test Steps:**
1. Navigate to homepage (/)
2. Select "Owerri" as destination
3. Click guest picker dropdown
4. Set to 4 adults, 2 children, 2 rooms
5. Click "Done"
6. Click "Negotiate Hotels"
**Expected Result:** URL contains adults=4&children=2&rooms=2, guest summary shows "4 adults, 2 children, 2 rooms"
**Priority:** Medium

---

## CALCULATION TEST CASES

### TC101 | Calculation | Single Night Pricing | Verify base price calculation for 1 night
**Preconditions:** User on search results page
**Test Steps:**
1. Search for hotels in Lagos with same check-in and check-out dates
2. Find a hotel with base price ₦150,000
3. Verify display shows "₦150,000 per night"
4. Verify no tax calculation shown (0 nights)
**Expected Result:** Base price displayed correctly, no tax shown for 0 nights
**Priority:** High

### TC102 | Calculation | Multi-Night Tax Calculation | Verify tax calculation for multiple nights
**Preconditions:** User on search results page
**Test Steps:**
1. Search for hotels with 3-night stay
2. Find hotel with base price ₦100,000
3. Verify calculations:
   - Subtotal: ₦100,000 × 3 = ₦300,000
   - Tax (7.5%): ₦300,000 × 0.075 = ₦22,500
   - Total: ₦300,000 + ₦22,500 = ₦322,500
**Expected Result:** "3 nights: ₦322,500 incl. ₦22,500 tax"
**Priority:** High

### TC103 | Calculation | Discount Calculation | Verify negotiation discount calculations
**Preconditions:** User on negotiate page
**Test Steps:**
1. Navigate to negotiate page for a hotel with 15% discount
2. Verify base price ₦200,000
3. Click "Start Negotiation"
4. Verify calculations:
   - Original: ₦200,000
   - Discount (15%): ₦30,000
   - Final: ₦170,000
   - Savings: ₦30,000
**Expected Result:** All calculations display correctly with proper formatting
**Priority:** High

### TC104 | Calculation | Zero Tax for Same Day | Verify no tax for same-day bookings
**Preconditions:** User on search results
**Test Steps:**
1. Search with same check-in and check-out dates
2. Verify nights calculation shows 0
3. Verify no tax amount displayed
4. Verify only base price shown
**Expected Result:** No tax calculation, only base price per night shown
**Priority:** Medium

### TC105 | Calculation | Price Range Filtering | Verify budget filter calculations
**Preconditions:** User on search results
**Test Steps:**
1. Filter by "₦80k–₦130k" budget
2. Verify all displayed hotels have basePriceNGN between 80,000 and 130,000
3. Switch to "Under ₦80k"
4. Verify all hotels have basePriceNGN < 80,000
5. Switch to "₦200k+"
6. Verify all hotels have basePriceNGN ≥ 200,000
**Expected Result:** Filtering works correctly for all price ranges
**Priority:** High

### TC106 | Calculation | Discount Expiry Timer | Verify 5-minute countdown timer
**Preconditions:** User successfully negotiated a discount
**Test Steps:**
1. Note the exact time discount was received
2. Verify timer shows "4:59" initially
3. Wait 1 minute, verify timer shows "3:59"
4. Wait until timer reaches "0:00"
5. Verify offer shows as expired
**Expected Result:** Timer counts down accurately, offer expires at 0:00
**Priority:** High

### TC107 | Calculation | Price Formatting | Verify Nigerian Naira formatting
**Preconditions:** User viewing any page with prices
**Test Steps:**
1. Find price ₦1,234,567
2. Verify comma separation is correct
3. Find price ₦50,000
4. Verify formatting is ₦50,000 (not ₦50000)
5. Check prices in different contexts (cards, details, totals)
**Expected Result:** All prices formatted as ₦X,XXX with proper comma separation
**Priority:** Medium

---

## END-TO-END TEST CASES

### TC201 | E2E | Complete Booking Flow - City Search | Full booking process via city search
**Preconditions:** User on homepage, fresh session
**Test Steps:**
1. Navigate to homepage
2. Search for "Lagos" hotels
3. Select dates (tomorrow to day after)
4. Set guests to 2 adults, 1 room
5. Select "₦130k–₦200k" budget
6. Click "Negotiate Hotels"
7. From results, click "Negotiate Price" on a hotel
8. Complete negotiation process
9. Click "Book Now" before timer expires
10. Fill booking form with valid details
11. Submit booking
12. Verify confirmation page
**Expected Result:** Complete flow works, booking ID generated, confirmation displayed
**Priority:** Critical

### TC202 | E2E | Complete Booking Flow - Hotel Search | Full booking process via hotel name search
**Preconditions:** User on homepage, fresh session
**Test Steps:**
1. Navigate to homepage
2. Type "Golden Tulip" in search box
3. Select hotel from dropdown (direct navigation)
4. On hotel detail page, click "Negotiate Price"
5. Complete negotiation
6. Book the negotiated offer
7. Complete booking form
8. Verify confirmation
**Expected Result:** Hotel name search → detail → negotiate → book flow works completely
**Priority:** Critical

### TC203 | E2E | Search Results Persistence | Verify search parameters persist across navigation
**Preconditions:** User completed a search
**Test Steps:**
1. Search for Lagos hotels with specific criteria:
   - 3 nights stay
   - 4 adults, 1 child, 2 rooms
   - ₦200k+ budget
2. From results page, click hotel detail
3. Use browser back button to return to results
4. Verify search bar still shows original criteria
5. Modify search (change to Owerri)
6. Verify results update correctly
**Expected Result:** Search state preserved, modifications work correctly
**Priority:** High

### TC204 | E2E | Cross-Device Session | Test search across different viewports
**Preconditions:** Desktop browser available
**Test Steps:**
1. Start search on desktop (wide screen)
2. Verify guest picker dropdown works
3. Resize browser to mobile width
4. Verify mobile layout loads
5. Test date picker works on mobile
6. Complete search on mobile layout
7. Resize back to desktop
8. Verify results display correctly
**Expected Result:** Responsive design works, functionality maintained across viewports
**Priority:** Medium

### TC205 | E2E | Multiple Hotel Comparison | Compare multiple hotels end-to-end
**Preconditions:** User on search results with multiple hotels
**Test Steps:**
1. Search for Owerri hotels (should show 138+ results)
2. Open first hotel in new tab
3. Open second hotel in new tab
4. Compare prices, amenities, star ratings
5. Negotiate price on first hotel
6. Switch to second hotel tab
7. Negotiate price on second hotel
8. Compare final negotiated prices
9. Book the better deal
**Expected Result:** Multiple negotiations can run simultaneously, final booking works
**Priority:** Medium

---

## INTEGRATION TEST CASES

### TC301 | Integration | API Negotiation Flow | Test negotiate API integration
**Preconditions:** User on negotiate page
**Test Steps:**
1. Navigate to /negotiate?propertyId=valid-hotel-id
2. Click "Start Negotiation"
3. Monitor network calls to /api/negotiate
4. Verify request payload contains correct propertyId
5. Verify response contains discount calculation
6. Verify UI updates with discount details
7. Verify timer starts correctly
**Expected Result:** API call successful, response parsed correctly, UI updates appropriately
**Priority:** High

### TC302 | Integration | Booking API Flow | Test booking API integration
**Preconditions:** User with negotiated offer ready to book
**Test Steps:**
1. Fill out booking form with test data
2. Submit form
3. Monitor network call to /api/book
4. Verify payload includes all form data + negotiated price
5. Verify API returns booking ID
6. Verify redirect to confirmation page
7. Verify confirmation displays booking details
**Expected Result:** Booking API processes request, returns valid booking ID, confirmation works
**Priority:** High

### TC303 | Integration | Search Filter Integration | Test search filtering with multiple parameters
**Preconditions:** User on search results page
**Test Steps:**
1. Apply multiple filters simultaneously:
   - City: "Owerri"
   - Budget: "₦80k–₦130k"
   - Type: "Hotels"
   - Dates: 2-night stay
2. Verify URL parameters are correct
3. Verify backend filtering works (only matching hotels shown)
4. Change one filter (budget to "₦200k+")
5. Verify results update correctly
6. Verify URL updates correctly
**Expected Result:** Multiple filters work together, URL state managed correctly
**Priority:** High

### TC304 | Integration | Image Loading Integration | Test hotel image loading and fallbacks
**Preconditions:** User viewing hotel cards or details
**Test Steps:**
1. View search results with multiple hotels
2. Verify all hotel images load correctly
3. Open browser dev tools, simulate slow network
4. Refresh page
5. Verify images still load (may be slower)
6. Block one image URL in dev tools
7. Verify fallback image loads
**Expected Result:** Images load reliably, fallbacks work when needed
**Priority:** Medium

### TC305 | Integration | URL State Management | Test URL parameter handling
**Preconditions:** User can manipulate URL directly
**Test Steps:**
1. Navigate to search results via URL
2. Manually edit URL parameters in address bar:
   - Change city from Lagos to Owerri
   - Change budget from u80 to 200p
   - Change adults from 2 to 4
3. Press Enter to load modified URL
4. Verify page loads with new parameters
5. Verify search form reflects URL parameters
6. Verify results match URL parameters
**Expected Result:** URL parameters parsed correctly, page state matches URL
**Priority:** Medium

---

## ERROR HANDLING TEST CASES

### TC401 | Error | Invalid Hotel ID | Test handling of non-existent hotel
**Preconditions:** User can access URLs directly
**Test Steps:**
1. Navigate to /hotel/invalid-hotel-id
2. Verify appropriate error message
3. Navigate to /negotiate?propertyId=invalid-id
4. Verify negotiate API returns error
5. Verify error is handled gracefully in UI
**Expected Result:** 404 or appropriate error messages, no crashes
**Priority:** Medium

### TC402 | Error | Expired Negotiation | Test booking expired offers
**Preconditions:** User has expired negotiation offer
**Test Steps:**
1. Complete negotiation flow
2. Wait for timer to expire (>5 minutes)
3. Attempt to book expired offer
4. Verify booking is prevented
5. Verify appropriate error message shown
**Expected Result:** Expired offers cannot be booked, clear error messaging
**Priority:** High

### TC403 | Error | Form Validation | Test booking form validation
**Preconditions:** User on booking page
**Test Steps:**
1. Submit booking form with empty required fields
2. Verify validation errors appear
3. Fill invalid email format
4. Verify email validation error
5. Fill invalid phone number
6. Verify phone validation error
7. Fill all fields correctly
8. Verify form submits successfully
**Expected Result:** Form validation works, prevents invalid submissions
**Priority:** High

---

## PERFORMANCE TEST CASES

### TC501 | Performance | Search Results Loading | Test search performance with large dataset
**Preconditions:** Database has 258 hotels
**Test Steps:**
1. Search for "all hotels" (no city filter)
2. Measure page load time
3. Verify results load within 3 seconds
4. Search for specific city (Owerri - 138 hotels)
5. Verify results load within 2 seconds
6. Apply budget filter
7. Verify filtering happens instantly
**Expected Result:** Search results load quickly, filtering is responsive
**Priority:** Medium

### TC502 | Performance | Image Loading | Test hotel image loading performance
**Preconditions:** User viewing search results
**Test Steps:**
1. Load search results with 20+ hotels
2. Scroll through all results
3. Verify images load progressively
4. Check for broken image links
5. Verify lazy loading works (if implemented)
**Expected Result:** Images load efficiently, no broken links
**Priority:** Medium

---

## MOBILE-SPECIFIC TEST CASES

### TC601 | Mobile | Touch Interface | Test mobile touch interactions
**Preconditions:** Mobile device or mobile viewport
**Test Steps:**
1. Navigate to homepage on mobile
2. Test touch interactions:
   - Tap destination search box
   - Tap date picker
   - Tap guest picker dropdown
   - Swipe/scroll through results
3. Verify all touch targets are appropriately sized
4. Verify no hover-dependent functionality
**Expected Result:** All interactions work via touch, UI is mobile-friendly
**Priority:** High

### TC602 | Mobile | Date Picker | Test mobile date picker functionality
**Preconditions:** Mobile viewport active
**Test Steps:**
1. Open date picker on mobile
2. Verify native date picker appears (if implemented)
3. Test date selection
4. Verify date range selection works
5. Test fallback picker if native fails
**Expected Result:** Date selection works reliably on mobile
**Priority:** High

---

## Copy these test cases into Excel with the following column structure:

| Test_ID | Category | Test_Name | Description | Preconditions | Steps | Expected_Result | Actual_Result | Status | Priority | Notes | Date_Tested | Tester |

## Recommended Excel Setup:
1. Create separate sheets for each category (Search, Calculations, E2E, Integration, etc.)
2. Use data validation for Status column: Pass/Fail/Blocked/Not_Tested
3. Use conditional formatting: Green for Pass, Red for Fail, Yellow for Blocked
4. Add filters to all column headers
5. Create a summary dashboard sheet with pass/fail statistics

## Calculation Test Values for Reference:
- Base Price Examples: ₦50,000, ₦100,000, ₦150,000, ₦200,000
- Tax Rate: 7.5% (0.075)
- Default Discount: 15% (0.15)
- Timer Duration: 5 minutes (300 seconds)
- Price Ranges: Under ₦80k, ₦80k-₦130k, ₦130k-₦200k, ₦200k+