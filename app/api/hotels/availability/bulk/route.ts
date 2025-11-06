import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { hotelIds, checkIn, checkOut, rooms } = await req.json()

    if (!hotelIds || !Array.isArray(hotelIds) || hotelIds.length === 0) {
      return NextResponse.json({ 
        error: 'hotelIds array is required' 
      }, { status: 400 })
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json({ 
        error: 'checkIn and checkOut dates are required' 
      }, { status: 400 })
    }

    const roomsRequested = rooms || 1
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

    // Convert slugs to database IDs
    const hotels = await prisma.hotel.findMany({
      where: { 
        slug: { 
          in: hotelIds 
        } 
      },
      select: { id: true, slug: true }
    })

    const slugToIdMap = new Map(hotels.map(h => [h.slug, h.id]))
    const dbHotelIds = hotels.map(h => h.id)

    // Get availability for all hotels for the date range
    const availability = await prisma.availability.findMany({
      where: {
        hotelId: {
          in: dbHotelIds
        },
        date: {
          gte: checkInDate,
          lt: checkOutDate
        }
      },
      orderBy: [
        { hotelId: 'asc' },
        { date: 'asc' }
      ]
    })

    const nightsRequired = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Group availability by hotel
    const availabilityByHotel = availability.reduce((acc, avail) => {
      if (!acc[avail.hotelId]) {
        acc[avail.hotelId] = {}
      }
      const dateKey = avail.date.toISOString().split('T')[0]
      acc[avail.hotelId][dateKey] = avail.roomsAvailable
      return acc
    }, {} as Record<string, Record<string, number>>)

    // Build result for each hotel
    const results = hotelIds.map(hotelSlug => {
      const dbHotelId = slugToIdMap.get(hotelSlug)
      const hotelAvailability = dbHotelId ? availabilityByHotel[dbHotelId] || {} : {}
      let isAvailable = true
      let minRoomsAvailable = Infinity
      let hasCompleteData = true
      const dailyAvailability = []

      for (let i = 0; i < nightsRequired; i++) {
        const currentDate = new Date(checkInDate.getTime() + (i * 24 * 60 * 60 * 1000))
        const dateKey = currentDate.toISOString().split('T')[0]
        const roomsAvailable = hotelAvailability[dateKey]

        if (roomsAvailable === undefined) {
          hasCompleteData = false
          isAvailable = false // Conservative: assume unavailable if no data
          dailyAvailability.push({
            date: dateKey,
            roomsAvailable: -1,
            canAccommodate: false
          })
        } else {
          const canAccommodate = roomsAvailable >= roomsRequested
          dailyAvailability.push({
            date: dateKey,
            roomsAvailable,
            canAccommodate
          })
          
          if (!canAccommodate) {
            isAvailable = false
          }
          
          minRoomsAvailable = Math.min(minRoomsAvailable, roomsAvailable)
        }
      }

      if (minRoomsAvailable === Infinity) {
        minRoomsAvailable = hasCompleteData ? 0 : -1
      }

      return {
        hotelId: hotelSlug, // Return the original slug to frontend
        isAvailable,
        hasCompleteData,
        minRoomsAvailable,
        dailyAvailability: dailyAvailability,
        summary: {
          totalNights: nightsRequired,
          roomsRequested: roomsRequested,
          availableNights: dailyAvailability.filter(d => d.canAccommodate).length,
          unavailableNights: dailyAvailability.filter(d => !d.canAccommodate).length
        }
      }
    })

    return NextResponse.json({
      checkIn,
      checkOut,
      roomsRequested,
      nightsRequired,
      hotelsChecked: hotelIds.length,
      availableHotels: results.filter(r => r.isAvailable).length,
      results
    })

  } catch (error) {
    console.error('Bulk availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check bulk availability' },
      { status: 500 }
    )
  }
}