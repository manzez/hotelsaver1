// app/api/negotiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { allowIp } from '@/lib/rate-limit'
import { signNegotiationOffer } from '@/lib/negotiation'
import { promises as fs } from 'fs'
import path from 'path'

type Hotel = {
  id: string;
  name: string;
  city: string;
  type?: string;
  basePriceNGN?: number;
  price?: number;
  [k: string]: unknown;
};

// Function to get fresh hotel data from the file system
async function getHotelData() {
  try {
    const filePath = path.join(process.cwd(), 'lib.hotels.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to read hotel data:', error)
    // Fallback to static import if file read fails
    const { HOTELS } = await import('@/lib/data')
    return HOTELS
  }
}

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

    // Get hotel data using optimized loading (temporary - until database is set up)
    const { getHotelByIdOptimized } = await import('@/lib/hotel-data-optimized');
    let property = await getHotelByIdOptimized(propertyId);
    
    console.log(`🔍 Looking for property: ${propertyId}`);
    console.log(`🔍 Property found:`, property ? 'YES' : 'NO');
    
    if (!property) {
      return NextResponse.json(
        { status: 'no-offer', reason: 'not-found' },
        { status: 404 }
      );
    }

  // Add 1-second delay to simulate real negotiation (reduced from 7 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Pull base price (supports both shapes, with room-specific pricing)
    let base = 0;
    
    // First check roomTypes array for pricing
    if (property.roomTypes && Array.isArray(property.roomTypes) && property.roomTypes.length > 0) {
      const prices = property.roomTypes
        .map((rt: any) => rt.pricePerNight || 0)
        .filter((p: number) => p > 0);
      if (prices.length > 0) {
        base = Math.min(...prices); // Use lowest room price
        console.log(`✅ Using lowest room price: ₦${base.toLocaleString()}`);
      }
    }
    
    // Fallback to old pricing structure if roomTypes not available
    if (base <= 0) {
      base = typeof property.basePriceNGN === 'number'
        ? property.basePriceNGN
        : typeof property.price === 'number'
        ? property.price
        : 0;
    }

    // If roomId is provided, try to get room-specific pricing from hotel data
    let selectedRoom = null;
    if (roomId && typeof roomId === 'string' && property.roomTypes && Array.isArray(property.roomTypes)) {
      selectedRoom = property.roomTypes.find((room: any) => room.id === roomId);
      if (selectedRoom && typeof (selectedRoom.pricePerNight || selectedRoom.basePriceNGN) === 'number') {
        base = selectedRoom.pricePerNight || selectedRoom.basePriceNGN;
        console.log(`✅ Using room-specific pricing for ${roomId}: ₦${base.toLocaleString()}`);
      }
    }

    if (base <= 0) {
      return NextResponse.json({ status: 'no-offer', reason: 'no-base-price' });
    }

    // Optional city-based restrictions (e.g., Abuja deals exhausted)
    try {
      const restrictAbuja = String(process.env.DEALS_ABUJA_DISABLED || '').toLowerCase() === 'true'
      const cityName = String(property.city || '').toLowerCase()
      if (restrictAbuja && cityName === 'abuja') {
        return NextResponse.json({
          status: 'no-deals',
          message: 'Deals exhausted for Abuja today. Please check back tomorrow or explore other cities.',
          property: { id: property.id, name: property.name, city: property.city }
        }, { status: 200 })
      }
    } catch {}

    // Get discount (0 means no negotiate option available)
    // Use room-specific discount if available, otherwise use hotel discount
    let discount = 0;
    if (selectedRoom && typeof selectedRoom.discountPercent === 'number') {
      discount = selectedRoom.discountPercent / 100; // Convert percentage to decimal
      console.log(`✅ Using room-specific discount for ${roomId}: ${selectedRoom.discountPercent}%`);
    } else {
      const { getDiscountForAsync } = await import('@/lib/discounts-server');
      discount = await getDiscountForAsync(propertyId); // 0..1
      console.log(`🔍 DEBUG: propertyId = "${propertyId}"`);
      console.log(`🔍 DEBUG: discount returned = ${discount}`);
      console.log(`🔍 DEBUG: discount as percentage = ${Math.round(discount * 100)}%`);
      console.log(`✅ Using JSON discount for ${propertyId}: ${Math.round(discount * 100)}%`);
    }
    
    console.log(`🔍 FINAL CHECK: discount value = ${discount}, is it <= 0? ${discount <= 0}`);
    
    if (discount <= 0) {
      console.log(`❌ REJECTING: Discount is ${discount}, returning no-offer`);
      return NextResponse.json({ 
        status: 'no-offer', 
        reason: 'no-discount',
        message: 'This hotel has fixed pricing with no negotiation available.',
    property: { id: property.id, name: property.name, city: property.city }
      }, { status: 404 });
    }

    const discounted = Math.round(base * (1 - discount));
    const expiresAtMs = Date.now() + 5 * 60 * 1000

    // Signed negotiation token (HMAC) with expiry and pricing details
    const negotiationToken = signNegotiationOffer({
      propertyId,
      baseTotal: base,
      discountedTotal: discounted,
      discountRate: discount,
      expiresAt: expiresAtMs,
    })

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
