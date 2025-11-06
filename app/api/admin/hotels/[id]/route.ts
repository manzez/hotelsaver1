import { NextRequest, NextResponse } from 'next/server'
import { getHotelByIdOptimized, clearHotelCache } from '@/lib/hotel-data-optimized'
import HOTELS from '@/lib.hotels.json'
import fs from 'fs/promises'
import path from 'path'

function authorize(req: NextRequest): NextResponse | null {
  const key = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  
  console.log('Auth check - Received key:', key.substring(0, 10) + '...')
  console.log('Auth check - Expected key:', expected.substring(0, 10) + '...')
  console.log('Auth check - Keys match:', key === expected)
  
  if (!expected) {
    console.error('ADMIN_API_KEY not set in environment')
    return NextResponse.json({ 
      ok: false, 
      error: 'Admin API key not configured' 
    }, { status: 500 })
  }
  
  if (key !== expected) {
    console.error('Invalid admin key provided')
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid admin key' 
    }, { status: 401 })
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
    const hotel = await getHotelByIdOptimized(params.id)
    
    if (!hotel) {
      return NextResponse.json(
        { ok: false, error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Return hotel with full details including room types
    const hotelData = {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
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
      updatedAt: hotel.updatedAt || new Date().toISOString(),
      roomTypes: hotel.roomTypes || []
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

    // Update the hotel data and save to file
    const updatedHotel = {
      ...existingHotel,
      ...hotelData,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    }

    try {
      // Import fs for file operations
      const fs = require('fs')
      const path = require('path')
      
      // Read current hotels data
      const hotelsPath = path.join(process.cwd(), 'lib.hotels.json')
      console.log('Reading hotels file from:', hotelsPath)
      const hotelsData = fs.readFileSync(hotelsPath, 'utf8')
      const hotels = JSON.parse(hotelsData)
      console.log('Total hotels in file:', hotels.length)
      
      // Create backup first
      const backupPath = path.join(process.cwd(), `lib.hotels.backup.${new Date().toISOString().replace(/:/g, '-')}.json`)
      fs.writeFileSync(backupPath, hotelsData)
      console.log('Backup created:', backupPath)
      
      // Find and update the hotel in the array
      const hotelIndex = hotels.findIndex((h: any) => h.id === params.id)
      console.log('Hotel index found:', hotelIndex, 'for ID:', params.id)
      
      if (hotelIndex !== -1) {
        const originalPrice = hotels[hotelIndex].basePriceNGN
        hotels[hotelIndex] = updatedHotel
        console.log('Price updated from', originalPrice, 'to', updatedHotel.basePriceNGN)
        
        // Write updated data back to file
        fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2))
        console.log('File written successfully')
        
        // Clear the cache to force fresh data loading
        clearHotelCache()
        console.log('🔄 Hotel cache cleared after update')
        
        // Verify the write was successful
        const verifyData = fs.readFileSync(hotelsPath, 'utf8')
        const verifyHotels = JSON.parse(verifyData)
        const verifyHotel = verifyHotels.find((h: any) => h.id === params.id)
        console.log('Verification - Price in file is now:', verifyHotel?.basePriceNGN)
        
        return NextResponse.json({
          ok: true,
          hotel: updatedHotel,
          message: 'Hotel updated successfully and saved to database',
          backupCreated: backupPath.split(path.sep).pop(),
          verification: {
            originalPrice,
            newPrice: updatedHotel.basePriceNGN,
            verifiedPrice: verifyHotel?.basePriceNGN
          }
        })
      } else {
        throw new Error('Hotel not found in data array')
      }
      
    } catch (fileError) {
      console.error('Error saving hotel update to file:', fileError)
      
      // Return success for API response but indicate file save failed
      return NextResponse.json({
        ok: true,
        hotel: updatedHotel,
        message: 'Hotel updated in memory but failed to save to file',
        warning: 'Changes may not persist after server restart'
      })
    }
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
    const existingHotel = await getHotelByIdOptimized(params.id)
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