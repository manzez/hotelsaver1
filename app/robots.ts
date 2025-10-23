import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || ''

export default function robots(): MetadataRoute.Robots {
  const base = BASE.replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cart',
          '/payment',
          '/payment/',
          '/payment/*',
          '/hotel-portal/',
        ],
      },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
    host: base || undefined,
  }
}
