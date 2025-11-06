import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const shouldLog = (process.env.DATA_SOURCE === 'db') && !!process.env.DATABASE_URL

// Enhanced connection configuration for Neon compatibility
export const prisma = global.prisma || new PrismaClient({
  log: shouldLog ? ['warn', 'error'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection timeout and retry configuration
  errorFormat: 'minimal',
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
