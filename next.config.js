/** @type {import('next').NextConfig} */
const os = require('os')

function getLanIp() {
  try {
    const nets = os.networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          // Common private ranges
          if (
            net.address.startsWith('192.168.') ||
            net.address.startsWith('10.') ||
            /^172\.(1[6-9]|2\d|3[0-1])\./.test(net.address)
          ) {
            return net.address
          }
        }
      }
    }
  } catch {}
  return null
}

const lanIp = getLanIp()
// Support common dev ports to avoid CORS warnings when Next hops ports
const devPorts = [3000, 3001, 3002, 3010]
const allowedOrigins = []
for (const p of devPorts) {
  allowedOrigins.push(`http://localhost:${p}`)
  allowedOrigins.push(`http://127.0.0.1:${p}`)
  if (lanIp) allowedOrigins.push(`http://${lanIp}:${p}`)
}

const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // Unblock production builds while we fix lint errors incrementally
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow loading dev assets from LAN IP without warnings (Next.js 14+ experimental)
  allowedDevOrigins: allowedOrigins,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'maps.googleapis.com',
      'lh3.googleusercontent.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization & disable prerendering for dynamic pages
  experimental: {
    optimizePackageImports: ['date-fns', 'react-icons'],
    isrMemoryCacheSize: 0,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10
          }
        }
      };
    }
    return config;
  },
  async headers() {
    const securityHeaders = [
      // Strict-Transport-Security: enforce HTTPS (only effective on HTTPS)
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      // Disable MIME sniffing
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Basic clickjacking protection (adjust if you need embedding)
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Referrer policy
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Minimal Permissions-Policy (tighten as needed)
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      // Content Security Policy (relaxed to avoid blocking; tighten over time)
      { key: 'Content-Security-Policy', value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.unsplash.com https://maps.googleapis.com https://lh3.googleusercontent.com",
        "connect-src 'self' https://www.google-analytics.com https://*.sentry.io https://o*.ingest.sentry.io",
        "frame-src 'self' https://www.google.com https://js.paystack.co",
        "object-src 'none'",
      ].join('; ') }
    ]

    // In development, don't emit any headers config at all
    if (process.env.NODE_ENV !== 'production') {
      return []
    }

    // Apply to all routes (production only)
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
// Wrap with Sentry to enable source maps and server instrumentation (no-op if DSN missing)
module.exports = withSentryConfig(
  nextConfig,
  {
    // Suppress Sentry build-time logs to keep CI clean
    silent: true,
    // Disable automatic release injection unless configured
    dryRun: !process.env.SENTRY_DSN,
  },
  {
    // Hide source maps from public access
    hideSourceMaps: true,
    widenClientFileUpload: false,
  }
)
