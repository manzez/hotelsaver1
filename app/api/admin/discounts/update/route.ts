import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// PUT /api/admin/discounts/update - Update individual hotel discount
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
    
    const { hotelId, discountRate } = await req.json();
    
    if (!hotelId || discountRate < 0 || discountRate > 1) {
      return NextResponse.json(
        { error: 'Invalid hotel ID or discount rate' },
        { status: 400 }
      );
    }
    
    // Read current discounts
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    const discountsData = JSON.parse(fs.readFileSync(discountsPath, 'utf8'));
    
    // Update the specific hotel override
    discountsData.overrides = discountsData.overrides || {};
    discountsData.overrides[hotelId] = discountRate;
    
    // Write back to file
    fs.writeFileSync(discountsPath, JSON.stringify(discountsData, null, 2));
    
    return NextResponse.json({
      success: true,
      hotelId,
      discountRate,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating hotel discount:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}