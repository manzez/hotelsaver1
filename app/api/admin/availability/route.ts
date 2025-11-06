import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'default-key'

export async function GET(req: NextRequest) {
  // Check admin authentication
  const authKey = req.headers.get('x-admin-key')
  if (authKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const hotelId = searchParams.get('hotelId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {}

    if (hotelId) {
      whereClause.hotelId = hotelId
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } else if (startDate) {
      whereClause.date = {
        gte: new Date(startDate + 'T00:00:00.000Z')
      }
    }

    const availability = await prisma.availability.findMany({
      where: whereClause,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { hotel: { name: 'asc' } }
      ]
    })

    // Format dates for JSON serialization
    const formattedAvailability = availability.map(record => ({
      ...record,
      date: record.date.toISOString().split('T')[0] // YYYY-MM-DD format
    }))

    return NextResponse.json({
      availability: formattedAvailability,
      count: availability.length
    })

  } catch (error) {
    console.error('Admin availability fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  // Check admin authentication
  const authKey = req.headers.get('x-admin-key')
  if (authKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { hotelId, date, roomsAvailable } = await req.json()

    if (!hotelId || !date || roomsAvailable === undefined || roomsAvailable < 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: hotelId, date, roomsAvailable' 
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

    const dateObj = new Date(date + 'T00:00:00.000Z')
    
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 })
    }

    // Upsert availability record
    const result = await prisma.availability.upsert({
      where: {
        hotelId_date: {
          hotelId,
          date: dateObj
        }
      },
      update: {
        roomsAvailable
      },
      create: {
        hotelId,
        date: dateObj,
        roomsAvailable
      },
      include: {
        hotel: {
          select: {
            name: true,
            city: true
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      message: 'Availability updated successfully',
      availability: {
        ...result,
        date: result.date.toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Admin availability update error:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}