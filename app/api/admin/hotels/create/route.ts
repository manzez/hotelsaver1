// app/api/admin/hotels/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function authorize(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  if (!expected || key !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

type Payload = {
  slug: string
  name: string
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Owerri'
  type: 'Hotel' | 'Apartment'
  stars: number
  shelfPriceNGN: number
  discountPriceNGN?: number | null
  discountRatePct?: number | null
  negotiationEnabled?: boolean
  negotiationMinPct?: number | null
  negotiationMaxPct?: number | null
  images?: string[]
}

export async function POST(req: NextRequest) {
  const auth = authorize(req)
  if (auth) return auth

  try {
    const body: Payload = await req.json()
    const {
      slug, name, city, type, stars,
      shelfPriceNGN,
      discountPriceNGN = null,
      discountRatePct = null,
      negotiationEnabled = true,
      negotiationMinPct = null,
      negotiationMaxPct = null,
      images = [],
    } = body || ({} as any)

    // Basic validation
    if (!slug || !name || !city || !type || !Number.isFinite(stars) || !Number.isFinite(shelfPriceNGN)) {
      return NextResponse.json({ ok: false, error: 'invalid-payload' }, { status: 400 })
    }

    const cityMap: Record<string, 'Lagos'|'Abuja'|'Port Harcourt'|'Owerri'> = {
      Lagos: 'Lagos', Abuja: 'Abuja', 'Port Harcourt': 'Port Harcourt', Owerri: 'Owerri'
    }
    if (!cityMap[city]) {
      return NextResponse.json({ ok: false, error: 'invalid-city' }, { status: 400 })
    }

    const created = await prisma.hotel.create({
      data: {
        slug,
        name,
        city: city === 'Port Harcourt' ? 'PortHarcourt' : (city as any),
        type: type as any,
        stars: Math.max(1, Math.min(5, Math.round(stars))),
        shelfPriceNGN: Math.round(shelfPriceNGN),
        discountPriceNGN: discountPriceNGN != null ? Math.round(discountPriceNGN) : null,
        discountRatePct: discountRatePct != null ? Math.max(0, Math.min(100, Math.round(discountRatePct))) : null,
        negotiationEnabled: Boolean(negotiationEnabled),
        negotiationMinPct: negotiationMinPct != null ? Math.max(0, Math.min(100, Math.round(negotiationMinPct))) : null,
        negotiationMaxPct: negotiationMaxPct != null ? Math.max(0, Math.min(100, Math.round(negotiationMaxPct))) : null,
        images: { createMany: { data: images.slice(0, 15).map((url, i) => ({ url, sortOrder: i })) } },
      },
      include: { images: true },
    })

    return NextResponse.json({ ok: true, hotel: created })
  } catch (e) {
    console.error('Create hotel error:', e)
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
