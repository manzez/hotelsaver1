# HotelSaver.ng - Test Strategy

## Document Information
- **Version**: 1.0
- **Last Updated**: November 7, 2025
- **Status**: Active
- **Owner**: Engineering Team

---

## 1. Executive Summary

This document outlines the comprehensive testing strategy for HotelSaver.ng, a Next.js 14 negotiation and online booking platform serving Nigerian markets. The strategy ensures quality delivery through automated and manual testing across all application layers.

### Strategic Goals
- Maintain 80%+ code coverage across critical paths
- Achieve <500ms response time for API endpoints
- Zero critical bugs in production
- 99.9% uptime for booking workflows
- Seamless UX across mobile and desktop platforms

---

## 2. Testing Scope

### 2.1 In-Scope Features

#### Core Booking Flow
- Hotel search and filtering (city, budget, dates, guest counts)
- Room selection and pricing calculations
- Real-time negotiation with 5-minute timer
- Booking confirmation and payment integration
- Email notifications (customer + admin)

#### Services Platform
- Service search and discovery
- Category filtering (Hair, Massage, Catering, etc.)
- Service booking workflow
- Provider management

#### Admin Portal
- Hotel management (CRUD operations)
- Room type configuration
- Discount management (default 15% + overrides)
- Booking analytics and reporting
- Availability management

#### Authentication & Authorization
- NextAuth.js integration
- Role-based access control (User, Admin, Super Admin)
- Session management
- Password reset flows

### 2.2 Out-of-Scope
- Third-party API integrations (Paystack, Neon DB internals)
- Browser compatibility testing for IE11 and below
- Load testing beyond 1000 concurrent users
- Penetration testing (separate security audit)

---

## 3. Test Levels

### 3.1 Unit Testing

**Framework**: Jest + React Testing Library  
**Target Coverage**: 80% for business logic, 60% for components  
**Responsibility**: Developers during feature development

#### Critical Units to Test

**Business Logic (`/lib`)**
```typescript
// lib/discounts.ts
- getDiscountFor(propertyId): Verify default 15% and overrides
- calculateNegotiatedPrice(): Edge cases (zero price, invalid IDs)

// lib/bookings.ts  
- calculateTotalPrice(): Tax calculation (7.5%), multi-night stays
- validateBookingDates(): Date range validation, past dates
- nightsBetween(): Date math edge cases

// lib/hotels.ts
- filterHotelsByBudget(): Budget range boundaries
- searchHotels(): Case-insensitive search, special characters
```

**Components**
```typescript
// components/SearchBar.tsx
- Date picker interactions
- Guest counter increments/decrements
- Budget selection logic
- Form validation

// components/NegotiationTimer.tsx
- Countdown timer accuracy
- Expiry state transitions
- Auto-refresh behavior

// components/RoomSelection.tsx
- Price calculations with multiple rooms
- Availability checks
- Add-on services selection
```

**Example Test Pattern**
```typescript
describe('getDiscountFor', () => {
  it('should return 15% default discount', () => {
    expect(getDiscountFor('unknown-hotel-id')).toBe(0.15);
  });

  it('should return property-specific override', () => {
    expect(getDiscountFor('eko-hotels-lagos')).toBe(0.20);
  });

  it('should handle invalid input gracefully', () => {
    expect(getDiscountFor(null)).toBe(0.15);
    expect(getDiscountFor('')).toBe(0.15);
  });
});
```

### 3.2 Integration Testing

**Framework**: Jest + Supertest for API routes  
**Target Coverage**: 100% of API endpoints  
**Responsibility**: QA Engineers + Developers

#### API Route Testing

