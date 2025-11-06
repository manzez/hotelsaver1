# HotelSaver.ng - AI Agent Instructions

## Project Overview
HotelSaver.ng is a Next.js 14 hotel booking platform with real-time negotiation features, focusing on Nigerian markets (Lagos, Abuja, Port Harcourt, Owerri). The core business logic revolves around dynamic discount application and time-limited offers.

## Key Architecture Patterns

### Data Flow & Business Logic
- **Hotels**: Static data in `lib.hotels.json` with `basePriceNGN`, `stars`, `city`, `type`
- **Services**: Local services in `lib.services.json` with `amountNGN`, `category`, `city`
- **Discounts**: Configurable via `lib/discounts.json` with 15% default + per-property overrides
- **Negotiation API**: `/api/negotiate` applies discounts with 5-minute expiry timers

### Critical Workflow: Search → Negotiate → Book
1. **Search** (`/search`): Filter hotels by city, budget ranges (`u80`, `80_130`, etc.), calculate nights + tax (7.5%)
2. **Negotiate** (`/negotiate`): POST to `/api/negotiate` → get discounted price → 5min countdown timer
3. **Book** (`/book`): Capture contact info, preserve negotiated price

### Discount System Implementation
```typescript
// Always use getDiscountFor(propertyId) from lib/discounts.ts
const discount = getDiscountFor(propertyId); // Returns 0.15 default or override
const discountedPrice = Math.round(basePrice * (1 - discount));
```

### UI Component Patterns
- **SearchBar**: Complex state management with DatePicker, guest counters, budget selectors
- **Card-based layouts**: Use `.card`, `.grid-cards`, `.btn-primary` utility classes
- **Nigerian focus**: Cities hardcoded as `['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']`

## Component Architecture

### Core Components Structure

#### `SearchBar.tsx` - Main Search Interface
```typescript
// Complex state management with 8 controlled inputs
const [city, setCity] = useState('')
const [startDate, setStartDate] = useState<Date | null>(null)
const [endDate, setEndDate] = useState<Date | null>(null)
const [adults, setAdults] = useState(2)
const [children, setChildren] = useState(0)
const [rooms, setRooms] = useState(1)
const [budgetKey, setBudgetKey] = useState('u80')
const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>('any')
```

**Key Patterns:**
- Uses `URLSearchParams` to build search query with all form state
- Budget ranges: `u80`, `80_130`, `130_200`, `200p` map to price filters
- Guest picker dropdown with increment/decrement controls for adults, children, rooms
- Date range selection using `react-datepicker` with custom CSS styling
- Form submission navigates to `/search?{encoded params}`

#### `CategoryTabs.tsx` - Navigation Switcher
```typescript
const tabs = [
  { key: 'hotels', label: 'Hotels', href: '/' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'food', label: 'Food', href: '/food' }
]
```

**Key Patterns:**
- Active state determined by both `active` prop and current `pathname`
- Uses Tailwind conditional classes for styling active/inactive states
- Rounded tab design with background color switching

#### `BackButton.tsx` - Simple Navigation
- Uses `useRouter().back()` for browser history navigation
- Consistent styling with `btn-ghost` utility class

#### `ClientDatepicker.tsx` - SSR-Safe Date Component
- Dynamic import with `ssr: false` to prevent hydration issues
- Wrapper for `react-tailwindcss-datepicker` with custom styling

### Component Communication Patterns
- **State Up**: SearchBar manages all form state, passes to API via URL params
- **Prop Drilling**: CategoryTabs receives `active` prop from parent pages
- **URL State**: Search parameters preserve state across page navigation
- **Client Components**: All interactive components use `'use client'` directive

### Styling Conventions
- **Utility Classes**: Consistent use of `.card`, `.btn-primary`, `.btn-ghost`
- **Responsive Design**: Mobile-first with `md:` breakpoints
- **State Classes**: Conditional styling based on component state (active, disabled, etc.)
- **Custom CSS**: Date picker styling in `components/datepicker.css`

## State Management Patterns

### URL-Based State Flow
The application uses URL parameters as the primary state management mechanism across the booking workflow:

