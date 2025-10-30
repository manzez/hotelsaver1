export const dynamic = 'force-dynamic'
// app/api/debug-negotiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HOTELS } from '@/lib/data';
import { getDiscountFor } from '@/lib/discounts';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId') || 'protea-hotel-owerri-owerri';
    
    console.log('Debug negotiate API called with propertyId:', propertyId);
    
    // Check if HOTELS is loaded
    const hotelsCount = HOTELS ? HOTELS.length : 0;
    console.log('HOTELS loaded:', hotelsCount, 'hotels');
    
    // Find the property
    const property = HOTELS.find((h: any) => h.id === propertyId);
    console.log('Property found:', property ? 'YES' : 'NO');
    
    if (!property) {
      return NextResponse.json({
        debug: true,
        error: 'Property not found',
        propertyId,
        hotelsCount,
        firstFewHotels: HOTELS.slice(0, 3).map(h => ({ id: h.id, name: h.name }))
      });
    }
    
    // Check base price
    const base = typeof property.basePriceNGN === 'number'
      ? property.basePriceNGN
      : typeof property.price === 'number'
      ? property.price
      : 0;
    
    console.log('Base price:', base);
    
    // Check discount
    const discount = getDiscountFor(propertyId);
    console.log('Discount rate:', discount);
    
    return NextResponse.json({
      debug: true,
      propertyId,
      hotelsCount,
      property: {
        id: property.id,
        name: property.name,
        basePriceNGN: property.basePriceNGN,
        price: property.price
      },
      basePrice: base,
      discountRate: discount,
      shouldWork: discount > 0 && base > 0,
      calculation: discount > 0 && base > 0 ? {
        original: base,
        discounted: Math.round(base * (1 - discount)),
        savings: base - Math.round(base * (1 - discount))
      } : null
    });
  } catch (error) {
    console.error('Debug negotiate error:', error);
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}