**Critical Endpoints**
```typescript
// /api/negotiate
POST with valid propertyId → Returns discount offer + expiry
POST with invalid propertyId → Returns 404 with reason
POST without authentication → Returns 401 (if auth required)

// /api/book
POST with valid payload → Returns bookingId + confirmation
POST with expired negotiation → Returns 400 error
POST with missing required fields → Returns validation errors

// /api/services/search
GET with city filter → Returns filtered results
GET with query string → Returns matching services
GET without params → Returns all services (max 60)

// /api/admin/hotels
GET → Returns all hotels (admin only)
POST → Creates new hotel with validation
PUT → Updates hotel properties
DELETE → Soft deletes hotel
```

**Test Pattern**
```typescript
describe('POST /api/negotiate', () => {
  it('should return discount offer for valid property', async () => {
    const response = await request(app)
      .post('/api/negotiate')
      .send({ propertyId: 'eko-hotels-lagos' })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'discount',
      baseTotal: expect.any(Number),
      discountedTotal: expect.any(Number),
      savings: expect.any(Number),
      expiresAt: expect.any(Number),
    });
  });

  it('should reject invalid property ID', async () => {
    const response = await request(app)
      .post('/api/negotiate')
      .send({ propertyId: 'invalid-id' })
      .expect(404);

    expect(response.body.reason).toBe('not-found');
  });
});
```

#### Database Integration
- Prisma query validation
- Transaction rollback testing
- Connection pool management
- Data integrity constraints

### 3.3 End-to-End (E2E) Testing

**Framework**: Playwright  
**Existing Tests**: `/tests/e2e/` (8 spec files)  
**Target Coverage**: All critical user journeys  
**Responsibility**: QA Engineers

#### Critical User Journeys

**1. Complete Booking Flow (Happy Path)**
```gherkin
Given user is on homepage
When user searches for "Lagos" hotels
  And selects dates (check-in: today+7, check-out: today+10)
  And sets budget "₦80k–₦130k"
  And clicks "Search"
Then user sees filtered hotel results

When user clicks "Negotiate" on a hotel
Then discount offer is displayed
  And countdown timer starts at 5:00

When user clicks "Book Now"
  And fills contact form (name, email, phone)
  And clicks "Confirm Booking"
Then booking confirmation is displayed
  And user receives email confirmation
```

**2. Negotiation Timer Expiry**
```gherkin
Given user has received a discount offer
When timer reaches 0:00
Then offer expires
  And "Book Now" button is disabled
  And "Renegotiate" option is shown
```

**3. Admin Hotel Management**
```gherkin
Given admin is logged in
When admin navigates to "Hotels > Create"
  And fills hotel details form
  And adds room types with prices
  And uploads hotel images
  And clicks "Create Hotel"
Then hotel is saved to database
  And appears in hotel list
```

**4. Service Booking Flow**
```gherkin
Given user navigates to "Services" page
When user selects "Hair" category
  And filters by "Lagos" city
  And clicks "Book" on a service
  And fills booking details
Then service booking is confirmed
```

**5. Mobile Responsive Flows**
```gherkin
Given user is on mobile device (375px width)
When user performs search
Then mobile-optimized search bar is displayed
  And date picker is scaled correctly
  And results are in single-column grid
```

#### E2E Test Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

### 3.4 Visual Regression Testing

**Framework**: Percy or Chromatic  
**Frequency**: On every PR to main branch  
**Responsibility**: Automated in CI/CD

#### Components to Monitor
- SearchBar desktop vs mobile layouts
- Hotel cards with different content lengths
- Negotiation modal states (pending, offer, expired)
- Admin dashboard tables and forms
- Date picker calendar rendering
- Error states and loading spinners

### 3.5 Performance Testing

**Framework**: Lighthouse CI + K6  
**Target Metrics**:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1
- API Response Time: <500ms (p95)

#### Load Testing Scenarios
```javascript
// k6 script
export default function () {
  // Scenario 1: Search load
  http.get('http://hotelsaver1.vercel.app/search?city=Lagos');

  // Scenario 2: Negotiate endpoint
  http.post('http://hotelsaver1.vercel.app/api/negotiate', {
    propertyId: 'eko-hotels-lagos',
  });

  // Scenario 3: Booking submission
  http.post('http://hotelsaver1.vercel.app/api/book', payload);

  sleep(1);
}
```

