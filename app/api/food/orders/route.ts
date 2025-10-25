import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    // Avoid importing Prisma unless a DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ orders: [] })
    }
    const { prisma } = await import('@/lib/prisma')
    const db = prisma as any
    const orders = await db.foodOrder.findMany?.({ orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ orders: Array.isArray(orders) ? orders : [] })
  } catch (e) {
    return NextResponse.json({ orders: [] })
  }
}
