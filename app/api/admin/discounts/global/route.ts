import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/admin/discounts/global - Update global default discount rate
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
    
    const { defaultRate } = await req.json();
    
    if (defaultRate < 0 || defaultRate > 1) {
      return NextResponse.json(
        { error: 'Invalid default rate - must be between 0 and 1' },
        { status: 400 }
      );
    }
    
    // Read current discounts
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    const discountsData = JSON.parse(fs.readFileSync(discountsPath, 'utf8'));
    
    // Update the global default
    discountsData.default = defaultRate;
    
    // Write back to file
    fs.writeFileSync(discountsPath, JSON.stringify(discountsData, null, 2));
    
    return NextResponse.json({
      success: true,
      defaultRate,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating global discount:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}