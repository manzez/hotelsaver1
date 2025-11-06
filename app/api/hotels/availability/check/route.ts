import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hotelSlug = searchParams.get('hotelId') // This is actually the slug from frontend
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const rooms = parseInt(searchParams.get('rooms') || '1')

    if (!hotelSlug || !checkIn || !checkOut) {
      return NextResponse.json({ 
        error: 'Missing required parameters: hotelId, checkIn, checkOut' 
      }, { status: 400 })
    }

    // Convert slug to database ID
    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true }
    })

    if (!hotel) {
      return NextResponse.json({ 
        error: 'Hotel not found' 
      }, { status: 404 })
    }

    const hotelId = hotel.id

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 })
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date' 
      }, { status: 400 })
    }

    // Get availability for all nights in the date range
    const availability = await prisma.availability.findMany({
      where: {
        hotelId,
        date: {
          gte: checkInDate,
          lt: checkOutDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Check if we have data for all nights
    const nightsRequired = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const availabilityByDate = availability.reduce((acc, avail) => {
      const dateKey = avail.date.toISOString().split('T')[0]
      acc[dateKey] = avail.roomsAvailable
      return acc
    }, {} as Record<string, number>)

    const result = {
      hotelId: hotelSlug, // Return the original slug to frontend
      checkIn: checkIn,
      checkOut: checkOut,
      roomsRequested: rooms,
      nightsRequired,
      availability: [] as Array<{
        date: string
        roomsAvailable: number
        canAccommodate: boolean
      }>,
      isAvailable: true,
      minRoomsAvailable: Infinity,
      hasCompleteData: true
    }

    // Generate availability for each night
    for (let i = 0; i < nightsRequired; i++) {
      const currentDate = new Date(checkInDate.getTime() + (i * 24 * 60 * 60 * 1000))
      const dateKey = currentDate.toISOString().split('T')[0]
      const roomsAvailable = availabilityByDate[dateKey]

      if (roomsAvailable === undefined) {
        // No data for this date - mark as incomplete
        result.hasCompleteData = false
        result.availability.push({
          date: dateKey,
          roomsAvailable: -1, // -1 indicates no data
          canAccommodate: false
        })
        result.isAvailable = false
      } else {
        const canAccommodate = roomsAvailable >= rooms
        result.availability.push({
          date: dateKey,
          roomsAvailable,
          canAccommodate
        })
        
        if (!canAccommodate) {
          result.isAvailable = false
        }
        
        result.minRoomsAvailable = Math.min(result.minRoomsAvailable, roomsAvailable)
      }
    }

    if (result.minRoomsAvailable === Infinity) {
      result.minRoomsAvailable = 0
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}