# Google Places API Setup Guide for HotelSaver.ng

## Overview
This guide explains how to integrate Google Places API to fetch real hotel data for Nigerian cities, particularly Owerri, with live pricing estimates.

## Prerequisites
- Google Cloud Console account
- Billing enabled on your Google Cloud project
- HotelSaver.ng project running locally or deployed

## Step 1: Get Google Places API Key

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "HotelSaver Places API"

### 1.2 Enable Places API
1. Navigate to **APIs & Services > Library**
2. Search for "Places API"
3. Enable **Places API (New)**
4. Also enable **Maps JavaScript API** for photo access

### 1.3 Create API Key
1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the generated API key
4. Click **Restrict Key** for security

### 1.4 Configure API Key Restrictions
**Application restrictions:**
- Choose "HTTP referrers (web sites)"
- Add your domains:
  ```
  http://localhost:3000/*
  http://localhost:3001/*
  https://hotelsaver1.vercel.app/*
  https://your-custom-domain.com/*
  ```

**API restrictions:**
- Restrict key to these APIs:
  - Places API (New)
  - Maps JavaScript API
  - Geocoding API (optional)

## Step 2: Configure Environment Variables

### 2.1 Update .env.local
Add your API key to the environment file:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=AIzaSyBvOkBvO0XK9F4XcCKpBpOXpgX9UYw7B9w

# Enable live hotel data fetching
ENABLE_LIVE_HOTEL_DATA=true

# Rate limiting for Places API calls
PLACES_API_RATE_LIMIT=10

# Cache duration for Places API data (1 hour)
PLACES_CACHE_DURATION=3600000

# Default city for hotel searches
DEFAULT_CITY=Owerri
```

### 2.2 Vercel Deployment Environment Variables
For production deployment, add these variables in Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `GOOGLE_PLACES_API_KEY`: Your actual API key
   - `ENABLE_LIVE_HOTEL_DATA`: `true`
   - `DEFAULT_CITY`: `Owerri`

## Step 3: Test the Integration

### 3.1 Local Testing
```bash
# Start development server
npm run dev

# Test the hybrid hotel system
curl "http://localhost:3001/api/test/hotels?city=Owerri"

# Test live hotel data fetching
curl "http://localhost:3001/api/hotels/live?city=Owerri&limit=5"
```

### 3.2 Expected Response
You should see a response like:
```json
{
  "success": true,
  "city": "Owerri",
  "count": 8,
  "hotels": [
    {
      "placeId": "ChIJXxXxXxXxXxXxXxXxXx",
      "name": "Concorde Hotel Owerri",
      "address": "Plot 1, World Bank Housing Estate, Owerri",
      "rating": 4.2,
      "estimatedPriceNGN": 45000,
      "stars": 4,
      "source": "places_api"
    }
  ]
}
```

## Step 4: Understanding the System

### 4.1 Hybrid Data Flow
The system uses a hybrid approach:

1. **Primary**: Google Places API for live data
2. **Fallback**: Static JSON data if API fails
3. **Caching**: 1-hour cache to reduce API calls

### 4.2 Pricing Algorithm
Hotel prices are estimated using:

- **Google Price Level** (0-4): Maps to NGN price ranges
- **City Multiplier**: Owerri = 0.9x, Lagos = 1.4x
- **Rating Bonus**: Higher ratings = premium pricing
- **Market Randomization**: ±15% for variety

### 4.3 City Coverage
Supported Nigerian cities:
- **Owerri**: Primary focus, full Places API integration
- **Lagos**: Full integration with premium pricing
- **Abuja**: Government hub pricing model
- **Port Harcourt**: Oil industry market pricing

## Step 5: API Endpoints

### 5.1 Live Hotel Data
```
GET /api/hotels/live?city=Owerri&limit=20&minRating=3.0
```

Parameters:
- `city`: Nigerian city name
- `limit`: Max results (default: 20)
- `minRating`: Minimum Google rating (default: 3.0)
- `radius`: Search radius in meters (default: 50000)

### 5.2 Test & Debug
```
GET /api/test/hotels?city=Owerri&action=cache-stats
POST /api/test/hotels {"action": "test-owerri"}
```

### 5.3 Clear Cache
```
POST /api/test/hotels {"action": "clear-cache"}
```

## Step 6: Cost Management

### 6.1 Places API Pricing
- **Nearby Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests
- **Photos**: $7 per 1,000 requests

### 6.2 Cost Optimization
Our system includes:
- **Caching**: Reduces API calls by 90%
- **Rate Limiting**: Prevents quota exhaustion
- **Smart Fallbacks**: Uses static data when needed
- **Batch Processing**: Groups related requests

### 6.3 Monthly Cost Estimate
For Owerri hotel data:
- ~50 unique hotels
- ~100 detail requests/day
- ~30 photo requests/day
- **Estimated cost**: $15-25/month

## Step 7: Monitoring & Maintenance

### 7.1 Monitor API Usage
1. Check Google Cloud Console quotas daily
2. Monitor cache hit rates via test endpoint
3. Watch for API errors in application logs

### 7.2 Data Quality
- Review fetched hotel data weekly
- Update pricing algorithms based on market feedback
- Add new cities as business expands

### 7.3 Troubleshooting

**Common Issues:**

1. **"API key not configured"**
   - Check .env.local file
   - Verify environment variable name
   - Restart development server

2. **"Places API search failed"**
   - Verify API key restrictions
   - Check billing account status
   - Review quota limits

3. **"No hotels found"**
   - Verify city name spelling
   - Check radius parameter
   - Review minimum rating threshold

## Step 8: Advanced Features

### 8.1 Real-time Availability
The system can be extended to check hotel availability:
- Partner with booking platforms (Booking.com API)
- Integrate with hotel direct booking systems
- Add calendar-based availability checking

### 8.2 Dynamic Pricing
Future enhancements:
- Seasonal pricing adjustments
- Event-based price increases
- Competitor price tracking
- Demand-based surge pricing

### 8.3 Reviews Integration
Add review data from:
- Google Reviews (included in Places API)
- TripAdvisor integration
- Local review platforms
- Social media sentiment

## Security Best Practices

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables only
   - Restrict API key to specific domains
   - Regenerate keys periodically

2. **Rate Limiting**:
   - Implement server-side rate limiting
   - Cache aggressively to reduce calls
   - Use background jobs for bulk updates

3. **Data Validation**:
   - Validate all Places API responses
   - Sanitize hotel names and addresses
   - Filter inappropriate content

## Conclusion

This integration provides real hotel data for Owerri and other Nigerian cities while maintaining cost efficiency through smart caching and fallback mechanisms. The hybrid approach ensures your application remains functional even if the Places API is temporarily unavailable.

For support or questions, check the API test endpoints or review the application logs for detailed error information.