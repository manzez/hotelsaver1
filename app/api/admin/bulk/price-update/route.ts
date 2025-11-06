import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// POST /api/admin/bulk/price-update - Execute bulk price updates
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
    
    const { mode, adjustment, cities, stars } = await req.json();
    
    if (!mode || !adjustment || (cities.length === 0 && stars.length === 0)) {
      return NextResponse.json(
        { error: 'Invalid parameters: mode, adjustment, and selection criteria required' },
        { status: 400 }
      );
    }
    
    // Read current hotels data
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
    
    // Filter hotels based on criteria
    let targetHotels = hotels.filter((hotel: any) => {
      const cityMatch = cities.length === 0 || cities.includes(hotel.city);
      const starMatch = stars.length === 0 || stars.includes(hotel.stars);
      return cityMatch && starMatch;
    });
    
    // Apply price updates
    let updatedCount = 0;
    const updateLog: Array<{hotelId: string, hotelName: string, oldPrice: number, newPrice: number}> = [];
    
    targetHotels.forEach((hotel: any) => {
      const oldPrice = hotel.basePriceNGN || 0;
      let newPrice: number;
      
      if (mode === 'percentage') {
        // Percentage adjustment: +10% = 1.10, -5% = 0.95
        const multiplier = 1 + (adjustment / 100);
        newPrice = Math.round(oldPrice * multiplier);
      } else {
        // Fixed price mode
        newPrice = Math.round(adjustment);
      }
      
      // Apply minimum price threshold (₦10,000)
      newPrice = Math.max(newPrice, 10000);
      
      if (newPrice !== oldPrice) {
        // Find the hotel in the original array and update it
        const hotelIndex = hotels.findIndex((h: any) => h.id === hotel.id);
        if (hotelIndex !== -1) {
          hotels[hotelIndex].basePriceNGN = newPrice;
          hotels[hotelIndex].updatedAt = new Date().toISOString();
          
          updateLog.push({
            hotelId: hotel.id,
            hotelName: hotel.name,
            oldPrice,
            newPrice
          });
          
          updatedCount++;
        }
      }
    });
    
    if (updatedCount > 0) {
      // Create backup before saving
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(process.cwd(), `lib.hotels.backup.bulk-price-${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(hotels, null, 2));
      
      // Save updated hotels data
      fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2));
      
      // Log the bulk operation
      const logEntry = {
        timestamp: new Date().toISOString(),
        operation: 'bulk_price_update',
        mode,
        adjustment,
        criteria: { cities, stars },
        affectedHotels: updatedCount,
        totalTargeted: targetHotels.length,
        updateLog: updateLog.slice(0, 10) // Log first 10 for reference
      };
      
      // Save operation log (optional)
      const logsPath = path.join(process.cwd(), 'data', 'bulk-operations.log');
      try {
        fs.appendFileSync(logsPath, JSON.stringify(logEntry) + '\n');
      } catch (error) {
        console.warn('Could not write to operations log:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      affectedHotels: updatedCount,
      totalTargeted: targetHotels.length,
      mode,
      adjustment,
      criteria: { cities, stars },
      updateLog: updateLog.slice(0, 5), // Return first 5 updates as examples
      backupCreated: updatedCount > 0,
      executedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in bulk price update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}