#### **Search → Results State Transfer**
```typescript
// SearchBar builds URLSearchParams with all form state
const q = new URLSearchParams({
  city, checkIn: startDate?.toISOString(),
  adults: String(adults), children: String(children),
  rooms: String(rooms), budget: budgetKey, stayType
})
router.push(`/search?${q.toString()}`)
```

#### **Results → Negotiation State Preservation**
```typescript
// Search page preserves booking context in negotiate links
<Link href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}>
```

#### **Negotiation → Booking State Transfer**
```typescript
// Negotiate page passes negotiated price to booking
router.push(`/book?propertyId=${propertyId}&price=${price}`)
```

### Component State Patterns

#### **SearchBar Complex State Management**
- **8 controlled inputs**: city, dates, guests, budget, stay type
- **Derived state**: `guestSummary` string for display
- **Conditional UI**: Guest picker dropdown with toggle state
- **Form validation**: Required fields before navigation

#### **Negotiation Finite State Machine**
```typescript
const NEG_STATUS = {
  PENDING: 'pending',    // Initial API call
  OFFER: 'offer',        // Discount received
  NO_OFFER: 'no-offer',  // No discount available  
  EXPIRED: 'expired'     // 5-minute timer expired
}
```

**State Transitions:**
- `PENDING` → `OFFER` (success) or `NO_OFFER` (failure)
- `OFFER` → `EXPIRED` (timer countdown)
- Timer cleanup prevents memory leaks on component unmount

#### **Real-time Timer Management**
```typescript
// 5-minute countdown with automatic expiry
useEffect(() => {
  const tick = () => {
    const left = expiresAt - Date.now()
    setRemaining(Math.max(0, left))
    if (left <= 0) setNegStatus(NEG_STATUS.EXPIRED)
  }
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer)
# HotelSaver.ng – AI agent quickstart (Next.js 14)
}, [expiresAt])
### Data Persistence Strategies
- **No global state**: Each page reads from URL parameters
- **Stateless navigation**: All context passed via URL
- **Server-side expiry**: API provides timestamp-based offer expiration

### State Validation Patterns
- **Type coercion**: `String(adults)`, `Number(data.baseTotal)`
- **Null-safe operations**: `startDate?.toISOString() || ''`

## Development Workflows

### Essential Commands
```bash
npm run build        # Production build
npm start           # Production server
```
### File Structure Conventions
- `/app` - Next.js App Router (not Pages Router)
- `/components` - Reusable UI components with TypeScript
- `/lib` - Business logic, data imports, utility functions

### Styling System
- **Tailwind CSS** with custom brand colors: `brand-green`, `brand-dark`
- **Nigerian Naira**: Always format prices as `₦{amount.toLocaleString()}`

## Styling Patterns & Design System

```javascript
// tailwind.config.js
colors: {
  brand: {
    green: "#009739",    // Primary brand color
  }
}
```

### Core Utility Classes (globals.css)

#### **Layout & Container**
```css
.container { @apply mx-auto max-w-6xl px-4; }
.grid-cards { @apply grid sm:grid-cols-2 lg:grid-cols-3 gap-5; }
```

#### **Button System**
```css
.btn { @apply inline-flex items-center justify-center rounded-md px-4 h-11 font-medium; }
.btn-primary { @apply btn bg-brand-green text-white hover:bg-brand-dark transition; }
.btn-ghost { @apply btn bg-white border border-gray-200 hover:bg-gray-50; }
```

#### **Card Components**
```css
.card { @apply bg-white rounded-xl shadow-soft border border-gray-100; }
/* Hover interactions */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0,0,0,.08);
}
```

#### **Form Elements**
```css
.input, .select { @apply h-11 rounded-md border border-gray-300 px-3 w-full bg-white; }
.badge { @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-brand-green; }
```

### Navigation & Tab System
```css
.tabs { @apply inline-flex items-center rounded-lg bg-gray-100 p-1; }
.tab { @apply px-3 h-9 inline-flex items-center rounded-md text-sm; }
.tab-active { @apply bg-white text-brand-green border border-gray-200; }
```

### Search Component Styles
```css
.search-card { @apply bg-white border border-gray-200 rounded-xl p-3 md:p-4; }
.search-row { @apply flex flex-wrap items-end gap-2 md:gap-3; }
.chip { @apply h-10 px-3 border border-gray-300 rounded-full text-sm bg-white; }
.chip.active { @apply border-brand-green/30 bg-emerald-50; }
```

### DatePicker Custom Styling
**File: `components/datepicker.css`**
- **Brand integration**: Uses emerald-600 for selected dates
- **Mobile responsive**: Scale transform and fixed positioning for small screens
- **Z-index management**: Portal positioning with `z-index: 9999`
- **Custom shadows**: Box-shadow matching Tailwind patterns

### Responsive Design Patterns

#### **Mobile-First Breakpoints**
- `sm:` (640px+): 2-column grids, horizontal layouts
- `md:` (768px+): 3-column grids, desktop navigation
- `lg:` (1024px+): Full desktop layouts

#### **Mobile Optimizations**
```css
@media (max-width: 768px) {
  .btn-wrap .btn-primary { @apply w-full; }  // Full-width buttons
  .react-datepicker { transform: scale(0.9); } // Scaled datepicker
}
```

### Animation & Interaction Patterns
- **Card hover**: `translateY(-2px)` with shadow enhancement
- **Button transitions**: Smooth color changes with `transition` class
- **Active states**: Conditional styling using Tailwind's state variants

### Color Usage Guidelines
- **Primary actions**: `bg-brand-green` with `hover:bg-brand-dark`
- **Secondary actions**: `bg-white` with `border-gray-200`
- **Success states**: `bg-green-50` with `text-brand-green`
- **Price display**: Nigerian Naira `₦` with `toLocaleString()` formatting

## Data Validation & Error Handling

### Input Validation Patterns

#### **API Route Validation**
```typescript
// /api/negotiate - Comprehensive property validation
if (!propertyId || typeof propertyId !== 'string') {
  return NextResponse.json(
    { status: 'no-offer', reason: 'invalid-propertyId' },
    { status: 400 }
  );
}

