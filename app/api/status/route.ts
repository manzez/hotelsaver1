import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: 'HotelSaver.ng',
    version: 'v9',
    timestamp: new Date().toISOString(),
  })
}
