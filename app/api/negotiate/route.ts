// app/api/negotiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import HOTELS_RAW from '@/lib/hotels.json';
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

const HOTELS = HOTELS_RAW as Hotel[];

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

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

    // Add 7-second delay to simulate real negotiation
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Special handling for Abuja hotels - no deals available
    if (property.city?.toLowerCase() === 'abuja') {
      return NextResponse.json({
        status: 'no-deals',
        reason: 'deals-exhausted',
        message: 'Hotel deals have been exhausted for today in Abuja. Please try again tomorrow.',
        property: { id: property.id, name: property.name, city: property.city }
      });
    }

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

    // Get discount (default 15% unless overridden)
    const discount = getDiscountFor(propertyId); // 0..1
    if (discount <= 0) {
      return NextResponse.json({ status: 'no-offer', reason: 'no-discount' });
    }

    const discounted = Math.round(base * (1 - discount));

    return NextResponse.json({
      status: 'success',
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
      property: { id: property.id, name: property.name, city: property.city }
    });
  } catch (err) {
    return NextResponse.json({ status: 'no-offer', reason: 'bad-request' }, { status: 400 });
  }
}
