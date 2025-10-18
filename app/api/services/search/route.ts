import { NextRequest, NextResponse } from 'next/server';
import { SERVICES } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const { city = '', query = '' } = await req.json();
    const q = String(query || '').toLowerCase();
    
    const list = SERVICES.filter(s => 
      (!city || s.city === city) && 
      (!q || 
        (s.title && s.title.toLowerCase().includes(q)) || 
        (s.category && s.category.toLowerCase().includes(q))
      )
    );
    
    return NextResponse.json({ results: list.slice(0, 60) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format', results: [] },
      { status: 400 }
    );
  }
}
