import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listHotels } from '@/lib/hotels-source'
import { getDiscountFor } from '@/lib/discounts'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'default-key'

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

export async function GET(req: NextRequest) {
  // Check admin authentication
  const authKey = req.headers.get('x-admin-key')
  if (authKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let totalHotels = 0
    let negotiableHotels = 0
    let topCities: Array<{ city: string; count: number }> = []
    let totalBookings = 0
    let totalRevenue = 0
    let recentBookings: Array<{ id: string; hotel: string; amount: number; date: string }> = []

    // Get hotel metrics
    const hotels = await listHotels({ limit: 1000 })
    totalHotels = hotels.length
    
    // Count negotiable hotels
    negotiableHotels = hotels.filter(h => getDiscountFor(h.id) > 0).length
    
    // Group by city
    const cityGroups = hotels.reduce((acc, h) => {
      acc[h.city] = (acc[h.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    topCities = Object.entries(cityGroups)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    // Get booking metrics (if DB is enabled)
    if (isDbEnabled()) {
      try {
        // Total bookings and revenue
        const bookingStats = await prisma.booking.aggregate({
          _count: { id: true },
          _sum: { totalNGN: true }
        })
        
        totalBookings = bookingStats._count.id || 0
        totalRevenue = bookingStats._sum.totalNGN || 0

        // Recent bookings
        const recent = await prisma.booking.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            hotel: { select: { name: true } }
          }
        })

        recentBookings = recent.map(b => ({
          id: b.id,
          hotel: b.hotel.name,
          amount: b.totalNGN,
          date: b.createdAt.toLocaleDateString()
        }))
      } catch (dbError) {
        console.error('DB metrics error:', dbError)
        // Continue with hotel-only metrics
      }
    }

    const negotiablePercentage = totalHotels > 0 ? (negotiableHotels / totalHotels) * 100 : 0
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0

    return NextResponse.json({
      ok: true,
      metrics: {
        totalHotels,
        negotiableHotels,
        negotiablePercentage,
        totalBookings,
        totalRevenue,
        avgBookingValue,
        topCities,
        recentBookings
      }
    })

  } catch (error) {
    console.error('Metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}