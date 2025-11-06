import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/admin/hotels/update-status - Update hotel active/inactive status
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
    
    const { hotelId, status } = await req.json();
    
    if (!hotelId || !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid hotel ID or status' },
        { status: 400 }
      );
    }
    
    // Read current hotels data
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
    
    // Find and update the hotel
    const hotelIndex = hotels.findIndex((h: any) => h.id === hotelId);
    
    if (hotelIndex === -1) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    const oldStatus = hotels[hotelIndex].status || 'active';
    hotels[hotelIndex].status = status;
    hotels[hotelIndex].updatedAt = new Date().toISOString();
    
    // Save updated hotels data
    fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2));
    
    return NextResponse.json({
      success: true,
      hotelId,
      hotelName: hotels[hotelIndex].name,
      oldStatus,
      newStatus: status,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating hotel status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}