import type { MetadataRoute } from 'next'
import HOTELS from '../lib.hotels.json'

const BASE = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BASE || ''
  const now = new Date()

  const staticUrls: MetadataRoute.Sitemap = [
    '/',
    '/search',
    '/services',
    '/food',
    '/contact',
    '/how-it-works',
    '/about',
    '/reviews',
    '/partner',
  ].map((path) => ({
    url: base ? `${base}${path}` : path,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const hotelUrls: MetadataRoute.Sitemap = (Array.isArray(HOTELS) ? HOTELS : []).slice(0, 1000).map((h: any) => {
    const id = String(h.id || '').trim()
    if (!id) return null as any
    const path = `/hotel/${encodeURIComponent(id)}`
    return {
      url: base ? `${base}${path}` : path,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  }).filter(Boolean) as MetadataRoute.Sitemap

  return [...staticUrls, ...hotelUrls]
}
