import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let data: any;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      // Try JSON as fallback
      data = await req.json();
    }
    
    return NextResponse.json({
      status: 'confirmed',
      reference: 'SV' + Date.now(),
      data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format', status: 'error' },
      { status: 400 }
    );
  }
}