const property = HOTELS.find(h => h.id === propertyId);
if (!property) {
  return NextResponse.json(
    { status: 'no-offer', reason: 'not-found' },
    { status: 404 }
  );
}

// Handles mixed data schema - basePriceNGN vs price
const base = typeof property.basePriceNGN === 'number' 
  ? property.basePriceNGN 
  : typeof property.price === 'number' 
  ? property.price 
  : 0;
```

#### **Date Validation with Fallbacks**
```typescript
// Search page - Defensive date parsing
function nightsBetween(checkIn?: string | null, checkOut?: string | null) {
  if (!checkIn || !checkOut) return 0
  const ci = new Date(checkIn)
  const co = new Date(checkOut)
  if (isNaN(+ci) || isNaN(+co)) return 0  // Invalid date handling
  const ms = co.getTime() - ci.getTime()
  const n = Math.max(0, Math.round(ms / (1000*60*60*24)))
  return n
}
```

#### **Form Input Sanitization**
```typescript
// Service booking - Type coercion with fallbacks
<input 
  type="number" 
  min={1} 
  value={people} 
  onChange={e => setPeople(parseInt(e.target.value || '1'))} 
/>

// Services search - String sanitization
const q = String(query || '').toLowerCase();
```

### Error Handling Strategies

#### **Component-Level Error Boundaries**
```typescript
// Hotel detail page - Not found handling
const h = HOTELS.find(x => x.id === params.id)
if (!h) return <div className="py-10">Not found</div>

// Service detail page - Same pattern
const s = SERVICES.find(x => x.id === params.id)
if (!s) return <div className="py-10">Not found</div>
```

#### **API Error Responses with Reason Codes**
```typescript
// Structured error responses for debugging
{ status: 'no-offer', reason: 'invalid-propertyId' }
{ status: 'no-offer', reason: 'not-found' }
{ status: 'no-offer', reason: 'no-base-price' }
{ status: 'no-offer', reason: 'no-discount' }
```

#### **Try-Catch with Graceful Fallbacks**
```typescript
// Discount calculation with error recovery
export function getDiscountFor(propertyId: string): number {
  try {
    if (!propertyId || typeof propertyId !== 'string') {
      return DEFAULT_DISCOUNT;
    }
    // ... validation logic
    return defaultDiscount;
  } catch (error) {
    console.error('Error in getDiscountFor:', error);
    return DEFAULT_DISCOUNT;  // Always provide fallback
  }
}
```

### Data Schema Flexibility

#### **Mixed Property Price Fields**
The app handles hotels with either `basePriceNGN` or `price` fields:
```typescript
// Defensive property access in API routes
const base = typeof property.basePriceNGN === 'number'
  ? property.basePriceNGN
  : typeof property.price === 'number'
  ? property.price
  : 0;  // Fallback for missing price data
