export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { HOTELS } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare CSV content
    const csvHeaders = [
      'Hotel ID',
      'Hotel Name',
      'City',
      'Stars',
      'Type',
      'Base Price (NGN)',
      'Images Count'
    ].join(',')

    const csvRows = HOTELS.map(hotel => [
      hotel.id,
      `"${hotel.name}"`,
      hotel.city,
      hotel.stars,
      hotel.type,
      hotel.basePriceNGN || hotel.price || 0,
      hotel.images?.length || 0
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hotels-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting hotels:', error)
    return NextResponse.json({ 
      error: 'Failed to export hotels' 
    }, { status: 500 })
  }
}