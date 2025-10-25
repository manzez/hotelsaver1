import { NextResponse } from 'next/server'

export async function GET() {
  const configured = Boolean(process.env.RESEND_API_KEY)
  const whatsapp = 'https://wa.me/2347077775545'
  return NextResponse.json({ configured, whatsapp })
}