```

#### **URL Parameter Sanitization**
```typescript
// Always provide defaults for missing URL params
const propertyId = sp.get('propertyId') || ''
const price = sp.get('price') || ''
const city = params.get('city') || ''
const budget = params.get('budget') || 'u80'
```

### Form Validation Patterns

#### **Client-Side Validation**
- **Required fields**: Form submission prevented until filled
- **Email validation**: Uses `type="email"` for browser validation  
- **Number inputs**: `min={1}` attributes prevent invalid ranges
- **Type coercion**: `parseInt(e.target.value || '1')` with fallbacks

#### **No Server-Side Validation**
Most endpoints accept any payload and return success:
```typescript
// /api/book - Minimal validation
export async function POST(req: NextRequest) {
  const payload = await req.json();
  return NextResponse.json({bookingId: 'BK' + Date.now(), status: 'confirmed'});
}
```

### Edge Case Handling

#### **Timer Management**
```typescript
// Negotiation page - Cleanup prevents memory leaks
useEffect(() => {
  return () => { 
    if (timerRef.current) { 
      clearInterval(timerRef.current); 
      timerRef.current = null; 
    } 
  }
}, [expiresAt])
```

#### **Search Result Limiting**
```typescript
// Services search - Prevent large response payloads
return NextResponse.json({results: list.slice(0, 60)});
```

## Nigerian Business Logic & Local Market Requirements

### Geographic Coverage & City-Specific Features

#### **Target Markets (Hardcoded)**
```typescript
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
```

**Market Characteristics:**
- **Lagos**: Commercial hub, largest hotel inventory, premium properties (₦200k+ nightly rates)
- **Abuja**: Federal capital, government business travel, mid-to-high tier properties
- **Port Harcourt**: Oil industry hub, business travel focus, mixed property types
- **Owerri**: Regional center, emerging market, growing hospitality sector

#### **City-Specific Business Rules**
- **Negotiation availability**: All cities support real-time negotiation except potential Abuja restrictions
- **Service categories**: Each city has localized service offerings (Hair, Nails, Massage, Security, etc.)
- **Pricing tiers**: Regional price variations reflected in base rates and service costs

### Currency & Pricing Framework

#### **Nigerian Naira (₦) Implementation**
```typescript
// All prices stored as integers in NGN
basePriceNGN: 150000  // ₦150,000 per night
amountNGN: 65206      // ₦65,206 service fee

// Display formatting (always use toLocaleString())
₦{price.toLocaleString()}  // ₦150,000 (with commas)
```

#### **Budget Range Categories**
```typescript
const budgets = [
  { key: 'u80', label: 'Under ₦80k' },      // Budget properties
  { key: '80_130', label: '₦80k–₦130k' },   // Mid-range
  { key: '130_200', label: '₦130k–₦200k' }, // Premium
  { key: '200p', label: '₦200k+' }          // Luxury
]

// Price range mapping for filtering
function priceRange(key: string) {
  if(key === 'u80') return [0, 80000]
  if(key === '80_130') return [80000, 130000] 
  if(key === '130_200') return [130000, 200000]
  return [200000, 99999999]  // ₦200k+
}
```

### Tax & Regulatory Compliance

#### **VAT Implementation**
```typescript
const TAX_RATE = 0.075 // 7.5% Nigerian VAT
const tax = nights > 0 ? Math.round(subtotal * TAX_RATE) : 0
const total = subtotal + tax

