// app/api/negotiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HOTELS } from '@/lib/data';
import { getDiscountFor } from '@/lib/discounts';
import { allowIp } from '@/lib/rate-limit'

type Hotel = {
  id: string;
  name: string;
  city: string;
  type?: string;
  basePriceNGN?: number;
  price?: number;
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    // Lightweight IP-based rate limiting (5/min per IP for production safety)
    const ip = (req.ip || req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    const rl = allowIp(ip, { capacity: 5, refillPerSec: 0.083 }) // ~5/min
    if (!rl.allowed) {
      return NextResponse.json(
        { status: 'no-offer', reason: 'rate-limited' },
        { status: 429, headers: { 'Retry-After': '10' } }
      )
    }

    const { propertyId, roomId } = await req.json();

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json(
        { status: 'no-offer', reason: 'invalid-propertyId' },
        { status: 400 }
      );
    }

    // Try to find property in static data first
    let property = HOTELS.find((h: any) => h.id === propertyId);
    
    // If not found and it's a Places API ID, try hybrid system
    if (!property && propertyId.startsWith('places_')) {
      try {
        const { getHotelById } = await import('@/lib/hybrid-hotels');
        const hybridHotel = await getHotelById(propertyId, 'Owerri'); // Default city
        if (hybridHotel) {
          property = {
            id: hybridHotel.id,
            name: hybridHotel.name,
            city: hybridHotel.city,
            type: hybridHotel.type,
            basePriceNGN: hybridHotel.basePriceNGN,
            price: hybridHotel.basePriceNGN
          };
        }
      } catch (error) {
        console.error('Error fetching Places API hotel for negotiation:', error);
      }
    }
    
    if (!property) {
      return NextResponse.json(
        { status: 'no-offer', reason: 'not-found' },
        { status: 404 }
      );
    }

    // Add 1-second delay to simulate real negotiation (reduced from 7 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Pull base price (supports both shapes, with room-specific pricing)
    let base =
      typeof property.basePriceNGN === 'number'
        ? property.basePriceNGN
        : typeof property.price === 'number'
        ? property.price
        : 0;

    // If roomId is provided, try to get room-specific pricing
    if (roomId && typeof roomId === 'string') {
      try {
        const roomResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3001'}/api/hotels/${propertyId}/rooms`);
        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          const selectedRoom = roomData.roomTypes?.find((room: any) => room.id === roomId);
          if (selectedRoom && typeof selectedRoom.basePriceNGN === 'number') {
            base = selectedRoom.basePriceNGN;
          }
        }
      } catch (error) {
        // Fallback to hotel base price if room pricing fails
        console.warn('Failed to fetch room pricing, using hotel base price:', error);
      }
    }

    if (base <= 0) {
      return NextResponse.json({ status: 'no-offer', reason: 'no-base-price' });
    }

    // Get discount (0 means no negotiate option available)
    const discount = getDiscountFor(propertyId); // 0..1
    if (discount <= 0) {
      return NextResponse.json({ 
        status: 'no-offer', 
        reason: 'no-discount',
        message: 'This hotel has fixed pricing with no negotiation available.',
    property: { id: property.id, name: property.name, city: property.city }
      }, { status: 404 });
    }

    const discounted = Math.round(base * (1 - discount));
    const expiresAtMs = Date.now() + 5 * 60 * 1000
    
    // Simple negotiation token for now (avoiding signing issues in production)
    const negotiationToken = `neg_${propertyId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      status: 'discount', // Changed from 'success' to match test expectations
      baseTotal: base,
      discountedTotal: discounted,
      savings: base - discounted,
      discountRate: discount,
      extras: {
        carWash: true,
        complimentaryGifts: true
      },
      message: `Great news! We negotiated ${Math.round(discount * 100)}% off + FREE car wash + complimentary gifts!`,
      expiresAt: new Date(expiresAtMs).toISOString(),
      negotiationToken,
      property: { 
        id: property.id, 
        name: property.name, 
        city: property.city,
        originalPrice: base,
        negotiatedPrice: discounted
      }
    });
  } catch (err) {
    return NextResponse.json({ status: 'no-offer', reason: 'bad-request' }, { status: 400 });
  }
}
