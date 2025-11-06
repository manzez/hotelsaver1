import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'default-key'

export async function POST(req: NextRequest) {
  // Check admin authentication
  const authKey = req.headers.get('x-admin-key')
  if (authKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { hotelId, startDate, endDate, roomsAvailable } = await req.json()

    if (!hotelId || !startDate || !endDate || roomsAvailable === undefined || roomsAvailable < 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: hotelId, startDate, endDate, roomsAvailable' 
      }, { status: 400 })
    }

    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    })

    if (!hotel) {
      return NextResponse.json({ 
        error: 'Hotel not found' 
      }, { status: 404 })
    }

    const startDateObj = new Date(startDate + 'T00:00:00.000Z')
    const endDateObj = new Date(endDate + 'T00:00:00.000Z')
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 })
    }

    if (startDateObj >= endDateObj) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 })
    }

    // Generate all dates in the range
    const dates = []
    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }

    // Bulk upsert for all dates
    const operations = dates.map(date => 
      prisma.availability.upsert({
        where: {
          hotelId_date: {
            hotelId,
            date
          }
        },
        update: {
          roomsAvailable
        },
        create: {
          hotelId,
          date,
          roomsAvailable
        }
      })
    )

    const results = await Promise.all(operations)

    return NextResponse.json({
      ok: true,
      message: `Bulk update completed for ${dates.length} days`,
      daysUpdated: dates.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      roomsAvailable,
      hotelName: hotel.name
    })

  } catch (error) {
    console.error('Admin bulk availability update error:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update availability' },
      { status: 500 }
    )
  }
}