// Display: "₦45,000 incl. tax (₦3,150)"
```

**Tax Rules:**
- Applied to multi-night stays only
- Rounded to nearest Naira
- Displayed separately for transparency

### Service Categories & Local Preferences

#### **Nigerian-Specific Service Types**
```typescript
// Service categories reflect local demand
categories: [
  'Massage',      // Wellness & relaxation
  'Hair',         // Styling & braiding (culturally significant)
  'Nails',        // Beauty services
  'Cleaning',     // Home & office maintenance  
  'Security',     // Private security personnel
  'Catering',     // Event & home catering
  'Chef',         // Private cooking services
  'Car hire',     // Transportation with driver
  'Guide',        // Local city tours
  'Photography',  // Event documentation
  'Livestock',    // Agricultural services
  'Braiding',     // Specialized hair services
  'Dry Cleaning', // Laundry services
]
```

#### **Cultural Considerations**
- **Hair services**: Braiding and natural hair care prioritized
- **Security services**: Common requirement for events and properties
- **Livestock**: Agricultural market services (goat, cow suppliers)
- **Translation**: Multi-language business support

### Food & Cuisine Integration

#### **Traditional Nigerian Dishes**
```typescript
// Featured on homepage with cultural authenticity
dishes: [
  'Jollof Rice & Chicken',    // National dish, party staple
  'Pounded Yam & Egusi',      // Traditional swallow + soup
  'Efo Riro',                 // Spinach stew variant
  'Goat Meat Pepper Soup',    // Spicy comfort food
  'Suya',                     // Popular street food
  'Ofada Rice & Ayamase',     // Local rice with green stew
  'Moi Moi',                  // Steamed bean cake
  'Akara',                    // Bean fritters
  'Puff-Puff'                 // Sweet snack
]
```

### Negotiation Business Logic

#### **Regional Discount Strategies**
- **Default**: 15% across all properties
- **Override system**: Per-property customization via `discounts.json`
- **Time pressure**: 5-minute expiry creates urgency
- **Transparency**: Show original price, discount, and savings

#### **Market-Specific Rules**
```typescript
// Potential city-based restrictions (implementation ready)
if (hotel.city === 'abuja') {
  // "Deals exhausted for today" message
  // Could be time-based, inventory-based, or policy-driven
}
```

### Business Hours & Cultural Timing

#### **Service Availability**
- **Standard duration**: 1-2 hour service windows
- **Cancellation policy**: "Free cancellation up to 24h before"
- **Business hours**: Implicit 24/7 hotel availability
- **Service scheduling**: Flexible timing for on-demand services

### Contact & Communication Patterns

#### **WhatsApp Integration**
```typescript
// Primary customer support channel
href='https://wa.me/2347077775545'
// Nigerian phone number format (+234)
```

#### **Local Contact Preferences**
- **Phone**: WhatsApp is primary communication method
- **Email**: Secondary for confirmations and receipts
- **SMS**: Not prominently featured (WhatsApp dominance)

### Payment & Booking Patterns

#### **Booking Confirmation Flow**
- **No upfront payment**: Contact-first booking model
- **Email confirmations**: Both customer and admin notifications
- **Reference codes**: Time-stamped IDs (BK/SV + timestamp)
- **Manual processing**: Human verification implied for bookings

## Development Workflows

### Essential Commands
```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm start           # Production server
```

### File Structure Conventions
- `/app` - Next.js App Router (not Pages Router)
- `/components` - Reusable UI components with TypeScript
- `/lib` - Business logic, data imports, utility functions
- `lib.hotels.json` & `lib.services.json` - Primary data sources (not in `/lib` folder)

### Styling System
- **Tailwind CSS** with custom brand colors: `brand-green`, `brand-dark`
- **Utility classes**: `.card`, `.btn-primary`, `.grid-cards` defined in `globals.css`
- **Nigerian Naira**: Always format prices as `₦{amount.toLocaleString()}`

## Integration Points

### External Dependencies
- **react-datepicker**: Date selection with custom styling in `components/datepicker.css`
- **Unsplash**: Hotel images via direct URLs in JSON data
- **No external APIs**: All data is static JSON files

### TypeScript Patterns
- Import JSON with type assertions: `const data = jsonData as MyType[]`
- Defensive programming in discount calculations with fallbacks
- Use `URLSearchParams` for search state management across pages

## Business Rules
- **Default discount**: 15% on all properties unless overridden in `discounts.json`
- **Tax calculation**: 7.5% VAT applied to multi-night stays
- **Offer expiry**: All negotiated prices expire in exactly 5 minutes
- **City-specific logic**: Some features may be city-dependent (check for Abuja edge cases)

## Common Gotchas
- Hotels data has mixed `basePriceNGN` vs `price` fields - handle both in API routes
- Search params need encoding/decoding for dates and guest counts
- Timer cleanup required for negotiation countdown to prevent memory leaks
- Tailwind purging may remove custom classes - ensure they're used in components

## Food & Services Features
- Nigerian cuisine focus with specific dishes (Jollof Rice, Egusi, Suya, etc.)
- Service categories: Hair/Beauty, Massage, Catering, Livestock
- Both use grid layouts with hover effects and Nigerian-specific imagery

## Data Schema Essentials

### Hotel Object Structure
```typescript
interface Hotel {
  id: string;                    // Used for discounts lookup
  name: string;
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Owerri';
  basePriceNGN: number;         // Base price in Nigerian Naira
  stars: number;                // 1-5 star rating
  type: 'Hotel' | 'Apartment';
  images: string[];             // Unsplash URLs
}
```

### Service Object Structure
```typescript
interface Service {
  id: string;
  city: string;
  category: string;             // 'Nails', 'Hair', 'Massage', etc.
  amountNGN: number;
  provider: string;
  rating: number;
}
```

## Integration Points

### External Dependencies
- **react-datepicker**: Date selection with custom styling in `components/datepicker.css`
- **Unsplash**: Hotel images via direct URLs in JSON data
- **No external APIs**: All data is static JSON files

### TypeScript Patterns
- Import JSON with type assertions: `const data = jsonData as MyType[]`
- Defensive programming in discount calculations with fallbacks
- Use `URLSearchParams` for search state management across pages

## API Routes Architecture

### `/api/negotiate` - Core Negotiation Engine
```typescript
// Request: { propertyId: string }
// Response: { status: 'discount' | 'no-offer', baseTotal, discountedTotal, savings, expiresAt }
```

**Business Logic Flow:**
1. Validates `propertyId` exists in hotels data
2. Extracts base price (handles both `basePriceNGN` and `price` fields)
3. Calls `getDiscountFor(propertyId)` to get discount rate (0-1)
4. Calculates: `discountedPrice = Math.round(basePrice * (1 - discount))`
5. Returns offer with 5-minute server-side expiry timestamp

**Error Handling:**
- `invalid-propertyId`: Missing or invalid property ID
- `not-found`: Property doesn't exist in hotels data
- `no-base-price`: Property missing price information
- `no-discount`: Discount rate is 0 or negative

### `/api/book` - Booking Confirmation
```typescript
// Request: { propertyId, negotiationToken, rooms, adults, children, checkIn, checkOut, contact }
// Response: { bookingId: 'BK{timestamp}', status: 'confirmed' }
```

**Simple Implementation:**
- Accepts any booking payload
- Generates timestamp-based booking ID
- Always returns success (no validation currently)

### `/api/services/search` - Service Discovery
```typescript
// Request: { city?: string, query?: string }
// Response: { results: Service[] } // Max 60 results
```

**Search Algorithm:**
- Filters by city if provided
- Text search on `title` and `category` fields (case-insensitive)
- Uses `SERVICES` from static JSON data
- Limits results to prevent large payloads

### `/api/services/book` - Service Booking
```typescript
// Accepts both JSON and FormData
// Response: { status: 'confirmed', reference: 'SV{timestamp}', data }
```

**Flexible Input Handling:**
- Detects content-type and handles JSON or form data
- Generates service reference ID
- Returns echo of submitted data

### `/api/partner` - Partnership Applications
```typescript
// Request: Any JSON payload
// Response: { ok: true }
```

**Minimal Implementation:**
- Accepts any partner application data
- No validation or processing
- Always returns success

## Business Rules
- **Default discount**: 15% on all properties unless overridden in `discounts.json`
- **Tax calculation**: 7.5% VAT applied to multi-night stays
- **Offer expiry**: All negotiated prices expire in exactly 5 minutes
- **City-specific logic**: Some features may be city-dependent (check for Abuja edge cases)

## Common Gotchas
- Hotels data has mixed `basePriceNGN` vs `price` fields - handle both in API routes
- Search params need encoding/decoding for dates and guest counts
- Timer cleanup required for negotiation countdown to prevent memory leaks
- Tailwind purging may remove custom classes - ensure they're used in components

## Food & Services Features
- Nigerian cuisine focus with specific dishes (Jollof Rice, Egusi, Suya, etc.)
- Service categories: Hair/Beauty, Massage, Catering, Livestock
- Both use grid layouts with hover effects and Nigerian-specific imagery
## Development Debugging & Troubleshooting

### Common Issues & Solutions

#### **Memory Leaks & Timer Cleanup**
**Problem**: Negotiation countdown timers not cleaned up on component unmount
```typescript
// INCORRECT - Memory leak risk
useEffect(() => {
  const timer = setInterval(() => {
    // Update countdown
  }, 1000);
}, []);

