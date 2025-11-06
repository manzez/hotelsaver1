# Test Data Reference Sheet

## Calculation Test Data Values

### Hotel Price Examples for Testing:
```
Hotel Name                           | Base Price NGN | Expected Tax (3 nights) | Expected Total (3 nights)
Protea Hotel by Marriott            | 147,000        | 33,075                  | 474,075
Golden Tulip Essential Owerri       | 122,000        | 27,450                  | 393,450
Grand Diamond Hotels Owerri         | 133,000        | 29,925                  | 428,925
Swiss International Beland          | 131,000        | 29,475                  | 422,475
Plot35 Luxury                       | 149,000        | 33,525                  | 480,525
Amber City                          | 83,000         | 18,675                  | 267,675
Mavis Hotel                         | 70,000         | 15,750                  | 225,750
Newton Hotel                        | 73,000         | 16,425                  | 235,425
```

### Tax Calculation Formula:
```
Tax = (Base Price × Number of Nights × 0.075)
Total = (Base Price × Number of Nights) + Tax

For 0 nights (same day): Tax = 0
```

### Discount Calculation Examples:
```
Hotel                    | Base Price | Discount % | Discount Amount | Final Price | Savings
Protea Marriott         | 147,000    | 15%        | 22,050         | 124,950     | 22,050
Golden Tulip            | 122,000    | 15%        | 18,300         | 103,700     | 18,300
Grand Diamond           | 133,000    | 15%        | 19,950         | 113,050     | 19,950
Swiss International     | 131,000    | 15%        | 19,650         | 111,350     | 19,650
Budget Hotel (₦50,000)  | 50,000     | 15%        | 7,500          | 42,500      | 7,500
```

### Price Range Filter Test Data:
```
Budget Range    | Min Price | Max Price | Test Hotels to Verify
Under ₦80k     | 0         | 79,999    | Mavis (70k), Newton (73k), Vanessa Paris (70k)
₦80k–₦130k     | 80,000    | 130,000   | Amber City (83k), De Morganite (82k), Crisp Royal (130k)
₦130k–₦200k    | 130,000   | 200,000   | Grand Diamond (133k), Swiss International (131k)
₦200k+         | 200,000   | 999,999   | Any hotels over 200k (if available)
```

### Timer Test Values:
```
Initial Timer Display: 4:59 (299 seconds)
After 1 minute: 3:59 (239 seconds)
After 2 minutes: 2:59 (179 seconds)
After 4 minutes: 0:59 (59 seconds)
After 5 minutes: 0:00 (0 seconds) - EXPIRED
```

### Guest Count Test Combinations:
```
Test Case                | Adults | Children | Rooms | Expected Display
Default                  | 2      | 0        | 1     | "2 adults, 1 room"
Family                   | 2      | 2        | 1     | "2 adults, 2 children, 1 room"
Large Group             | 4      | 1        | 2     | "4 adults, 1 child, 2 rooms"
Business Group          | 6      | 0        | 3     | "6 adults, 3 rooms"
Single Traveler         | 1      | 0        | 1     | "1 adult, 1 room"
Large Family            | 2      | 4        | 2     | "2 adults, 4 children, 2 rooms"
```

### Date Calculation Test Cases:
```
Check-in        | Check-out      | Expected Nights | Expected Behavior
2024-10-21     | 2024-10-21     | 0               | No tax calculation
2024-10-21     | 2024-10-22     | 1               | 1 night, calculate tax
2024-10-21     | 2024-10-24     | 3               | 3 nights, calculate tax
2024-10-21     | 2024-10-28     | 7               | 7 nights, calculate tax
```

### URL Parameter Test Cases:
```
Parameter       | Valid Values                    | Invalid Values           | Expected Behavior
city           | Lagos, Abuja, Port Harcourt    | InvalidCity             | Filter by city / Show all
budget         | u80, 80_130, 130_200, 200p    | invalid_budget          | Default to u80
adults         | 1, 2, 3, 4, 5, 6              | 0, -1, abc             | Default to 2
children       | 0, 1, 2, 3, 4                 | -1, abc                | Default to 0
rooms          | 1, 2, 3, 4, 5                 | 0, -1, abc             | Default to 1
stayType       | any, hotel, apartment          | invalid                | Default to any
```

### API Response Test Data:
```
Negotiate API Success Response:
{
  "status": "discount",
  "baseTotal": 147000,
  "discountedTotal": 124950,
  "savings": 22050,
  "expiresAt": 1698123456789
}

Negotiate API No Discount Response:
{
  "status": "no-offer",
  "reason": "no-discount"
}

Book API Success Response:
{
  "bookingId": "BK1698123456789",
  "status": "confirmed"
}
```

### Performance Benchmarks:
```
Operation                    | Target Time | Acceptable Time | Unacceptable Time
Homepage Load               | < 2 seconds | < 3 seconds     | > 3 seconds
Search Results (City)       | < 1 second  | < 2 seconds     | > 2 seconds
Search Results (All Hotels) | < 2 seconds | < 3 seconds     | > 3 seconds
Hotel Detail Page          | < 1 second  | < 2 seconds     | > 2 seconds
Negotiate API Call         | < 500ms     | < 1 second      | > 1 second
Book API Call              | < 1 second  | < 2 seconds     | > 2 seconds
```

### Error Message Test Cases:
```
Scenario                           | Expected Error Message
Empty destination search           | "Please enter a destination or hotel name"
Invalid hotel ID in URL          | "Hotel not found" or 404 page
Expired negotiation booking       | "This offer has expired. Please start a new negotiation."
Invalid form data                 | Specific field validation messages
Network error during API call    | "Unable to connect. Please try again."
```

### Mobile-Specific Test Data:
```
Device/Viewport     | Width   | Expected Layout Changes
iPhone SE           | 375px   | Single column, stacked form elements
iPhone 12           | 390px   | Single column, mobile navigation
iPad                | 768px   | Two column layout in some areas
Desktop             | 1200px+ | Full multi-column layout
```

### Browser Compatibility Test Matrix:
```
Browser          | Version  | Expected Support | Critical Features to Test
Chrome           | Latest   | Full             | All functionality
Safari           | Latest   | Full             | Date picker, form validation
Firefox          | Latest   | Full             | All functionality
Edge             | Latest   | Full             | All functionality
Mobile Chrome    | Latest   | Full             | Touch interactions
Mobile Safari    | Latest   | Full             | Date picker, forms
```