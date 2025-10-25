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

const nextConfig = {
  // Unblock production builds while we fix lint errors incrementally
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow loading dev assets from LAN IP without warnings (Next.js 14+ experimental)
  allowedDevOrigins: allowedOrigins,
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

module.exports = nextConfig
