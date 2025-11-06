// app/api/admin/migrate-hotels/route.ts - API endpoint for hotel migration
import { NextRequest, NextResponse } from 'next/server';
import { migrateHotelsToDatabase } from '@/scripts/migrate-hotels-to-database';
import { getDatabaseStatus } from '@/lib/hotel-database-service';

// POST /api/admin/migrate-hotels - One-time migration from JSON to database
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
    
    const { action } = await req.json();
    
    if (action === 'status') {
      // Check current database status
      const status = await getDatabaseStatus();
      return NextResponse.json(status);
    }
    
    if (action === 'migrate') {
      console.log('🚀 Starting hotel migration via API...');
      
      // Run the migration
      const result = await migrateHotelsToDatabase();
      
      if (result.success) {
        console.log('✅ Migration completed successfully via API');
        return NextResponse.json({
          message: 'Hotel migration completed successfully',
          ...result
        });
      } else {
        console.error('❌ Migration failed via API:', result.error);
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 500 });
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "status" or "migrate"' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/migrate-hotels - Check migration status
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
    
    const status = await getDatabaseStatus();
    return NextResponse.json({
      ...status,
      message: status.connected 
        ? `Database connected with ${status.activeHotelCount} active hotels`
        : 'Database not connected - migration needed'
    });
    
  } catch (error) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}