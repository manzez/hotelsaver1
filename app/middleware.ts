import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // === SECURITY HEADERS (Always enforce) ===

  // HSTS: Force HTTPS, include subdomains, preload
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // Prevent MIME sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff')

  // Clickjacking protection (allow same-origin embedding)
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // Referrer policy: only send referrer for same-origin, use origin for cross-origin
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy: disable camera, microphone, geolocation
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // === CONTENT SECURITY POLICY (Prevents XSS) ===
  // Adjust this based on your needs (current is permissive to allow Tailwind + external images)
  const csp =
    // eslint-disable-next-line max-len
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"

  res.headers.set('Content-Security-Policy', csp)

  // === ADDITIONAL HEADERS ===

  // X-Content-Type-Options already set above; re-confirm
  res.headers.set('X-UA-Compatible', 'ie=edge')

  return res
}

// Apply to all routes
export const config = {
  matcher: ['/:path*'],
}
