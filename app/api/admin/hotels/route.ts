// app/api/admin/hotels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listHotels } from '@/lib/hotels-source'
import { HOTELS } from '@/lib/data'

function authorize(req: NextRequest): NextResponse | null {
  const key = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  if (!expected || key !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

export async function GET(req: NextRequest) {
  const auth = authorize(req)
  if (auth) return auth

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').toLowerCase()
  const city = searchParams.get('city') || ''
  const limit = Math.min(500, Math.max(1, Number(searchParams.get('limit') || '200')))

  if (isDbEnabled()) {
    try {
      // Use DB-backed source when enabled
      const hotels = await listHotels({ city, limit })
      
      // Apply search query filter
      const filtered = hotels.filter(h => {
        const name = String(h.name || '').toLowerCase()
        const id = String(h.id || '').toLowerCase()
        return !q || name.includes(q) || id.includes(q)
      })

      const results = filtered.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        stars: h.stars || 4,
        type: h.type || 'Hotel',
        basePriceNGN: h.basePriceNGN || h.price || 0,
        images: h.images || [],
      }))

      return NextResponse.json({ ok: true, total: results.length, results })
    } catch (error) {
      // Fall back to JSON on DB error
      console.error('Admin hotels DB error, falling back to JSON:', error)
    }
  }

  // JSON fallback (original logic)
  const list = HOTELS.filter((h: any) => {
    const name = String(h.name || '').toLowerCase()
    const id = String(h.id || '').toLowerCase()
    const matchesQ = !q || name.includes(q) || id.includes(q)
    const matchesCity = !city || String(h.city || '') === city
    return matchesQ && matchesCity
  })
    .slice(0, limit)
    .map((h: any) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      stars: h.stars,
      type: h.type,
      basePriceNGN: typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0),
      images: Array.isArray(h.images) ? h.images : [],
    }))

  return NextResponse.json({ ok: true, total: list.length, results: list })
}
