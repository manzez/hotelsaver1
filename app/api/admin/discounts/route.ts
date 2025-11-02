import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Admin authentication middleware
function validateAdminKey(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || '';
  const expected = process.env.ADMIN_API_KEY || 'your-secret-admin-key';
  
  if (!expected) {
    throw new Error('Admin API key not configured');
  }
  
  if (!key) {
    throw new Error('Admin API key required');
  }
  
  if (key !== expected) {
    throw new Error('Invalid admin API key');
  }
}

// GET /api/admin/discounts - Retrieve current discount configuration
export async function GET(req: NextRequest) {
  try {
    validateAdminKey(req);
    
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    const discountsData = JSON.parse(fs.readFileSync(discountsPath, 'utf8'));
    
    // Transform overrides into admin-friendly format
    const overrides = Object.entries(discountsData.overrides || {}).map(([hotelId, rate]) => ({
      hotelId,
      discountRate: rate as number,
      campaignName: 'Custom Discount',
      validFrom: null,
      validTo: null
    }));
    
    return NextResponse.json({
      success: true,
      default: discountsData.default || 0.15,
      overrides: overrides,
      totalOverrides: overrides.length
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('key') ? 401 : 500 }
    );
  }
}

// POST /api/admin/discounts - Create or update discount overrides  
export async function POST(req: NextRequest) {
  try {
    validateAdminKey(req);
    
    const body = await req.json();
    const { action, hotelId, discountRate, campaignData } = body;
    
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    const discountsData = JSON.parse(fs.readFileSync(discountsPath, 'utf8'));
    
    switch (action) {
      case 'set-hotel-discount':
        if (!hotelId || discountRate < 0 || discountRate > 1) {
          throw new Error('Invalid hotel ID or discount rate');
        }
        
        discountsData.overrides = discountsData.overrides || {};
        discountsData.overrides[hotelId] = discountRate;
        break;
        
      case 'remove-hotel-discount':
        if (!hotelId) {
          throw new Error('Hotel ID required');
        }
        
        if (discountsData.overrides && discountsData.overrides[hotelId]) {
          delete discountsData.overrides[hotelId];
        }
        break;
        
      case 'set-global-default':
        if (discountRate < 0 || discountRate > 1) {
          throw new Error('Invalid global discount rate');
        }
        
        discountsData.default = discountRate;
        break;
        
      case 'bulk-update':
        const { cityDiscounts, hotelDiscounts } = body;
        
        if (cityDiscounts) {
          // Apply discounts to all hotels in specific cities
          const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
          const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
          
          Object.entries(cityDiscounts).forEach(([city, rate]) => {
            const cityHotels = hotels.filter((h: any) => h.city === city);
            cityHotels.forEach((hotel: any) => {
              discountsData.overrides[hotel.id] = rate;
            });
          });
        }
        
        if (hotelDiscounts) {
          // Apply individual hotel discounts
          Object.entries(hotelDiscounts).forEach(([hotelId, rate]) => {
            discountsData.overrides[hotelId] = rate;
          });
        }
        break;
        
      case 'seasonal-campaign':
        const { name, cityFilter, discountAmount, validFrom, validTo } = campaignData;
        
        // For seasonal campaigns, we apply discounts to filtered hotels
        const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
        const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
        
        let filteredHotels = hotels;
        if (cityFilter && cityFilter !== 'all') {
          filteredHotels = hotels.filter((h: any) => h.city === cityFilter);
        }
        
        filteredHotels.forEach((hotel: any) => {
          discountsData.overrides[hotel.id] = discountAmount;
        });
        
        // TODO: Store campaign metadata in separate file/database
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Write updated discounts back to file
    fs.writeFileSync(discountsPath, JSON.stringify(discountsData, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Discount ${action} completed successfully`,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message.includes('key') ? 401 : 400 }
    );
  }
}