**Thresholds**:
- 95th percentile response time < 500ms
- Error rate < 1%
- Concurrent users: 500 (peak load)

---

## 4. Test Data Management

### 4.1 Static Test Data

**Hotels Dataset** (`lib.hotels.json`)
- 50+ hotels across 4 cities
- Mixed property types (Hotel, Apartment)
- Budget ranges: <₦80k to ₦200k+
- Room types with varying pricing

**Services Dataset** (`lib.services.json`)
- 100+ services across 12 categories
- Geographic distribution matching cities
- Price ranges: ₦5k to ₦200k

**Discounts Configuration** (`lib/discounts.json`)
- Default 15% discount
- Property-specific overrides (5%-25%)

### 4.2 Dynamic Test Data

**User Accounts**
```typescript
const testUsers = {
  regularUser: {
    email: 'test.user@hotelsaver.ng',
    password: 'Test123!',
    role: 'user',
  },
  admin: {
    email: 'admin@hotelsaver.ng',
    password: 'Admin123!',
    role: 'admin',
  },
  superAdmin: {
    email: 'superadmin@hotelsaver.ng',
    password: 'SuperAdmin123!',
    role: 'superAdmin',
  },
};
```

**Booking Data Generator**
```typescript
function generateTestBooking() {
  return {
    propertyId: faker.helpers.arrayElement(hotelIds),
    checkIn: faker.date.future(),
    checkOut: faker.date.future(),
    adults: faker.number.int({ min: 1, max: 4 }),
    children: faker.number.int({ min: 0, max: 3 }),
    rooms: faker.number.int({ min: 1, max: 3 }),
    contact: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '+234' + faker.string.numeric(10),
    },
  };
}
```

### 4.3 Test Database Strategy

**Approach**: Seeded test database per environment
- **Local**: SQLite in-memory for unit tests
- **CI**: Neon PostgreSQL branch database
- **Staging**: Persistent Neon database with reset script
- **Production**: Never use for testing

**Seed Script**
```bash
# npm run test:db:seed
npx prisma migrate reset --skip-seed
npx prisma db push
node scripts/seed-test-data.js
```

---

## 5. Test Environments

### 5.1 Environment Matrix

| Environment | Purpose | Data | Access | Deployment |
|-------------|---------|------|--------|------------|
| **Local** | Development testing | Seeded static data | Developers | Manual |
| **Development** | Feature integration | Dynamic test data | Dev team | Auto on commit |
| **Preview** | PR validation | Production-like | Stakeholders | Auto on PR |
| **Staging** | Pre-production UAT | Production clone | QA + PO | Manual trigger |
| **Production** | Live application | Real customer data | Public | Approved release |

### 5.2 Environment Configuration

**Environment Variables Per Environment**
```bash
# Local (.env.local)
DATABASE_URL="postgresql://localhost:5432/hotelsaver_test"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_URL="http://localhost:3001"

# Development (Vercel)
DATABASE_URL="postgres://neon-dev-branch..."
NEXTAUTH_URL="https://hotelsaver1-dev.vercel.app"
NEXT_PUBLIC_BASE_URL="https://hotelsaver1-dev.vercel.app"

# Production (Vercel)
DATABASE_URL="postgres://neon-prod..."
NEXTAUTH_URL="https://hotelsaver1.vercel.app"
NEXT_PUBLIC_BASE_URL="https://hotelsaver1.vercel.app"
```

---

## 6. Nigerian Market-Specific Testing

### 6.1 Localization Testing

**Currency Formatting**
- Verify Nigerian Naira (₦) symbol displays correctly
- Test `toLocaleString()` formatting: ₦150,000
- Validate price calculations in Naira (no decimal places)

