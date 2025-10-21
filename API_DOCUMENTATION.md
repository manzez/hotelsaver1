# HotelSaver.ng API Documentation

## Overview

HotelSaver.ng provides a RESTful API for hotel booking, negotiation, and administration. This document covers all available endpoints, request/response formats, and authentication requirements.

**Base URL**: `https://your-domain.com/api`  
**Authentication**: Admin endpoints require `x-admin-key` header

---

## Public APIs

### 1. Hotel Negotiation

#### POST `/api/negotiate`

Negotiate a discounted price for a hotel property.

**Request Body:**
```json
{
  "propertyId": "string" // Hotel ID from search results
}
```

**Response (Success):**
```json
{
  "status": "discount",
  "baseTotal": 150000,
  "discountedTotal": 127500,
  "savings": 22500,
  "discountRate": 0.15,
  "extras": {
    "carWash": true,
    "complimentaryGifts": true
  },
  "message": "Great news! We negotiated 15% off + FREE car wash + complimentary gifts!",
  "expiresAt": "2025-10-20T14:30:00.000Z",
  "property": {
    "id": "transcorp-hilton-abuja-abuja",
    "name": "Transcorp Hilton Abuja",
    "city": "Abuja",
    "originalPrice": 150000,
    "negotiatedPrice": 127500
  }
}
```

**Response (No Discount Available):**
```json
{
  "status": "no-offer",
  "reason": "no-discount",
  "message": "This hotel has fixed pricing with no negotiation available.",
  "property": {
    "id": "property-id",
    "name": "Hotel Name",
    "city": "City"
  }
}
```

**Error Codes:**
- `400`: Invalid or missing propertyId
- `404`: Property not found or no discount available

### 2. Hotel Booking

#### POST `/api/book`

Create a hotel booking with contact details.

**Request Body:**
```json
{
  "propertyId": "string",
  "negotiationToken": "string", // Optional
  "rooms": 1,
  "adults": 2,
  "children": 0,
  "checkIn": "2025-10-25",
  "checkOut": "2025-10-27",
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2347123456789"
  }
}
```

**Response:**
```json
{
  "bookingId": "BK1729425600000",
  "status": "confirmed"
}
```

### 3. Service Search

#### GET `/api/services/search`

Search for local services by city and category.

**Query Parameters:**
- `city` (optional): Filter by city
- `query` (optional): Search term for service title/category

**Response:**
```json
{
  "results": [
    {
      "id": "service-id",
      "title": "Professional Hair Styling",
      "category": "Hair", 
      "city": "Lagos",
      "provider": "Beauty Salon Name",
      "amountNGN": 25000,
      "rating": 4.8
    }
  ]
}
```

### 4. Service Booking

#### POST `/api/services/book`

Book a local service.

**Request Body (JSON or FormData):**
```json
{
  "serviceId": "string",
  "date": "2025-10-25",
  "time": "14:00",
  "people": 2,
  "contact": {
    "name": "Jane Doe",
    "email": "jane@example.com", 
    "phone": "+2347123456789"
  }
}
```

**Response:**
```json
{
  "status": "confirmed",
  "reference": "SV1729425600000",
  "data": { /* echo of submitted data */ }
}
```

### 5. Partnership Applications

#### POST `/api/partner`

Submit a partnership application.

**Request Body:**
```json
{
  "businessName": "string",
  "contactName": "string",
  "email": "string",
  "phone": "string",
  "businessType": "hotel|service|other",
  "description": "string"
}
```

**Response:**
```json
{
  "ok": true
}
```

---

## Admin APIs

All admin endpoints require the `x-admin-key` header for authentication.

### 6. Hotel Management

#### GET `/api/admin/hotels`

List hotels with search and filtering capabilities.

**Headers:**
```
x-admin-key: your-admin-api-key
```

**Query Parameters:**
- `q` (optional): Search by name or ID
- `city` (optional): Filter by city
- `limit` (optional): Max results (default: 200, max: 500)

**Response:**
```json
{
  "ok": true,
  "total": 150,
  "results": [
    {
      "id": "transcorp-hilton-abuja-abuja",
      "name": "Transcorp Hilton Abuja",
      "city": "Abuja",
      "stars": 5,
      "type": "Hotel",
      "basePriceNGN": 150000,
      "images": ["url1", "url2"]
    }
  ]
}
```

#### POST `/api/admin/hotels/create`

Create a new hotel in the database.

**Headers:**
```
x-admin-key: your-admin-api-key
```

**Request Body:**
```json
{
  "name": "New Hotel Name",
  "city": "Lagos", // Lagos|Abuja|Port Harcourt|Owerri
  "type": "Hotel", // Hotel|Apartment
  "stars": 4,
  "shelfPriceNGN": 120000,
  "negotiationEnabled": true,
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "sortOrder": 0
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "hotel": {
    "id": "generated-id",
    "slug": "new-hotel-name-lagos",
    "name": "New Hotel Name",
    "city": "Lagos",
    "type": "Hotel",
    "stars": 4,
    "shelfPriceNGN": 120000,
    "negotiationEnabled": true,
    "createdAt": "2025-10-20T12:00:00.000Z"
  }
}
```

#### POST `/api/admin/hotels/update`

