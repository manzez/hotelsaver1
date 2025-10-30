import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function buildTextSearchUrl(query: string, apiKey: string) {
  const params = new URLSearchParams({ query, key: apiKey })
  return `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
}

function buildPhotoUrl(photoReference: string, apiKey: string, maxwidth = 800) {
  const params = new URLSearchParams({ photoreference: photoReference, key: apiKey, maxwidth: String(maxwidth) })
  return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const maxwidth = parseInt(searchParams.get('maxwidth') || '800', 10)
  const cacheKey = `${q}|${maxwidth}`

  if (!q) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 })
  }

  // Tiny in-memory LRU cache (per instance) to prevent unbounded growth
  type CacheEntry = { buf: Buffer; contentType: string; etag: string; expiresAt: number }
  class LRUCache {
    private map = new Map<string, CacheEntry>()
    constructor(private max = 500) {}
    get(key: string): CacheEntry | undefined {
      const v = this.map.get(key)
      if (v) {
        // move to recent
        this.map.delete(key)
        this.map.set(key, v)
      }
      return v
    }
    set(key: string, value: CacheEntry) {
      if (this.map.has(key)) this.map.delete(key)
      this.map.set(key, value)
      if (this.map.size > this.max) {
        const oldestKey = this.map.keys().next().value as string | undefined
        if (oldestKey !== undefined) this.map.delete(oldestKey)
      }
    }
    delete(key: string) { this.map.delete(key) }
  }

  // Note: per-serverless-instance; cold starts will miss cache (acceptable)
  const globalAny = global as unknown as { __placesCache?: LRUCache }
  if (!globalAny.__placesCache) {
    // Allow tuning via env var; clamp to a safe range
    const rawMax = process.env.PLACES_PHOTO_LRU_MAX || process.env.PLACES_PHOTO_CACHE_MAX || '500'
    let max = parseInt(rawMax, 10)
    if (!Number.isFinite(max) || isNaN(max)) max = 500
    // clamp between 50 and 5000 to avoid extreme values
    max = Math.max(50, Math.min(5000, max))
    globalAny.__placesCache = new LRUCache(max)
  }
  const cache = globalAny.__placesCache
  const now = Date.now()
  const cached = cache.get(cacheKey)
  const ifNoneMatch = req.headers.get('if-none-match') || ''
  if (cached && cached.expiresAt > now) {
    if (cached.etag && ifNoneMatch && cached.etag === ifNoneMatch) {
      return new NextResponse(null, { status: 304, headers: { ETag: cached.etag } })
    }
  const cachedAB = new ArrayBuffer(cached.buf.byteLength)
  new Uint8Array(cachedAB).set(cached.buf)
  const cachedBlob = new Blob([cachedAB], { type: cached.contentType })
    return new NextResponse(cachedBlob, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable',
        'CDN-Cache-Control': 'max-age=86400',
        'ETag': cached.etag
      }
    })
  } else if (cached && cached.expiresAt <= now) {
    // drop expired entry so it doesn't occupy LRU capacity
    cache.delete(cacheKey)
  }

  try {
    const textSearchUrl = buildTextSearchUrl(q, apiKey)
    const searchResp = await fetch(textSearchUrl)
    if (!searchResp.ok) throw new Error(`Places textsearch failed: ${searchResp.status}`)
    const searchJson = await searchResp.json()

    const first = Array.isArray(searchJson.results) ? searchJson.results[0] : null
    const photoRef = first?.photos?.[0]?.photo_reference

    if (!photoRef) {
      // fallback image
      const fallback = await fetch('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80')
      const arr = await fallback.arrayBuffer()
      const buf = Buffer.from(arr)
      const etag = crypto.createHash('sha1').update(buf).digest('hex')
      cache.set(cacheKey, { buf, contentType: 'image/jpeg', etag, expiresAt: now + 60 * 60 * 1000 })
      if (ifNoneMatch && etag === ifNoneMatch) {
        return new NextResponse(null, { status: 304, headers: { ETag: etag } })
      }
  const ab = new ArrayBuffer(buf.byteLength)
  new Uint8Array(ab).set(buf)
  const blob = new Blob([ab], { type: 'image/jpeg' })
      return new NextResponse(blob, { headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=3600',
        'ETag': etag
      } })
    }

    const photoUrl = buildPhotoUrl(photoRef, apiKey, maxwidth)
    const photoResp = await fetch(photoUrl, { redirect: 'follow' })
    if (!photoResp.ok) throw new Error(`Places photo failed: ${photoResp.status}`)

    const arr = await photoResp.arrayBuffer()
    const buf = Buffer.from(arr)
    const contentType = photoResp.headers.get('content-type') || 'image/jpeg'
    const etag = crypto.createHash('sha1').update(buf).digest('hex')
    cache.set(cacheKey, { buf, contentType, etag, expiresAt: now + 24 * 60 * 60 * 1000 })
    if (ifNoneMatch && etag === ifNoneMatch) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } })
    }

  const ab2 = new ArrayBuffer(buf.byteLength)
  new Uint8Array(ab2).set(buf)
  const blob = new Blob([ab2], { type: contentType })
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable',
        'CDN-Cache-Control': 'max-age=86400',
        'ETag': etag
      },
    })
  } catch (err) {
    console.error('Places photo error:', err)
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 })
  }
}