**Geographic Coverage**
- Test all 4 cities: Lagos, Abuja, Port Harcourt, Owerri
- Verify city-specific hotels and services
- Test location-based filtering

**Cultural Considerations**
- Nigerian dish names display correctly (Jollof Rice, Egusi, etc.)
- Service categories match local demand (Braiding, Livestock)
- Customer support contact methods (phone, email)

### 6.2 Payment Integration Testing

**Paystack Integration** (if implemented)
- Test card payment flow
- Verify NGN currency transactions
- Test bank transfer options
- Validate USSD payment methods
- Test payment webhooks

### 6.3 Communication Testing

**Email Templates**
- Test with Nigerian phone numbers (+234)
- Verify Nigerian English phrasing
- Test contact form functionality
- Validate SMS delivery (if enabled)

---

## 7. Test Automation Strategy

### 7.1 CI/CD Pipeline Integration

**GitHub Actions Workflow**
```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://hotelsaver1.vercel.app
            https://hotelsaver1.vercel.app/search?city=Lagos
```

### 7.2 Test Execution Schedule

| Test Type | Trigger | Frequency | Duration | Owner |
|-----------|---------|-----------|----------|-------|
| Unit | On commit | Every commit | 2-5 min | Developer |
| Integration | On PR | Per PR | 5-10 min | CI/CD |
| E2E (Smoke) | On PR | Per PR | 10-15 min | CI/CD |
| E2E (Full) | Pre-release | Daily 2 AM WAT | 30-45 min | Scheduled |
| Performance | On merge to main | Per deploy | 15-20 min | CI/CD |
| Visual Regression | On PR | Per PR | 10 min | CI/CD |
| Load Testing | Manual | Weekly | 1 hour | QA Lead |

### 7.3 Test Reporting

**Coverage Reports**
- Generated by Jest with Istanbul
- Published to Codecov.io
- Minimum threshold: 80% for new code

**E2E Test Reports**
- Playwright HTML reports
- Screenshot/video artifacts on failure
- Uploaded to GitHub Actions artifacts

**Performance Reports**
- Lighthouse CI reports in PR comments
- Trend analysis dashboard (SpeedCurve or similar)
- Alert on regression >10%

---

## 8. Defect Management

### 8.1 Bug Classification

**Severity Levels**

| Level | Definition | Example | SLA |
|-------|------------|---------|-----|
| **Critical** | Complete feature failure | Payment not processing | 4 hours |
| **High** | Major functionality impaired | Search returns no results | 24 hours |
| **Medium** | Feature works with workaround | Timer display incorrect | 3 days |
| **Low** | Cosmetic or minor issue | Button alignment off | 1 week |

**Priority Levels**
- P0: Blocks release
- P1: Must fix before release
- P2: Should fix if time permits
- P3: Nice to have

### 8.2 Bug Lifecycle

```
[New] → [Triaged] → [In Progress] → [Fixed] → [Ready for Test] → [Closed]
                  ↓
              [Won't Fix / Duplicate / Cannot Reproduce]
```

### 8.3 Bug Report Template

```markdown
## Bug Title
[Brief description]

## Environment
- **URL**: https://hotelsaver1.vercel.app/search
- **Browser**: Chrome 118
- **Device**: Desktop / Mobile (iPhone 12)
- **User Role**: Guest / Logged-in User / Admin

## Steps to Reproduce
1. Navigate to search page
2. Select "Lagos" city
3. Click "Search"
4. Observe error

## Expected Result
Search results should display hotels in Lagos

## Actual Result
"No hotels found" message appears despite 20+ Lagos hotels in database

## Screenshots/Videos
[Attach evidence]

## Additional Context
- Console errors: [paste logs]
- Network requests: [paste failed API calls]

## Severity: High
## Priority: P1
```

---

## 9. Special Testing Considerations

### 9.1 Negotiation Timer Testing

