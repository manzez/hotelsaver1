# Real-Time Hotel Room Availability System

## Overview

This document outlines the comprehensive real-time room availability system implemented for HotelSaver.ng. The system provides multiple approaches to handle real-time availability data, from simple database queries to advanced caching and real-time updates.

## Architecture Components

### 1. Database Schema
```sql
-- Availability table (already exists in Prisma schema)
model Availability {
  id             String   @id @default(cuid())
  hotelId        String
  date           DateTime // date-only (treat time as 00:00)
  roomsAvailable Int

  hotel          Hotel    @relation(fields: [hotelId], references: [id], onDelete: Cascade)

  @@unique([hotelId, date])
}

-- Enhanced Hotel table with totalRooms field
model Hotel {
  -- existing fields...
  totalRooms     Int?     // total rooms for availability calculations
  availability   Availability[]
}
```

### 2. API Endpoints

#### Single Hotel Availability Check
```
GET /api/hotels/availability/check?hotelId={id}&checkIn={date}&checkOut={date}&rooms={number}
```

**Response:**
```json
{
  "hotelId": "hotel-123",
  "checkIn": "2025-11-05",
  "checkOut": "2025-11-07", 
  "roomsRequested": 1,
  "nightsRequired": 2,
  "isAvailable": true,
  "minRoomsAvailable": 25,
  "hasCompleteData": true,
  "availability": [
    {
      "date": "2025-11-05",
      "roomsAvailable": 30,
      "canAccommodate": true
    },
    {
      "date": "2025-11-06", 
      "roomsAvailable": 25,
      "canAccommodate": true
    }
  ]
}
```

#### Bulk Availability Check
```
POST /api/hotels/availability/bulk
Content-Type: application/json

{
  "hotelIds": ["hotel-1", "hotel-2", "hotel-3"],
  "checkIn": "2025-11-05",
  "checkOut": "2025-11-07",
  "rooms": 2
}
```

#### Admin Management
```
GET /api/admin/availability?hotelId={id}&startDate={date}&endDate={date}
POST /api/admin/availability
POST /api/admin/availability/bulk
```

### 3. Availability Service Layer

**File:** `lib/availability-service.ts`

The `AvailabilityService` class provides:
- **Caching**: 5-minute TTL cache for performance
- **Bulk operations**: Efficient multi-hotel queries
- **Real-time updates**: Booking simulation and availability updates
- **Analytics**: Availability trends and occupancy rates

```typescript
import { availabilityService } from '@/lib/availability-service'

// Single hotel check
const availability = await availabilityService.checkAvailability({
  hotelId: 'hotel-123',
  checkIn: '2025-11-05',
  checkOut: '2025-11-07',
  rooms: 2
})

// Bulk check
const bulkAvailability = await availabilityService.checkBulkAvailability({
  hotelIds: ['hotel-1', 'hotel-2'],
  checkIn: '2025-11-05', 
  checkOut: '2025-11-07',
  rooms: 2
})

// Update availability (real-time)
await availabilityService.updateAvailability('hotel-123', '2025-11-05', 25)

// Process booking (reduce availability)
await availabilityService.processBooking('hotel-123', '2025-11-05', '2025-11-07', 2)
```

### 4. React Hooks for Frontend

**File:** `hooks/useAvailability.ts`

Provides React hooks for easy integration:

```typescript
import { useAvailability, useBulkAvailability, formatAvailabilityStatus } from '@/hooks/useAvailability'

// Single hotel availability
const { availability, loading, error, refresh } = useAvailability({
  hotelId: 'hotel-123',
  checkIn: '2025-11-05',
  checkOut: '2025-11-07',
  rooms: 2
})

// Multiple hotels
const { availability: bulkAvailability } = useBulkAvailability(
  ['hotel-1', 'hotel-2'],
  '2025-11-05',
  '2025-11-07',
  2
)

// Format for display
const status = formatAvailabilityStatus(availability)
// Returns: { status: 'available', message: '25 rooms available', color: 'green' }
```

### 5. UI Components

**File:** `components/AvailabilityStatus.tsx`

Drop-in availability status component:

```tsx
<AvailabilityStatus
  hotelId="hotel-123"
  checkIn="2025-11-05"
  checkOut="2025-11-07"
  rooms={2}
  showDetails={true}
  refreshInterval={30000}
/>
```

## Integration with Search Results

The system is already integrated into search results in `app/search/page.tsx`:

```tsx
{checkIn && checkOut && (
  <AvailabilityStatus
    hotelId={h.id}
    checkIn={checkIn}
    checkOut={checkOut}
    rooms={Number(params.get('rooms')) || 1}
    className="text-xs"
    showDetails={false}
  />
)}
```

## Data Population

### 1. Database Migration
First, update the hotel schema to include `totalRooms`:

