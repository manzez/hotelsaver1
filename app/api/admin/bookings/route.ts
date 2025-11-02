import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface BookingRecord {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  userEmail: string;
  userPhone: string;
  originalPrice: number;
  negotiatedPrice?: number;
  finalPrice: number;
  discountApplied: number;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  checkIn: string;
  checkOut: string;
  city: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  commissionRate: number;
  commissionAmount: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

// GET /api/admin/bookings - Retrieve booking analytics and data
export async function GET(req: NextRequest) {
  try {
    const key = req.headers.get('x-admin-key') || '';
    const expected = process.env.ADMIN_API_KEY || 'your-secret-admin-key';
    
    if (!key || key !== expected) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const city = url.searchParams.get('city');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Read bookings from JSON file (in production, use database)
    const bookingsPath = path.join(process.cwd(), 'data', 'bookings.json');
    let bookings: BookingRecord[] = [];
    
    try {
      if (fs.existsSync(bookingsPath)) {
        bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('No bookings file found, starting with empty array');
    }
    
    // Apply filters
    let filteredBookings = bookings;
    
    if (dateFrom) {
      filteredBookings = filteredBookings.filter(b => 
        new Date(b.createdAt) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filteredBookings = filteredBookings.filter(b => 
        new Date(b.createdAt) <= new Date(dateTo)
      );
    }
    
    if (city) {
      filteredBookings = filteredBookings.filter(b => b.city === city);
    }
    
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }
    
    // Calculate analytics
    const analytics = {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + b.finalPrice, 0),
      totalCommission: filteredBookings.reduce((sum, b) => sum + b.commissionAmount, 0),
      avgBookingValue: filteredBookings.length > 0 
        ? filteredBookings.reduce((sum, b) => sum + b.finalPrice, 0) / filteredBookings.length 
        : 0,
      avgDiscount: filteredBookings.length > 0 
        ? filteredBookings.reduce((sum, b) => sum + b.discountApplied, 0) / filteredBookings.length 
        : 0,
      bookingsByCity: getBookingsByCity(filteredBookings),
      bookingsByStatus: getBookingsByStatus(filteredBookings),
      recentBookings: filteredBookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    };
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedBookings = filteredBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(startIndex, startIndex + limit);
    
    return NextResponse.json({
      success: true,
      analytics,
      bookings: paginatedBookings,
      pagination: {
        page,
        limit,
        total: filteredBookings.length,
        totalPages: Math.ceil(filteredBookings.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/bookings - Create or update booking record
export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-admin-key') || '';
    const expected = process.env.ADMIN_API_KEY || 'your-secret-admin-key';
    
    if (!key || key !== expected) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const bookingData = await req.json();
    const {
      bookingId,
      hotelId,
      userEmail,
      userPhone,
      originalPrice,
      negotiatedPrice,
      finalPrice,
      nights,
      adults,
      children,
      rooms,
      checkIn,
      checkOut,
      status = 'pending'
    } = bookingData;
    
    // Validate required fields
    if (!bookingId || !hotelId || !userEmail || !finalPrice) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }
    
    // Get hotel information
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
    const hotel = hotels.find((h: any) => h.id === hotelId);
    
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Calculate commission (assume 10% default)
    const commissionRate = 0.10;
    const commissionAmount = Math.round(finalPrice * commissionRate);
    
    // Calculate discount applied
    const discountApplied = originalPrice ? (originalPrice - finalPrice) / originalPrice : 0;
    
    // Create booking record
    const booking: BookingRecord = {
      bookingId,
      hotelId,
      hotelName: hotel.name,
      userEmail,
      userPhone,
      originalPrice: originalPrice || finalPrice,
      negotiatedPrice,
      finalPrice,
      discountApplied,
      nights: nights || 1,
      adults: adults || 1,
      children: children || 0,
      rooms: rooms || 1,
      checkIn,
      checkOut,
      city: hotel.city,
      status,
      createdAt: new Date().toISOString(),
      commissionRate,
      commissionAmount
    };
    
    // Read existing bookings
    const bookingsPath = path.join(process.cwd(), 'data', 'bookings.json');
    let bookings: BookingRecord[] = [];
    
    try {
      if (fs.existsSync(bookingsPath)) {
        bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
      }
    } catch (error) {
      // Create directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }
    
    // Add or update booking
    const existingIndex = bookings.findIndex(b => b.bookingId === bookingId);
    if (existingIndex >= 0) {
      bookings[existingIndex] = { ...bookings[existingIndex], ...booking };
    } else {
      bookings.push(booking);
    }
    
    // Save back to file
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    
    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking recorded successfully'
    });
    
  } catch (error) {
    console.error('Error creating booking record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getBookingsByCity(bookings: BookingRecord[]) {
  const cityStats: Record<string, number> = {};
  bookings.forEach(booking => {
    cityStats[booking.city] = (cityStats[booking.city] || 0) + 1;
  });
  return cityStats;
}

function getBookingsByStatus(bookings: BookingRecord[]) {
  const statusStats: Record<string, number> = {};
  bookings.forEach(booking => {
    statusStats[booking.status] = (statusStats[booking.status] || 0) + 1;
  });
  return statusStats;
}