// CORRECT - Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setRemaining(Math.max(0, expiresAt - Date.now()));
  }, 1000);
  
  return () => {
    clearInterval(timer);  // Always cleanup
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [expiresAt]);
```

**Debugging Steps:**
1. Check React DevTools for components not unmounting
2. Monitor browser memory usage during navigation
3. Verify timer cleanup in useEffect return functions

#### **Hydration & SSR Issues**
**Problem**: DatePicker causing hydration mismatches
```typescript
// SOLUTION - SSR-safe component pattern
const ClientDatepicker = dynamic(
  () => import('./DatePickerComponent'),
  { ssr: false }  // Prevent server-side rendering
);
```

**Symptoms:**
- "Hydration failed" errors in console
- Mismatched content between server and client
- Date picker not rendering correctly

**Fix Strategy:**
- Use dynamic imports with `ssr: false` for client-only components
- Wrap problematic components in `{typeof window !== 'undefined' && <Component />}`
- Check `components/ClientDatepicker.tsx` for reference implementation

#### **API Route Debugging**
**Problem**: Negotiate API returning unexpected responses
```typescript
// DEBUG - Add logging to API routes
export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();
    console.log('Negotiate API called with:', { propertyId });
    
    // Validate property exists
    const property = HOTELS.find(h => h.id === propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return NextResponse.json(
        { status: 'no-offer', reason: 'not-found' },
        { status: 404 }
      );
    }
    
    // ... rest of logic
  } catch (error) {
    console.error('Negotiate API error:', error);
    return NextResponse.json(
      { status: 'no-offer', reason: 'server-error' },
      { status: 500 }
    );
  }
}
```

**Common API Issues:**
- Mixed `basePriceNGN` vs `price` fields in hotel data
- Missing property IDs in negotiate requests
- Discount calculation returning NaN values
- Timer expiry timestamps in wrong timezone

#### **Search State Corruption**
**Problem**: URL parameters not preserving correctly across navigation
```typescript
// DEBUG - Log parameter parsing
function parseSearchParams(params: URLSearchParams) {
  const parsed = {
    city: params.get('city') || '',
    checkIn: params.get('checkIn') || '',
    adults: Number(params.get('adults')) || 2,
    budget: params.get('budget') || 'u80'
  };
  console.log('Parsed search params:', parsed);
  return parsed;
}
```

**Symptoms:**
- Search results don't match selected filters  
- Guest counts reset to default values
- Date ranges disappear on page refresh
- Budget filters not applied correctly

#### **Price Calculation Errors**
**Problem**: Discount calculations returning incorrect values
```typescript
// DEBUG - Step-by-step price calculation
function calculateNegotiatedPrice(propertyId: string, basePrice: number) {
  console.log('Base price:', basePrice);
  
  const discount = getDiscountFor(propertyId);
  console.log('Discount rate:', discount);
  
  if (discount <= 0) {
    console.log('No discount available');
    return null;
  }
  
  const discounted = Math.round(basePrice * (1 - discount));
  const savings = basePrice - discounted;
  
  console.log('Calculated:', { basePrice, discounted, savings });
  return { discounted, savings };
}
```

### Build & Deployment Issues

#### **TypeScript Errors**
**Common Issues:**
- JSON imports without proper type declarations
- Missing type definitions for react-datepicker
- URLSearchParams type mismatches

**Solutions:**
```typescript
// types/json.d.ts - Add module declarations
declare module '*.json' {
  const value: any;
  export default value;
}

