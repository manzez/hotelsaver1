import { NextRequest, NextResponse } from 'next/server'
import { HOTELS } from '@/lib/data'

function authorize(req: NextRequest): NextResponse | null {
  const key = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  if (!expected || key !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

// GET /api/admin/hotels/[id] - Get single hotel
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authorize(req)
  if (auth) return auth

  try {
    const hotel = HOTELS.find((h: any) => h.id === params.id)
    
    if (!hotel) {
      return NextResponse.json(
        { ok: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Return hotel with full details
    const hotelData = {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      basePriceNGN: typeof hotel.basePriceNGN === 'number' ? hotel.basePriceNGN : (typeof hotel.price === 'number' ? hotel.price : 0),
      stars: hotel.stars || 4,
      type: hotel.type || 'Hotel',
      address: hotel.address || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      description: hotel.description || '',
      amenities: hotel.amenities || [],
      images: Array.isArray(hotel.images) ? hotel.images : [],
      status: hotel.status || 'active',
      featured: hotel.featured || false,
      totalRooms: hotel.totalRooms || 0,
      availableRooms: hotel.availableRooms || 0,
      createdAt: hotel.createdAt || new Date().toISOString(),
      updatedAt: hotel.updatedAt || new Date().toISOString()
    }

    return NextResponse.json({
      ok: true,
      hotel: hotelData
    })
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch hotel' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/hotels/[id] - Update single hotel
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authorize(req)
  if (auth) return auth

  try {
    const hotelData = await req.json()
    
    // Find existing hotel
    const existingHotel = HOTELS.find((h: any) => h.id === params.id)
    if (!existingHotel) {
      return NextResponse.json(
        { ok: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!hotelData.name || !hotelData.city || !hotelData.basePriceNGN) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: name, city, basePriceNGN' },
        { status: 400 }
      )
    }

    // For now, return success (in production, update in database)
    // TODO: Implement actual hotel update logic
    const updatedHotel = {
      ...existingHotel,
      ...hotelData,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      ok: true,
      hotel: updatedHotel,
      message: 'Hotel updated successfully'
    })
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/hotels/[id] - Delete single hotel
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = authorize(req)
  if (auth) return auth

  try {
    // Find existing hotel
    const existingHotel = HOTELS.find((h: any) => h.id === params.id)
    if (!existingHotel) {
      return NextResponse.json(
        { ok: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // For now, return success (in production, delete from database)
    // TODO: Implement actual hotel deletion logic
    // Note: Should also check for existing bookings before deletion

    return NextResponse.json({
      ok: true,
      message: 'Hotel deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
}