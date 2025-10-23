import { NextRequest, NextResponse } from 'next/server';
import { verifyNegotiationToken } from '@/lib/negotiation'

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

    // Verify negotiation token
    const token = String(payload?.negotiationToken || '')
    const verified = verifyNegotiationToken(token)
    if (!verified.ok) {
      return NextResponse.json(
        { status: 'no-offer', reason: verified.reason || 'invalid-token' },
        { status: 400 }
      )
    }

    // Optional: ensure propertyId matches token
    if (payload?.propertyId && payload.propertyId !== verified.payload.propertyId) {
      return NextResponse.json(
        { status: 'no-offer', reason: 'mismatched-property' },
        { status: 400 }
      )
    }

    // We trust the discountedTotal from the signed token
    payload.negotiatedPrice = verified.payload.discountedTotal
    payload.originalPrice = verified.payload.baseTotal

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
