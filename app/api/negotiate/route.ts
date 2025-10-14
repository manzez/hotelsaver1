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
      status: 'discount',
      baseTotal: base,
      discountedTotal: discounted,
      savings: base - discounted,
      discountRate: discount,
      // Optional: give client a server-side expiry (also keep your client countdown)
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      property: { id: property.id, name: property.name, city: property.city }
    });
  } catch (err) {
    return NextResponse.json({ status: 'no-offer', reason: 'bad-request' }, { status: 400 });
  }
}
