import { NextRequest, NextResponse } from 'next/server';
import { listServices } from '@/lib/services-source';

export async function POST(req: NextRequest) {
  try {
    const { city = '', query = '' } = await req.json();
    const results = await listServices({ city, query, limit: 60 });
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format', results: [] },
      { status: 400 }
    );
  }
}
