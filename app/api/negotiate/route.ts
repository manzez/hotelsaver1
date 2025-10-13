import { NextRequest, NextResponse } from 'next/server'
import HOTELS_RAW from '@/lib/hotels.json'

// Optional: a tiny type, or use your shared type if you have it.
type Hotel = {
  id: string
  name: string
  city: string
  type: 'Hotel' | 'Apartment'
  basePriceNGN: number
}

const HOTELS = HOTELS_RAW as Hotel[]

// Default 15% with optional per-hotel overrides
const OVERRIDES: Record<string, number> = {
  // 'eko-hotels-lagos': 0.18,
  // 'protea-owerri': 0.12
}
const DEFAULT_RATE = 0.15
const getRate = (id: string) => (OVERRIDES[id] ?? DEFAULT_RATE)

export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json()
    if (!propertyId || typeof propertyId !== 'string') {
      return NextResponse.json({ status: 'no-offer', reason: 'invalid-propertyId' }, { status: 400 })
    }

    const property = HOTELS.find(h => h.id === propertyId)
    if (!property) {
      return NextResponse.json({ status: 'no-offer', reason: 'property-not-found' }, { status: 404 })
    }

    const rate = getRate(propertyId)
    if (!(rate > 0)) {
      return NextResponse.json({ status: 'no-offer', reason: 'discount-disabled' })
    }

    const baseTotal = property.basePriceNGN
    const discountedTotal = Math.max(0, Math.round(baseTotal * (1 - rate)))

    return NextResponse.json({
      status: 'discount',
      baseTotal,
      discountedTotal,
      savings: baseTotal - discountedTotal,
      discountRate: rate,
      property: { id: property.id, name: property.name, city: property.city }
    })
  } catch {
    return NextResponse.json({ status: 'no-offer', reason: 'bad-request' }, { status: 400 })
  }
}
