export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { HOTELS } from '@/lib/data'

// Mock booking data - in production, this would come from your database
const mockBookings = [
  {
    id: 'BK001',
    hotelId: 'eko-hotels-and-suites-lagos',
    hotelName: 'Eko Hotels and Suites',
    customerName: 'John Adebayo',
    customerEmail: 'john.adebayo@email.com',
    customerPhone: '+234 901 234 5678',
    checkIn: '2025-11-01',
    checkOut: '2025-11-03',
    nights: 2,
    rooms: 1,
    adults: 2,
    children: 0,
    totalAmount: 185000,
    paymentStatus: 'confirmed',
    paymentMethod: 'paystack',
    bookingDate: '2025-10-30T10:30:00Z',
    city: 'Lagos'
  },
  {
    id: 'BK002', 
    hotelId: 'transcorp-hilton-abuja-abuja',
    hotelName: 'Transcorp Hilton Abuja',
    customerName: 'Mary Okafor',
    customerEmail: 'mary.okafor@email.com',
    customerPhone: '+234 802 345 6789',
    checkIn: '2025-11-05',
    checkOut: '2025-11-08',
    nights: 3,
    rooms: 1,
    adults: 2,
    children: 1,
    totalAmount: 220000,
    paymentStatus: 'pending',
    paymentMethod: 'pay-at-property',
    bookingDate: '2025-10-30T14:15:00Z',
    city: 'Abuja'
  }
  // Add more mock bookings as needed
]

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare CSV content
    const csvHeaders = [
      'Booking ID',
      'Hotel Name',
      'City',
      'Customer Name',
      'Customer Email', 
      'Customer Phone',
      'Check In',
      'Check Out',
      'Nights',
      'Rooms',
      'Adults',
      'Children',
      'Total Amount (NGN)',
      'Payment Status',
      'Payment Method',
      'Booking Date'
    ].join(',')

    const csvRows = mockBookings.map(booking => [
      booking.id,
      `"${booking.hotelName}"`,
      booking.city,
      `"${booking.customerName}"`,
      booking.customerEmail,
      booking.customerPhone,
      booking.checkIn,
      booking.checkOut,
      booking.nights,
      booking.rooms,
      booking.adults,
      booking.children,
      booking.totalAmount,
      booking.paymentStatus,
      booking.paymentMethod,
      booking.bookingDate
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting bookings:', error)
    return NextResponse.json({ 
      error: 'Failed to export bookings' 
    }, { status: 500 })
  }
}