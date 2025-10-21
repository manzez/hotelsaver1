// app/api/negotiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getHotelById } from '@/lib/hotels-source';
import { getDiscountFor } from '@/lib/discounts';

type Hotel = {
  id: string;
  name: string;
  city: string;
  type?: string;
  basePriceNGN?: number;
  price?: number;
  [k: string]: unknown;
};

// HOTELS is imported from @/lib/data

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json(
        { status: 'no-offer', reason: 'invalid-propertyId' },
        { status: 400 }
      );
    }

    const property = await getHotelById(propertyId);
    if (!property) {
      return NextResponse.json(
        { status: 'no-offer', reason: 'not-found' },
        { status: 404 }
      );
    }

    // Add 1-second delay to simulate real negotiation (reduced from 7 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Pull base price (supports both shapes)
    const base =
      typeof property.basePriceNGN === 'number'
        ? property.basePriceNGN
        : typeof property.price === 'number'
        ? property.price
        : 0;

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
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
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
