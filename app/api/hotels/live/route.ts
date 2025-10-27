import { NextRequest, NextResponse } from 'next/server';
import { searchHotelsInCity, NIGERIAN_CITIES } from '@/lib/places-api';

/**
 * API endpoint to fetch live hotel data from Google Places API
 * GET /api/hotels/live?city=Owerri&limit=20&minRating=3.0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Owerri';
    const limit = parseInt(searchParams.get('limit') || '20');
    const minRating = parseFloat(searchParams.get('minRating') || '3.0');
    const radius = parseInt(searchParams.get('radius') || '50000');

    // Validate city
    if (!NIGERIAN_CITIES[city as keyof typeof NIGERIAN_CITIES]) {
      return NextResponse.json(
        { 
          error: 'Invalid city', 
          availableCities: Object.keys(NIGERIAN_CITIES)
        }, 
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API not configured' }, 
        { status: 500 }
      );
    }

    console.log(`Fetching live hotels for ${city}...`);
    
    // Fetch hotels from Places API
    const hotels = await searchHotelsInCity({
      city,
      radius,
      minRating,
      maxResults: limit
    });

    // Add cache headers for performance
    const response = NextResponse.json({
      success: true,
      city,
      count: hotels.length,
      hotels,
      lastUpdated: new Date().toISOString(),
      source: 'google_places_api'
    });

    // Cache for 1 hour to avoid excessive API calls
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    
    return response;

  } catch (error) {
    console.error('Error fetching live hotels:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch live hotel data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to refresh cached hotel data
 * POST /api/hotels/live - Refresh all cities
 * POST /api/hotels/live { "city": "Owerri" } - Refresh specific city
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetCity = body.city;

    const citiesToRefresh = targetCity 
      ? [targetCity]
      : Object.keys(NIGERIAN_CITIES);

    const results = [];

    for (const city of citiesToRefresh) {
      console.log(`Refreshing hotel data for ${city}...`);
      
      const hotels = await searchHotelsInCity({
        city,
        maxResults: 25,
        minRating: 2.5
      });

      results.push({
        city,
        count: hotels.length,
        hotels: hotels.map(h => ({
          name: h.name,
          rating: h.rating,
          estimatedPriceNGN: h.estimatedPriceNGN
        }))
      });

      // Rate limiting between cities
      if (citiesToRefresh.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return NextResponse.json({
      success: true,
      refreshed: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing hotel data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh hotel data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}