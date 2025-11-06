// app/api/admin/hotels/pricing/update/route.ts - Update hotel pricing with audit trail
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HotelUpdate {
  shelfPriceNGN?: number;
  discountRatePct?: number;
  negotiationEnabled?: boolean;
  negotiationMinPct?: number;
  negotiationMaxPct?: number;
  active?: boolean;
}

// POST /api/admin/hotels/pricing/update - Update hotel pricing
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

    const { hotelId, updates } = await req.json();

    if (!hotelId || !updates) {
      return NextResponse.json(
        { error: 'Hotel ID and updates are required' },
        { status: 400 }
      );
    }

    // Validate updates
    const validUpdates: HotelUpdate = {};
    
    if (typeof updates.shelfPriceNGN === 'number' && updates.shelfPriceNGN >= 0) {
      validUpdates.shelfPriceNGN = updates.shelfPriceNGN;
    }
    
    if (typeof updates.discountRatePct === 'number' && updates.discountRatePct >= 0 && updates.discountRatePct <= 100) {
      validUpdates.discountRatePct = updates.discountRatePct;
    }
    
    if (typeof updates.negotiationEnabled === 'boolean') {
      validUpdates.negotiationEnabled = updates.negotiationEnabled;
    }
    
    if (typeof updates.negotiationMinPct === 'number' && updates.negotiationMinPct >= 0 && updates.negotiationMinPct <= 100) {
      validUpdates.negotiationMinPct = updates.negotiationMinPct;
    }
    
    if (typeof updates.negotiationMaxPct === 'number' && updates.negotiationMaxPct >= 0 && updates.negotiationMaxPct <= 100) {
      validUpdates.negotiationMaxPct = updates.negotiationMaxPct;
    }
    
    if (typeof updates.active === 'boolean') {
      validUpdates.active = updates.active;
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Get current hotel data for audit trail
    const currentHotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        shelfPriceNGN: true,
        discountRatePct: true,
        negotiationEnabled: true,
        negotiationMinPct: true,
        negotiationMaxPct: true,
        active: true
      }
    });

    if (!currentHotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Update hotel
    const updatedHotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        ...validUpdates,
        updatedAt: new Date()
      }
    });

    // Create audit trail entries for price changes
    const auditEntries = [];
    
    if (validUpdates.shelfPriceNGN && validUpdates.shelfPriceNGN !== currentHotel.shelfPriceNGN) {
      auditEntries.push({
        hotelId,
        field: 'shelfPriceNGN',
        oldValue: currentHotel.shelfPriceNGN.toString(),
        newValue: validUpdates.shelfPriceNGN.toString(),
        changedBy: 'admin', // TODO: Get from authenticated user
        changedAt: new Date()
      });
    }
    
    if (validUpdates.discountRatePct && validUpdates.discountRatePct !== currentHotel.discountRatePct) {
      auditEntries.push({
        hotelId,
        field: 'discountRatePct',
        oldValue: currentHotel.discountRatePct?.toString() || '0',
        newValue: validUpdates.discountRatePct.toString(),
        changedBy: 'admin',
        changedAt: new Date()
      });
    }

    // Store audit trail in database (assuming we add an AuditLog model)
    // For now, just log to console
    if (auditEntries.length > 0) {
      console.log('Hotel pricing audit trail:', auditEntries);
    }

    return NextResponse.json({
      success: true,
      hotel: {
        id: updatedHotel.id,
        name: currentHotel.name,
        updatedFields: Object.keys(validUpdates),
        oldValues: {
          shelfPriceNGN: currentHotel.shelfPriceNGN,
          discountRatePct: currentHotel.discountRatePct,
          negotiationEnabled: currentHotel.negotiationEnabled
        },
        newValues: validUpdates,
        updatedAt: updatedHotel.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating hotel pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}