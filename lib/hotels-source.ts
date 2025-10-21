import { prisma } from '@/lib/prisma'
import { HOTELS } from '@/lib/data'

export type HotelShape = {
  id: string
  slug?: string
  name: string
  city: string
  type?: string
  stars?: number
  basePriceNGN?: number
  price?: number
  images?: string[]
  [k: string]: unknown
}

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

function normalizeFromJson(h: any): HotelShape | null {
  if (!h) return null
  const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : undefined)
  return {
    id: String(h.id || h.slug || ''),
    slug: String(h.slug || h.id || ''),
    name: String(h.name || ''),
    city: String(h.city || ''),
    type: String(h.type || 'Hotel'),
    stars: typeof h.stars === 'number' ? h.stars : undefined,
    basePriceNGN: base,
    price: base,
    images: Array.isArray(h.images) ? h.images : []
  }
}

function normalizeFromDb(h: any, images?: any[]): HotelShape | null {
  if (!h) return null
  const city = h.city || ''
  const imgUrls = Array.isArray(images) ? images.map((x: any) => x.url) : []
  return {
    id: String(h.slug || h.id), // slug is seeded as JSON id for compatibility
    slug: String(h.slug || ''),
    name: String(h.name || ''),
    city: String(city),
    type: String(h.type || 'Hotel'),
    stars: typeof h.stars === 'number' ? h.stars : undefined,
    basePriceNGN: typeof h.shelfPriceNGN === 'number' ? h.shelfPriceNGN : undefined,
    price: typeof h.shelfPriceNGN === 'number' ? h.shelfPriceNGN : undefined,
    images: imgUrls
  }
}

export async function getHotelById(id: string): Promise<HotelShape | null> {
  if (!id) return null

  if (isDbEnabled()) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { slug: id },
        include: { images: { orderBy: { sortOrder: 'asc' } } }
      })
      if (hotel) return normalizeFromDb(hotel, hotel.images)
    } catch (e) {
      // fall through to JSON
    }
  }

  const j = HOTELS.find((h: any) => h.id === id)
  return normalizeFromJson(j)
}

export type ListOptions = {
  city?: string
  limit?: number
  budgetKey?: string
  stayType?: 'any' | 'hotel' | 'apartment'
}

function priceInBudget(base: number, key?: string) {
  if (!base) return false
  if (!key) return true
  if (key === 'u80') return base >= 0 && base < 80000
  if (key === '80_130') return base >= 80000 && base <= 130000
  if (key === '130_200') return base >= 130000 && base <= 200000
  return base >= 200000
}

export async function listHotels(opts: ListOptions = {}): Promise<HotelShape[]> {
  const { city, limit = 60, budgetKey, stayType = 'any' } = opts

  if (isDbEnabled()) {
    try {
      const where: any = {}
      if (city) {
        const c = city.toLowerCase().replace(/\s+/g, '')
        const enumCity = c === 'lagos' ? 'Lagos' : c === 'abuja' ? 'Abuja' : c === 'portharcourt' || c === 'port-harcourt' ? 'PortHarcourt' : c === 'owerri' ? 'Owerri' : undefined
        if (enumCity) where.city = enumCity
      }
      if (stayType && stayType !== 'any') {
        where.type = stayType === 'apartment' ? 'Apartment' : 'Hotel'
      }
      const rows = await prisma.hotel.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: Math.min(limit, 100),
        include: { images: { orderBy: { sortOrder: 'asc' } } }
      })
      const normalized: HotelShape[] = rows
        .map((r: any) => normalizeFromDb(r, (r as any).images))
        .filter(Boolean) as HotelShape[]
      const filtered = normalized.filter(h => priceInBudget(h.basePriceNGN || 0, budgetKey))
      return filtered.slice(0, limit)
    } catch (e) {
      // fall through to JSON
    }
  }

  const filteredJson = (HOTELS as any[])
    .filter(h => !city || String(h.city).toLowerCase() === String(city).toLowerCase())
    .filter(h => {
      if (!stayType || stayType === 'any') return true
      const t = String(h.type || 'Hotel').toLowerCase()
      return stayType === 'apartment' ? t === 'apartment' : t === 'hotel'
    })
    .map(normalizeFromJson)
    .filter(Boolean) as HotelShape[]

  const budgeted = filteredJson.filter(h => priceInBudget(h.basePriceNGN || 0, budgetKey))
  return budgeted.slice(0, limit)
}
