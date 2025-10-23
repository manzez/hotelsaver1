import { prisma } from '@/lib/prisma'
import { SERVICES } from '@/lib/data'

export type ServiceShape = {
  id: string
  title: string
  city: string
  category: string
  provider?: string
  description?: string
  amountNGN?: number
  rating?: number
  images?: string[]
  [k: string]: unknown
}

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

function normalizeFromJson(s: any): ServiceShape | null {
  if (!s) return null
  const amount = Array.isArray(s.prices) && s.prices.length > 0
    ? Number(s.prices[0].amountNGN || 0)
    : Number(s.amountNGN || 0)
  return {
    id: String(s.id || ''),
    title: String(s.title || ''),
    city: String(s.city || ''),
    category: String(s.category || ''),
    provider: String(s.provider || ''),
    description: String(s.summary || ''),
    amountNGN: amount,
    rating: typeof s.rating === 'number' ? s.rating : undefined,
    images: Array.isArray(s.images) ? s.images : []
  }
}

function normalizeFromDb(s: any): ServiceShape | null {
  if (!s) return null
  return {
    id: String(s.id),
    title: String(s.title || ''),
    city: String(s.city || ''),
    category: String(s.category || ''),
    provider: String(s.provider || ''),
    description: String(s.description || ''),
    amountNGN: typeof s.amountNGN === 'number' ? s.amountNGN : undefined,
    rating: typeof s.rating === 'number' ? s.rating : undefined,
    images: Array.isArray(s.images) ? s.images : []
  }
}

export type ServiceListOptions = {
  city?: string
  query?: string
  limit?: number
}

export async function listServices(opts: ServiceListOptions = {}): Promise<ServiceShape[]> {
  const { city, query = '', limit = 60 } = opts

  if (isDbEnabled()) {
    try {
      const where: any = { active: true }
      if (city) {
        const c = city.toLowerCase().replace(/\s+/g, '')
        const enumCity = c === 'lagos' ? 'Lagos' : c === 'abuja' ? 'Abuja' : c === 'portharcourt' || c === 'port-harcourt' ? 'PortHarcourt' : c === 'owerri' ? 'Owerri' : undefined
        if (enumCity) where.city = enumCity
      }
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      }
  const rows = await (prisma as any).service.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: Math.min(limit, 100)
      })
      return rows.map(normalizeFromDb).filter(Boolean) as ServiceShape[]
    } catch (e) {
      // fall through to JSON
    }
  }

  const q = String(query || '').toLowerCase()
  const list = (SERVICES as any[])
    .filter(s => !city || String(s.city) === city)
    .filter(s => !q || (String(s.title || '').toLowerCase().includes(q) || String(s.category || '').toLowerCase().includes(q)))
    .map(normalizeFromJson)
    .filter(Boolean) as ServiceShape[]

  return list.slice(0, limit)
}

export async function getServiceById(id: string): Promise<ServiceShape | null> {
  if (!id) return null

  if (isDbEnabled()) {
    try {
  const row = await (prisma as any).service.findUnique({ where: { id } })
      if (row) return normalizeFromDb(row)
    } catch (e) {
      // fall through
    }
  }

  const s = (SERVICES as any[]).find(x => String(x.id) === id)
  return normalizeFromJson(s)
}