// app/react-tailwindcss-datepicker.d.ts - Custom type definitions
declare module 'react-tailwindcss-datepicker' {
  export interface DateValueType {
    startDate: Date | null;
    endDate: Date | null;
  }
  // ... other types
}
```

#### **Tailwind Purging Issues**
**Problem**: Custom utility classes not included in build
```css
/* globals.css - Ensure classes are used in components */
.btn-primary { /* ... */ }  /* Used in SearchBar.tsx */
.card { /* ... */ }          /* Used in hotel cards */
.grid-cards { /* ... */ }    /* Used in search results */
```

**Prevention:**
- Reference utility classes in component code, not just CSS
- Add safelist to `tailwind.config.js` for dynamic classes
- Use template literals carefully with class names

### Performance Debugging

#### **Large Data Set Performance**
**Problem**: Slow rendering with 60+ search results
```typescript
// SOLUTION - Implement result limiting
const searchResults = useMemo(() => {
  return hotels
    .filter(filterFunction)
    .slice(0, 50);  // Limit results
}, [hotels, filters]);
```

#### **Image Loading Optimization**
**Current State**: Uses direct Unsplash URLs
```typescript
// Consider lazy loading for performance
<img 
  src={hotel.images[0]} 
  loading="lazy"           // Browser-native lazy loading
  className="object-cover" 
