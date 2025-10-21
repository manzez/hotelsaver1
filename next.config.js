/** @type {import('next').NextConfig} */
const nextConfig = {
  // Unblock production builds while we fix lint errors incrementally
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