**Critical Scenarios**
- Timer starts at exactly 5:00 minutes
- Countdown updates every second
- Expiry triggers at 0:00, not 0:01
- Timer persists across page refreshes (if sessionStorage used)
- Multiple timers don't interfere (if multiple tabs open)
- Server-side expiry validation (can't book expired offer)

**Test Cases**
```typescript
describe('Negotiation Timer', () => {
  it('should expire offer after 5 minutes', async () => {
    const { expiresAt } = await negotiate('eko-hotels-lagos');
    await page.clock.fastForward('05:00');
    await expect(page.locator('.offer-expired')).toBeVisible();
  });

  it('should prevent booking after expiry', async () => {
    // Get offer
    await negotiate('eko-hotels-lagos');
    // Fast-forward time
    await page.clock.fastForward('05:01');
    // Attempt booking
    await page.click('.book-button');
    // Verify rejection
    await expect(page.locator('.error-expired')).toBeVisible();
  });
});
```

### 9.2 Datepicker Testing

**Critical Scenarios**
- Cannot select past dates
- Check-out must be after check-in
- Date format displays correctly (DD/MM/YYYY for Nigerian users)
- Mobile datepicker is touch-friendly
- Disabled dates are clearly indicated
- Month navigation works correctly

**Known Issue (Fixed in commit a647186)**
- Issue: Calendar auto-jumps to next month on date selection
- Fix: Removed auto-navigation useEffect, manual control only
- Test: Verify calendar stays on current month after selection

### 9.3 Discount Calculation Testing

**Edge Cases**
```typescript
describe('Discount Calculations', () => {
  it('should apply 15% default discount', () => {
    const base = 100000;
    const discounted = calculateDiscount(base, 0.15);
    expect(discounted).toBe(85000);
  });

  it('should handle zero prices', () => {
    const discounted = calculateDiscount(0, 0.15);
    expect(discounted).toBe(0);
  });

  it('should round to nearest Naira', () => {
    const base = 100333; // Would give 85282.55
    const discounted = calculateDiscount(base, 0.15);
    expect(discounted).toBe(85283); // Rounded
  });

  it('should handle 100% discount', () => {
    const discounted = calculateDiscount(100000, 1.0);
    expect(discounted).toBe(0);
  });
});
```

### 9.4 Multi-Night Stay Calculations

**Tax Application**
- 7.5% VAT applies to multi-night stays
- Single-night stays may be exempt (verify business rule)
- Tax calculated on subtotal, not per-night rate
- Rounding applied after tax calculation

**Test Cases**
```typescript
describe('Multi-Night Pricing', () => {
  it('should calculate 3-night stay with tax', () => {
    const nightlyRate = 50000;
    const nights = 3;
    const subtotal = nightlyRate * nights; // 150000
    const tax = Math.round(subtotal * 0.075); // 11250
    const total = subtotal + tax; // 161250
    
    expect(calculateTotal(nightlyRate, nights)).toBe(161250);
  });
});
```

---

## 10. Test Metrics & KPIs

### 10.1 Coverage Metrics

**Target Coverage by Layer**
- **Business Logic**: 80%+ statement coverage
- **API Routes**: 100% endpoint coverage
- **Components**: 60%+ render coverage
- **E2E**: 100% critical path coverage

**Tracking**
- Codecov.io integration
- PR comments with coverage diff
- Block merge if coverage drops >5%

### 10.2 Quality Metrics

**Defect Density**
- Target: <0.5 bugs per 1000 lines of code
- Measured: Monthly
- Source: Jira/GitHub Issues

**Test Execution Metrics**
- Pass Rate: >95% on main branch
- Flakiness Rate: <5% (tests passing on retry)
- Execution Time: <45 minutes for full suite

**Regression Metrics**
- New bugs in unchanged code: <2 per release
- Reopened bugs: <10% of fixed bugs

### 10.3 Performance Benchmarks

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Homepage Load | <2.5s | TBD | - |
| Search Results | <1.5s | TBD | - |
| API Response (p95) | <500ms | TBD | - |
| Lighthouse Score | >90 | TBD | - |
| Error Rate | <0.5% | TBD | - |

---

## 11. Risk Assessment & Mitigation

### 11.1 High-Risk Areas

| Risk Area | Impact | Likelihood | Mitigation |
|-----------|--------|------------|------------|
| Payment processing failures | High | Medium | Extensive Paystack integration testing, fallback UI |
| Negotiation timer desync | High | Low | Server-side validation, NTP time sync |
| Data corruption in bookings | High | Low | Database constraints, transaction rollbacks |
| Performance degradation | Medium | Medium | Load testing, CDN caching, database indexing |
| Security vulnerabilities | High | Low | OWASP Top 10 testing, dependency scanning |

### 11.2 Mitigation Strategies

**Payment Failures**
- Test all payment methods (card, bank, USSD)
- Implement idempotency keys
- Test webhook retry logic
- Graceful error handling with user-friendly messages

**Timer Synchronization**
- Use server timestamps for expiry validation
- Client timer is UI-only, not authoritative
- Backend validates expiry on booking submission
- Log time differences for monitoring

**Database Integrity**
- Foreign key constraints on all relationships
- Unique constraints on booking references
- Soft deletes to preserve history
- Regular backup testing

---

## 12. Test Maintenance

### 12.1 Test Code Quality

**Standards**
- Follow same linting rules as application code
- Use descriptive test names: `should [expected behavior] when [condition]`
- Keep tests focused: one assertion per test when possible
- Use Page Object Model for E2E tests

**Code Review**
- All test code requires PR review
- Tests must pass before merge
- Coverage must not decrease

### 12.2 Test Flakiness Management

**Detection**
- Track test retries in CI
- Flag tests that fail >10% of runs
- Quarantine flaky tests

**Resolution**
- Add explicit waits instead of fixed sleeps
- Use test IDs for reliable selectors
- Mock time-dependent logic
- Isolate tests (no shared state)

### 12.3 Test Suite Optimization

**Performance**
- Parallelize test execution (4-8 workers)
- Use test.skip for WIP tests
- Archive obsolete tests monthly
- Profile slow tests, optimize or split

**Maintenance Schedule**
- Weekly: Review flaky tests
- Monthly: Clean up unused fixtures
- Quarterly: Audit test coverage gaps
- Annually: Update testing framework versions

---

## 13. Training & Knowledge Transfer

### 13.1 Onboarding Materials

**For Developers**
- Testing quick-start guide
- Video tutorials on writing unit tests
- Sample test patterns repository
- Pair programming sessions for E2E tests

**For QA Engineers**
- Application domain knowledge training
- Nigerian market context overview
- Test environment access setup
- Bug reporting workshop

### 13.2 Documentation

**Maintained Docs**
- This test strategy (quarterly review)
- Test data catalog
- Known issues and workarounds
- Test environment setup guide

---

## 14. Tools & Technologies

### 14.1 Testing Stack

| Layer | Tool | Version | Purpose |
|-------|------|---------|---------|
| Unit | Jest | 29.x | JavaScript testing framework |
| Unit | React Testing Library | 14.x | Component testing |
| Integration | Supertest | 6.x | API endpoint testing |
| E2E | Playwright | 1.40.x | Browser automation |
| Performance | Lighthouse CI | Latest | Performance auditing |
| Load | K6 | Latest | Load and stress testing |
| Visual | Percy/Chromatic | Latest | Visual regression |
| Coverage | Istanbul | via Jest | Code coverage |
| Mocking | MSW | 2.x | API mocking |

### 14.2 Supporting Tools

- **CI/CD**: GitHub Actions
- **Reporting**: Codecov, Playwright HTML Reporter
- **Bug Tracking**: GitHub Issues
- **Test Management**: GitHub Projects
- **Monitoring**: Vercel Analytics, Sentry (if integrated)

---

## 15. Continuous Improvement

### 15.1 Review Cadence

**Monthly Test Strategy Review**
- Analyze test metrics and trends
- Identify coverage gaps
- Update risk assessment
- Optimize slow tests

**Quarterly Deep Dive**
- Full test suite audit
- Tool evaluation (new frameworks, deprecations)
- Team retrospective on testing practices
- Update this document

### 15.2 Feedback Loops

**Sources of Feedback**
- Production incidents (RCA includes test gap analysis)
- Customer support tickets (pattern analysis)
- Developer pain points (slow tests, flaky tests)
- QA team suggestions

**Action Items**
- Add regression tests for production bugs
- Improve test data for edge cases discovered
- Enhance E2E coverage for support ticket patterns

---

## 16. Sign-off & Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Test Lead | TBD | | |
| Engineering Manager | TBD | | |
| Product Owner | TBD | | |

---

## Appendix A: Test Execution Checklist

**Pre-Release Testing Checklist**

- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] E2E smoke tests passing on staging
- [ ] Performance tests meet SLA (<500ms API, <2.5s page load)
- [ ] Visual regression tests reviewed
- [ ] Security scan completed (no high/critical vulnerabilities)
- [ ] UAT sign-off from Product Owner
- [ ] Database migration tested on staging
- [ ] Rollback plan documented and tested
- [ ] Monitoring alerts configured

