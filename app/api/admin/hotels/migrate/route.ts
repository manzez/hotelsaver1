// app/api/admin/hotels/migrate/route.ts - API endpoint to trigger database migration
import { NextRequest, NextResponse } from 'next/server';
import { migrateHotelsToDatabase, rollbackMigration, validateMigration } from '@/lib/hotel-db-migration';

// POST /api/admin/hotels/migrate - Migrate hotels from JSON to database
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
    
    switch (action) {
      case 'migrate':
        const migrateResult = await migrateHotelsToDatabase();
        return NextResponse.json(migrateResult);
        
      case 'rollback':
        const rollbackResult = await rollbackMigration();
        return NextResponse.json(rollbackResult);
        
      case 'validate':
        const validateResult = await validateMigration();
        return NextResponse.json(validateResult);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: migrate, rollback, or validate' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}