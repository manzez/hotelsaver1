import { NextRequest, NextResponse } from 'next/server';
import { getCityPricingStats, getCacheStats, clearPlacesCache } from '@/lib/hybrid-hotels';

/**
 * API endpoint for testing and managing the hybrid hotel system
 * GET /api/test/hotels - Get system status and stats
 * POST /api/test/hotels - Clear cache or run tests
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Owerri';
    const action = searchParams.get('action');

    if (action === 'cache-stats') {
      const stats = getCacheStats();
      return NextResponse.json({
        success: true,
        cacheStats: stats,
        timestamp: new Date().toISOString()
      });
    }

    // Get pricing stats for a city
    const pricingStats = await getCityPricingStats(city);
    const cacheStats = getCacheStats();

    return NextResponse.json({
      success: true,
      system: {
        liveDateEnabled: process.env.ENABLE_LIVE_HOTEL_DATA === 'true',
        placesApiConfigured: !!process.env.GOOGLE_PLACES_API_KEY,
        defaultCity: process.env.DEFAULT_CITY || 'Owerri'
      },
      city: {
        name: city,
        ...pricingStats
      },
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'test';

    if (action === 'clear-cache') {
      clearPlacesCache();
      return NextResponse.json({
        success: true,
        message: 'Places API cache cleared',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'test-owerri') {
      // Test fetching Owerri hotels
      const { getHotelsForCity } = await import('@/lib/hybrid-hotels');
      const hotels = await getHotelsForCity('Owerri', { 
        useLiveData: true, 
        limit: 5 
      });

      return NextResponse.json({
        success: true,
        test: 'owerri-hotels',
        results: {
          count: hotels.length,
          sampleHotels: hotels.slice(0, 3).map(h => ({
            name: h.name,
            source: h.source,
            price: h.basePriceNGN,
            rating: h.rating,
            address: h.address
          }))
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Unknown action', availableActions: ['clear-cache', 'test-owerri'] },
      { status: 400 }
    );

  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}