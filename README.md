# HotelSaver.ng - Hotel Booking & Negotiation Platform

## 📖 Application Overview

HotelSaver.ng is a Next.js 14 hotel booking platform that allows users to negotiate hotel prices and book local services across Nigeria. The platform focuses on four major Nigerian cities: Lagos, Abuja, Port Harcourt, and Owerri.

### 🏗️ Architecture & Key Features

#### **Core Functionality**
- **Hotel Search & Filtering**: Search hotels by city, budget range, guest count, and stay type
- **Real-time Negotiation**: Dynamic discount application with time-limited offers (5-minute expiry)
- **Mobile-First Design**: Native date pickers on mobile, responsive design
- **Service Booking**: Local services like beauty, massage, catering, security
- **Food Ordering**: Nigerian cuisine with location-based filtering

#### **Technical Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom utility classes
- **State Management**: URL-based state with React hooks
- **Date Handling**: react-datepicker with mobile fallbacks
- **Deployment**: Vercel

#### **Business Logic**
- **Pricing**: Nigerian Naira (₦) with 7.5% VAT on multi-night stays
- **Discounts**: 15% default discount, configurable per property
- **Cities**: Lagos, Abuja, Port Harcourt, Owerri
- **Budget Ranges**: Under ₦80k, ₦80k-₦130k, ₦130k-₦200k, ₦200k+

### 🗺️ User Journey Flow

```
1. Homepage → Search Form (City, Dates, Guests, Budget)
2. Search Results → Hotel Cards with Pricing
3. Hotel Details → View Images, Amenities, Pricing
4. Negotiation → Real-time discount with countdown timer
5. Booking → Contact form with price preservation
6. Confirmation → Booking ID and details
```

### 📱 Key Pages & Components

#### **Primary Pages**
- `/` - Homepage with hero search
- `/search` - Hotel search results with filtering
- `/hotel/[id]` - Hotel detail page with gallery
- `/negotiate` - Real-time negotiation with progress
- `/book` - Booking form with contact details
- `/services` - Local service marketplace
- `/food` - Nigerian food ordering

#### **Core Components**
- `SearchBar` - Complex form with device-specific date pickers
- `ClientLayout` - Header with mobile hamburger menu
- `SafeImage` - Client-side image component with fallbacks
- `CategoryTabs` - Navigation between Hotels/Services/Food

---

## 🧪 Test Automation Suite

This project includes a comprehensive Playwright-based testing suite covering UI interactions, API endpoints, and end-to-end user journeys with both positive and negative test scenarios.

### 📋 Test Coverage Areas

1. **Search & Filtering** - Date calculations, city selection, budget ranges
2. **Hotel Details** - Image loading, pricing accuracy, amenity display
3. **Negotiation Flow** - Discount calculations, timer functionality, expiry
4. **Booking Process** - Form validation, price preservation, confirmation
5. **Mobile Experience** - Native date pickers, hamburger menu, responsiveness
6. **API Endpoints** - All backend services and data validation
7. **Edge Cases** - Network failures, expired sessions, invalid data

### 🚀 Quick Start Testing

```bash
# Install dependencies
npm install

# Install Playwright
npm run test:install

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
```

---

## 📊 Test Metrics & Reporting

- **Total Test Cases**: 150+
- **Coverage Areas**: 8 major user journeys
- **API Endpoints**: 6 endpoints tested
- **Device Testing**: Desktop, Mobile, Tablet
- **Browser Coverage**: Chrome, Firefox, Safari, Mobile browsers

### 🎯 Test Results Dashboard

After running tests, view results at: `./playwright-report/index.html`

---

## 🔧 Development Setup

```bash
# Clone repository
git clone <repository-url>
cd hotelsaver-ng-v9

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 🌐 Environment URLs

- **Development**: http://localhost:3000
- **Production**: https://hotelsaverversion-myaxiu4sx-amanzes-projects-2bbd5fbf.vercel.app

---

## 📞 Support & Contact

- **Customer Support**: https://wa.me/2347077775545
- **Email**: [Contact form on website]
- **Documentation**: This README and inline code comments

---

## 🏷️ Version Information

- **Application Version**: v9
- **Next.js**: 14.2.33
- **Node.js**: >=18.0.0
- **Last Updated**: October 2025
