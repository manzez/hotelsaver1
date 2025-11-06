import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key') || ''
  const expectedKey = process.env.ADMIN_API_KEY || ''
  
  console.log('Test endpoint - Received key:', adminKey.substring(0, 10) + '...')
  console.log('Test endpoint - Expected key:', expectedKey.substring(0, 10) + '...')
  console.log('Test endpoint - Environment loaded:', !!expectedKey)
  
  return NextResponse.json({
    success: true,
    keyReceived: !!adminKey,
    keyValid: adminKey === expectedKey,
    environmentLoaded: !!expectedKey,
    message: 'Admin authentication test endpoint'
  })
}