Update hotel prices (bulk or individual).

**Headers:**
```
x-admin-key: your-admin-api-key
```

**Request Body:**
```json
{
  "updates": [
    {
      "id": "hotel-id-1",
      "basePriceNGN": 180000
    },
    {
      "id": "hotel-id-2", 
      "basePriceNGN": 95000
    }
  ],
  "apply": false // true to write changes (dev only), false for preview
}
```

**Response:**
```json
{
  "ok": true,
  "invalidPrices": [],
  "missingIds": [],
  "preview": [
    {
      "id": "hotel-id-1",
      "currentPrice": 150000,
      "newPrice": 180000,
      "change": 30000
    }
  ],
  "applied": false
}
```

### 7. Availability Management

#### POST `/api/admin/availability/import`

Import daily room availability via CSV upload.

**Headers:**
```
x-admin-key: your-admin-api-key
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: CSV file with columns: `slug,date,roomsAvailable`

**CSV Format:**
```csv
slug,date,roomsAvailable
transcorp-hilton-abuja-abuja,2025-10-25,15
transcorp-hilton-abuja-abuja,2025-10-26,12
hotel-presidential-port-harcourt-port-harcourt,2025-10-25,20
```

**Response:**
```json
{
  "ok": true,
  "message": "Processed 3 rows",
  "results": {
    "imported": 3,
    "updated": 0,
    "errors": []
  }
}
```

### 8. Metrics Dashboard

#### GET `/api/admin/metrics`

Get comprehensive platform metrics and KPIs.

**Headers:**
```
x-admin-key: your-admin-api-key
```

**Response:**
```json
{
  "ok": true,
  "metrics": {
    "totalHotels": 150,
    "negotiableHotels": 135,
    "negotiablePercentage": 90.0,
    "totalBookings": 1250,
    "totalRevenue": 187500000,
    "avgBookingValue": 150000,
    "topCities": [
      { "city": "Lagos", "count": 60 },
      { "city": "Abuja", "count": 45 },
      { "city": "Port Harcourt", "count": 30 },
      { "city": "Owerri", "count": 15 }
    ],
    "recentBookings": [
      {
        "id": "BK1729425600001",
        "hotel": "Transcorp Hilton Abuja",
        "amount": 127500,
        "date": "10/20/2025"
      }
    ]
  }
}
```

---

## Data Models

### Hotel Object
```typescript
{
  id: string;           // Unique identifier
  slug?: string;        // URL-friendly identifier
  name: string;         // Display name
  city: string;         // Lagos|Abuja|Port Harcourt|Owerri
  type?: string;        // Hotel|Apartment
  stars?: number;       // 1-5 star rating
  basePriceNGN?: number; // Base price per night in Naira
  price?: number;       // Legacy price field
  images?: string[];    // Array of image URLs
}
```

### Negotiation Response
```typescript
{
  status: 'discount' | 'no-offer';
  baseTotal: number;
  discountedTotal: number;
  savings: number;
  discountRate: number; // 0-1 (e.g., 0.15 = 15%)
  expiresAt: string;    // ISO timestamp
  property: {
    id: string;
    name: string;
    city: string;
    originalPrice: number;
    negotiatedPrice: number;
  };
}
```

### Booking Object (Database)
```typescript
{
  id: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  adults: number;
  children: number;
  priceNGN: number;
  priceSource: 'SHELF' | 'DISCOUNT' | 'NEGOTIATED';
  taxNGN: number;
  totalNGN: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
}
```

---

## Authentication

### Admin API Key
Admin endpoints require the `x-admin-key` header:

```bash
curl -H "x-admin-key: your-admin-api-key" \
     https://your-domain.com/api/admin/hotels
```

### Environment Variables
```env
# Server-side admin key
ADMIN_API_KEY="secure-admin-key"

# Client-side admin key (for admin UI)
NEXT_PUBLIC_ADMIN_API_KEY="secure-admin-key"

# Data source selection
DATA_SOURCE="json|db"  # Default: json

# Database connection
DATABASE_URL="postgresql://..."
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "ok": false
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid admin key)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting on:

- Negotiation endpoint: 10 requests/minute per IP
- Booking endpoint: 5 requests/minute per IP
- Admin endpoints: 100 requests/minute per admin key

---

## Examples

### Complete Hotel Search & Booking Flow

1. **Search hotels** (via search page)
2. **Negotiate price:**
```bash
curl -X POST https://your-domain.com/api/negotiate \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "transcorp-hilton-abuja-abuja"}'
```

3. **Book hotel:**
```bash
curl -X POST https://your-domain.com/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "transcorp-hilton-abuja-abuja",
    "rooms": 1,
    "adults": 2,
    "children": 0,
    "checkIn": "2025-10-25",
    "checkOut": "2025-10-27",
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2347123456789"
    }
  }'
```

### Admin Operations

1. **Get metrics:**
```bash
curl -H "x-admin-key: your-key" \
  https://your-domain.com/api/admin/metrics
```

2. **Import availability:**
```bash
curl -X POST https://your-domain.com/api/admin/availability/import \
  -H "x-admin-key: your-key" \
  -F "file=@availability.csv"
```

---

This API documentation covers all current endpoints. For interactive API exploration, consider adding Swagger UI in the future.