```bash
npx prisma migrate dev --name add-total-rooms-to-hotels
npx prisma generate
```

### 2. Seed Availability Data
```bash
npx tsx scripts/seed-availability.ts
```

This generates realistic availability data for the next 90 days with patterns for:
- Weekend reduced availability (30% less)
- Holiday periods (60% less) 
- City-based base room counts
- Random variation (±20%)

### 3. CSV Import
Upload CSV files via admin interface:
```csv
slug,date,roomsAvailable
hotel-lagos,2025-11-05,25
hotel-lagos,2025-11-06,23
hotel-abuja,2025-11-05,30
```

## Performance Optimization

### 1. Caching Strategy
- **Application-level cache**: 5-minute TTL for frequently accessed data
- **Database indexing**: Composite index on `(hotelId, date)`
- **Bulk operations**: Single query for multiple hotels

### 2. Real-Time Updates
- **Polling**: 30-second intervals for active users
- **WebSocket ready**: Architecture supports WebSocket integration
- **Cache invalidation**: Smart invalidation on availability changes

### 3. Monitoring
```typescript
// Get cache statistics
const stats = availabilityService.getCacheStats()
console.log(`Cache size: ${stats.size}, Keys: ${stats.keys.length}`)

// Get availability trends
const trends = await availabilityService.getAvailabilityTrends('hotel-123', 30)
```

## Deployment Considerations

### 1. Database Scaling
- Consider read replicas for high-traffic scenarios
- Partition availability data by date ranges if needed
- Regular cleanup of old availability records

### 2. Caching
- Redis integration for distributed caching
- CDN caching for static availability data
- Cache warming for popular hotels/dates

### 3. Real-Time Features
- **WebSocket server** for instant updates
- **Pusher/Socket.io** integration
- **Server-Sent Events** for one-way updates

## Usage Examples

### Basic Integration
```typescript
// Check availability before showing booking button
const { availability, loading } = useAvailability({
  hotelId: selectedHotel.id,
  checkIn: searchParams.checkIn,
  checkOut: searchParams.checkOut,
  rooms: searchParams.rooms
})

if (loading) return <Spinner />
if (!availability?.isAvailable) return <UnavailableMessage />

return <BookingButton hotel={selectedHotel} />
```

### Search Results Enhancement
```typescript
// Filter search results by availability
const availableHotels = hotels.filter(hotel => {
  const availability = bulkAvailability[hotel.id]
  return availability?.isAvailable
})
```

### Admin Management
```typescript
// Update availability after booking
const handleBookingConfirmed = async (booking) => {
  await availabilityService.processBooking(
    booking.hotelId,
    booking.checkIn,
    booking.checkOut,
    booking.rooms
  )
  
  // Notify other users (WebSocket/Pusher)
  notifyAvailabilityChange(booking.hotelId)
}
```

## Testing

### 1. Unit Tests
```javascript
// Test availability service
describe('AvailabilityService', () => {
  test('should check single hotel availability', async () => {
    const result = await availabilityService.checkAvailability({
      hotelId: 'test-hotel',
      checkIn: '2025-11-05',
      checkOut: '2025-11-07', 
      rooms: 2
    })
    
    expect(result.isAvailable).toBeDefined()
    expect(result.dailyAvailability).toHaveLength(2)
  })
})
```

### 2. Integration Tests
```javascript
// Test API endpoints
describe('/api/hotels/availability', () => {
  test('GET /check returns availability data', async () => {
    const response = await fetch('/api/hotels/availability/check?hotelId=test&checkIn=2025-11-05&checkOut=2025-11-07&rooms=1')
    const data = await response.json()
    
    expect(data.isAvailable).toBeDefined()
    expect(data.availability).toBeInstanceOf(Array)
  })
})
```

## Future Enhancements

### 1. Advanced Features
- **Dynamic pricing**: Adjust prices based on availability
- **Overbooking management**: Handle oversold scenarios
- **Waitlist system**: Queue bookings when no availability
- **Predictive availability**: ML-based availability forecasting

### 2. Integration Options
- **PMS systems**: Direct integration with hotel management systems
- **Channel managers**: Real-time sync with booking platforms
- **Revenue management**: Integration with pricing optimization tools

### 3. Analytics
- **Occupancy insights**: Track booking patterns
- **Revenue optimization**: Availability-based pricing suggestions
- **Demand forecasting**: Predict future availability needs

## Conclusion

This real-time availability system provides a solid foundation for managing hotel room availability with multiple approaches:

1. **Simple**: Basic database queries for small-scale operations
2. **Cached**: Application-level caching for improved performance  
3. **Real-time**: Live updates and WebSocket-ready architecture
4. **Scalable**: Bulk operations and efficient database design

The system is designed to grow with your needs, from a simple availability check to a full-featured real-time booking platform.