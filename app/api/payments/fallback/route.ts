import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    
    // Simple fallback booking creation
    const bookingId = `BK${Date.now()}`
    
    // Log the booking attempt (in production, this would go to a database)
    console.log('Fallback booking created:', {
      bookingId,
      timestamp: new Date().toISOString(),
      ...body
    })
    
    return NextResponse.json({
      success: true,
      bookingId,
      status: 'confirmed',
      message: 'Booking confirmed. Please save your booking ID.',
      paymentMethod: body.paymentMethod || 'pay-at-hotel'
    })
    
  } catch (error) {
    console.error('Fallback booking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to process booking',
        message: 'Please try again or contact support.'
      }, 
      { status: 500 }
    )
  }
}