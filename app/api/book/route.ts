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

    // Payment method determines token enforcement:
    // - Online providers (e.g., paystack) require a valid negotiation token
    // - Pay-at-hotel and preliminary book steps are allowed without a token
    const paymentMethod = String(payload?.paymentMethod || '')
    const token = String(payload?.negotiationToken || '')
    const hasToken = !!token
    const onlineProviders = new Set(['paystack', 'flutterwave', 'bank-transfer', 'mastercard'])

    if (onlineProviders.has(paymentMethod)) {
      const verified = verifyNegotiationToken(token)
      if (!verified.ok) {
        return NextResponse.json(
          { status: 'no-offer', reason: verified.reason || 'invalid-token' },
          { status: 400 }
        )
      }
      if (payload?.propertyId && payload.propertyId !== verified.payload.propertyId) {
        return NextResponse.json(
          { status: 'no-offer', reason: 'mismatched-property' },
          { status: 400 }
        )
      }
      // Trust totals from token for online payments
      payload.negotiatedPrice = verified.payload.discountedTotal
      payload.originalPrice = verified.payload.baseTotal
    } else if (hasToken) {
      // If pay-at-hotel flow provides a token, prefer token totals
      const verified = verifyNegotiationToken(token)
      if (verified.ok) {
        payload.negotiatedPrice = verified.payload.discountedTotal
        payload.originalPrice = verified.payload.baseTotal
      }
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