---

## Appendix B: Sample Test Scripts

### Unit Test Example
```typescript
// lib/__tests__/discounts.test.ts
import { getDiscountFor, calculateNegotiatedPrice } from '../discounts';

describe('Discount System', () => {
  describe('getDiscountFor', () => {
    it('should return default 15% discount for unknown property', () => {
      expect(getDiscountFor('unknown-id')).toBe(0.15);
    });

    it('should return property-specific discount', () => {
      expect(getDiscountFor('eko-hotels-lagos')).toBe(0.20);
    });
  });

  describe('calculateNegotiatedPrice', () => {
    it('should calculate discounted price correctly', () => {
      const result = calculateNegotiatedPrice('test-hotel', 100000);
      expect(result.discounted).toBe(85000);
      expect(result.savings).toBe(15000);
    });

    it('should handle zero base price', () => {
      const result = calculateNegotiatedPrice('test-hotel', 0);
      expect(result.discounted).toBe(0);
      expect(result.savings).toBe(0);
    });
  });
});
```

### E2E Test Example
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Hotel Booking Flow', () => {
  test('should complete booking with negotiated price', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Search for hotels
    await page.fill('#city-input', 'Lagos');
    await page.click('#search-button');
    await expect(page).toHaveURL(/\/search\?city=Lagos/);
    
    // Negotiate price
    await page.click('[data-testid="negotiate-button"]:first-child');
    await expect(page.locator('.discount-offer')).toBeVisible();
    
    // Verify timer is running
    await expect(page.locator('.timer')).toContainText(/[0-4]:[0-5][0-9]/);
    
    // Book hotel
    await page.click('#book-now-button');
    await page.fill('#contact-name', 'Test User');
    await page.fill('#contact-email', 'test@example.com');
    await page.fill('#contact-phone', '+2348012345678');
    await page.click('#confirm-booking');
    
    // Verify confirmation
    await expect(page.locator('.booking-confirmation')).toBeVisible();
    await expect(page.locator('.booking-id')).toContainText(/BK\d+/);
  });
});
```

---

## Document Control

**Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 7, 2025 | AI Agent | Initial creation |

**Review Schedule**: Quarterly (Next review: February 2026)

**Document Owner**: Engineering Team

**Distribution**: All developers, QA engineers, product team

---

*This test strategy is a living document and should be updated as the application evolves.*
