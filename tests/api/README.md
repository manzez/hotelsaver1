# 🧪 Mocha API Testing Suite for HotelSaver.ng

## 📊 Overview

This dedicated Mocha testing suite focuses exclusively on API endpoint testing, separated from the UI testing for better organization and specialized testing capabilities.

### 🎯 Test Structure

```
tests/api/
├── package.json              # Mocha-specific dependencies
├── tsconfig.json             # TypeScript configuration  
├── .mocharc.json            # Mocha test configuration
├── api-endpoints.test.ts     # Core API functionality (40 tests)
├── data-validation.test.ts   # Data integrity & security (25 tests)
└── performance.test.ts       # Load & performance testing (30 tests)
```

**Total: 95 API-focused test cases**

## 🚀 Quick Start

### Installation & Setup

```bash
cd /Users/mac/Downloads/hotelsaver-ng-v9/tests/api

# Install dependencies (if not using global install)
npm install

# Run all API tests
npm test

# Run specific test files
npm run test:api
npx mocha api-endpoints.test.ts

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### 📋 Test Categories

#### 1. **Core API Endpoints** (`api-endpoints.test.ts`)
- ✅ **Negotiate API**: Discount calculations, expiry timestamps, error handling
- ✅ **Booking API**: Form data validation, booking ID generation, JSON/FormData support
- ✅ **Services Search**: City filtering, text queries, result limiting (max 60)
- ✅ **Services Booking**: Service reservations, reference ID generation  
- ✅ **Partnership API**: Business applications, minimal validation
- ✅ **Performance Benchmarks**: Response times, concurrent request handling

#### 2. **Data Validation & Security** (`data-validation.test.ts`)
- ✅ **Nigerian Business Logic**: Naira pricing, phone number formats, valid cities
- ✅ **Mathematical Accuracy**: Discount calculations, price consistency
- ✅ **Security Testing**: XSS protection, SQL injection prevention, input sanitization
- ✅ **Rate Limiting**: Burst traffic handling, rapid request processing
- ✅ **Error Consistency**: Structured error responses, graceful failure handling

#### 3. **Performance & Load Testing** (`performance.test.ts`)
- ✅ **Response Time Benchmarks**: <500ms negotiate, <300ms search, <200ms booking
- ✅ **Concurrent Load**: 10+ simultaneous requests, mixed API calls
- ✅ **Memory Management**: Large payload handling, repeated request testing
- ✅ **Scalability**: Performance under increasing load, resource efficiency
- ✅ **Error Recovery**: Quick recovery from invalid requests, resilience testing

## 🔧 Configuration

### Mocha Setup (`.mocharc.json`)
```json
{
  "timeout": 10000,
  "require": ["ts-node/register"],
  "extensions": ["ts"],
  "spec": "**/*.test.ts",
  "recursive": true,
  "reporter": "spec"
}
```

### Key Testing Features

#### Nigerian-Specific Validations
- **Currency**: ₦10,000 - ₦1,000,000 price ranges
- **Cities**: Lagos, Abuja, Port Harcourt, Owerri validation
- **Phone Numbers**: +234 format verification
- **Service Categories**: Hair, Massage, Cleaning, Security, etc.

#### Performance Standards
- **Negotiate API**: <500ms response time
- **Services Search**: <300ms response time  
- **Booking API**: <200ms response time
- **Partner API**: <100ms response time
- **Concurrent Handling**: 10+ simultaneous requests

#### Security Testing
- **XSS Prevention**: Script injection attempts in all inputs
- **SQL Injection**: Database query protection testing
- **Large Payloads**: 10KB+ request handling
- **Rate Limiting**: 20+ rapid sequential requests

## 📊 Sample Test Output

```bash
$ npm test

  🏨 Hotel Negotiation API
    POST /api/negotiate
      ✓ should return valid discount for existing hotel (245ms)
      ✓ should return 404 for non-existent hotel (89ms)
      ✓ should return 400 for missing propertyId (45ms)
      ✓ should validate discount percentage is reasonable (198ms)
      ✓ should handle concurrent requests consistently (421ms)

  📋 Hotel Booking API
    POST /api/book
      ✓ should accept valid booking data (67ms)
      ✓ should generate unique booking IDs (124ms)
      ✓ should accept FormData content type (89ms)

  🛍️ Services API
    POST /api/services/search
      ✓ should return services for valid city (156ms)
      ✓ should filter services by text query (203ms)
      ✓ should limit search results appropriately (178ms)

  🔍 Data Validation Tests
    ✓ should validate Nigerian Naira amounts (145ms)
    ✓ should validate discount calculation accuracy (167ms)
    ✓ should return valid Nigerian cities only (234ms)

  🛡️ Security & Error Handling
    ✓ should handle XSS attempts in property ID (456ms)
    ✓ should handle SQL injection attempts (378ms)
    ✓ should handle oversized payloads gracefully (234ms)

  ⚡ Performance & Load Testing
    ✓ should respond to negotiate API within 500ms (287ms)
    ✓ should handle 10 concurrent negotiate requests (834ms)
    ✓ should maintain performance under load (1247ms)

  95 passing (8.7s)
```

## 🎯 Benefits of Mocha for API Testing

### **Specialized for API Testing**
- **HTTP-focused**: Built specifically for testing REST APIs
- **Async/Await**: Native support for promise-based API calls
- **Chai Assertions**: Expressive assertions for HTTP responses
- **Detailed Reporting**: Clear test output with timing information

### **Better Performance**
- **Faster Execution**: No browser overhead, direct HTTP testing
- **Parallel Testing**: True concurrent request testing
- **Memory Efficient**: Lower resource usage than browser-based tests
- **CI/CD Optimized**: Perfect for automated testing pipelines

### **Enhanced Security Testing**
- **Direct HTTP Control**: Fine-grained request/response manipulation
- **Payload Testing**: Easy testing of large/malformed payloads
- **Rate Limiting**: Precise control over request timing and volume
- **Error Simulation**: Better network error simulation capabilities

## 🔄 Integration with Main Test Suite

### Updated package.json Scripts
```json
{
  "scripts": {
    "test": "cd tests && npx playwright test",
    "test:api": "cd tests/api && npm test",
    "test:api:watch": "cd tests/api && npm run test:watch",
    "test:all": "npm run test:api && npm run test",
    "test:ui": "cd tests && npx playwright test --ui",
    "test:coverage": "cd tests/api && npm run test:coverage"
  }
}
```

### Running Both Test Suites
```bash
# Run API tests only (fast)
npm run test:api

# Run UI tests only (comprehensive)
npm run test

# Run everything (complete validation)
npm run test:all
```

## 📈 Testing Strategy

### **API-First Testing**
1. **Development Phase**: Run `npm run test:api` for rapid feedback
2. **Integration Phase**: Run `npm run test:all` for complete validation  
3. **Production Deploy**: CI/CD runs both suites automatically

### **Complementary Coverage**
- **Mocha Tests**: Business logic, calculations, data validation, security
- **Playwright Tests**: User workflows, UI interactions, cross-browser compatibility

This separation provides the best of both worlds: fast, focused API testing with Mocha and comprehensive user experience testing with Playwright! 🚀