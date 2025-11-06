import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { clearHotelCache } from '@/lib/hotel-database-service';

const prisma = new PrismaClient();

// POST /api/admin/hotels/update-price - Update hotel base price
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
    
    const { hotelId, newPrice } = await req.json();
    
    if (!hotelId || !newPrice || newPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid hotel ID or price' },
        { status: 400 }
      );
    }
    
    // Find hotel in database
    const existingHotel = await prisma.hotel.findUnique({
      where: { slug: hotelId },
      select: { 
        id: true,
        name: true,
        shelfPriceNGN: true
      }
    });
    
    if (!existingHotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    const oldPrice = existingHotel.shelfPriceNGN;
    
    // Update the price in database
    const updatedHotel = await prisma.hotel.update({
      where: { slug: hotelId },
      data: {
        shelfPriceNGN: newPrice,
        updatedAt: new Date()
      }
    });
    
    // Clear cache so new price takes effect immediately
    clearHotelCache();
    
    console.log(`💰 Admin updated hotel ${hotelId} price: ₦${oldPrice.toLocaleString()} → ₦${newPrice.toLocaleString()}`);
    
    return NextResponse.json({
      success: true,
      hotelId,
      hotelName: existingHotel.name,
      oldPrice,
      newPrice,
      updatedAt: updatedHotel.updatedAt.toISOString()
    });
    
  } catch (error) {
    console.error('Error updating hotel price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}