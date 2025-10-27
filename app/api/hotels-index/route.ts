import { NextResponse } from 'next/server'
import hotelsData from '../../../lib.hotels.json'

// Lightweight hotel index for client-side search
interface HotelIndex {
  id: string
  name: string
  city: string
}

export async function GET() {
  try {
    // Create lightweight index from hotels data
    const hotels: HotelIndex[] = hotelsData.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      city: hotel.city
    }))

    return NextResponse.json({
      hotels,
      count: hotels.length
    })
  } catch (error) {
    console.error('Error creating hotels index:', error)
    return NextResponse.json(
      { error: 'Failed to load hotels index', hotels: [] },
      { status: 500 }
    )
  }
}