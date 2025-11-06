// app/api/admin/hotels/pricing/route.ts - Enhanced pricing management API
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/hotels/pricing - Fetch all hotels with pricing data
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

    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        shelfPriceNGN: true,
        discountRatePct: true,
        negotiationEnabled: true,
        negotiationMinPct: true,
        negotiationMaxPct: true,
        active: true,
        updatedAt: true
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      hotels: hotels.map(hotel => ({
        ...hotel,
        updatedAt: hotel.updatedAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}