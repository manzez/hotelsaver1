import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    let payload: any;
    
    // Handle both JSON and FormData
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = {};
      for (const [key, value] of formData.entries()) {
        payload[key] = value;
      }
    } else {
      // Try to parse as JSON by default
      payload = await req.json();
    }

    // Generate unique booking ID
    const bookingId = 'BK' + Date.now();
    
    return NextResponse.json({
      bookingId,
      status: 'confirmed',
      data: payload // Echo submitted data for validation
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format', status: 'error' },
      { status: 400 }
    );
  }
}
