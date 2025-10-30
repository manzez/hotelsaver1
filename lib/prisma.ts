import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const shouldLog = (process.env.DATA_SOURCE === 'db') && !!process.env.DATABASE_URL
export const prisma = global.prisma || new PrismaClient({
  log: shouldLog ? ['warn', 'error'] : [],
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