/>
```

### Testing & Validation Workflows

#### **Manual Testing Checklist**
1. **Search Flow**:
   - [ ] All cities populate results
   - [ ] Budget filters work correctly  
   - [ ] Date picker handles edge cases
   - [ ] Guest counts persist across navigation

2. **Negotiation Flow**:
   - [ ] API returns valid discount offers
   - [ ] Timer counts down correctly
   - [ ] Expired offers show appropriate message
   - [ ] Price calculations are accurate

3. **Booking Flow**:
   - [ ] Contact form validation works
   - [ ] Booking confirmation generates unique ID
   - [ ] Email addresses validate correctly

#### **Browser Compatibility**
- **Safari**: Check date picker rendering issues
- **Mobile Chrome**: Verify touch interactions
- **Firefox**: Test URL parameter handling
- **Edge**: Validate CSS custom properties

### Debugging Tools & Commands

#### **Development Server Issues**
```bash
# Clear Next.js cache
rm -rf .next && npm run dev

# Verbose logging
DEBUG=* npm run dev

# Port conflicts
lsof -ti:3000 | xargs kill -9
npm run dev
```

#### **Build Analysis**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Type checking only
npx tsc --noEmit

# Lint issues
npx eslint . --ext .ts,.tsx
```

#### **Browser DevTools Usage**
- **Network Tab**: Check API response times and payloads
- **Application Tab**: Inspect localStorage/sessionStorage (currently unused)
- **Console**: Monitor timer cleanup and state changes
- **React DevTools**: Track component re-renders and prop changes

### Emergency Fixes

#### **Quick Hotfixes for Common Issues**
```typescript
// 1. Negotiation timer not working
// File: app/negotiate/page.tsx
// Add null checks around timer logic

// 2. Search results empty
// File: app/search/page.tsx  
// Verify hotel data import path

// 3. Price display errors
// File: All price components
// Ensure toLocaleString() is used consistently

// 4. Date picker crashes
// File: components/SearchBar.tsx
// Wrap in try-catch and provide fallback UI
```

#### **Data Recovery Procedures**
- **Hotels data**: Restore from `lib.hotels.json` if corrupted
- **Services data**: Fallback to `lib.services.json` backup
- **Discounts**: Reset to 15% default if `discounts.json` breaks

#### **Rollback Strategy**
```bash
# Revert to last known good state
git log --oneline -10        # Find last good commit
git checkout <commit-hash>   # Temporary checkout
git checkout -b hotfix       # Create branch from good state
```

### Performance Monitoring

#### **Key Metrics to Track**
- **API Response Times**: `/api/negotiate` should be < 100ms
- **Search Performance**: Results should render < 300ms
- **Timer Accuracy**: Countdown should be within 1 second of server time
- **Memory Usage**: No growth during extended browsing sessions

#### **Profiling Commands**
```bash
# Lighthouse CI
npx lighthouse http://localhost:3000 --view

# Bundle analysis  
npx webpack-bundle-analyzer .next/static/chunks/*.js
```
