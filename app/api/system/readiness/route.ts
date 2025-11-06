import { NextResponse } from 'next/server'

export async function GET() {
  const ga = Boolean(process.env.NEXT_PUBLIC_GA_ID)
  const baseUrl = Boolean(process.env.NEXT_PUBLIC_BASE_URL)
  const negotiationSecret = Boolean(process.env.NEGOTIATION_SECRET)
  const resend = Boolean(process.env.RESEND_API_KEY)
  const bookingsFrom = Boolean(process.env.BOOKINGS_FROM)
  const bookingsInbox = Boolean(process.env.BOOKINGS_INBOX)
  const db = Boolean(process.env.DATABASE_URL)
  const sentry = Boolean(process.env.SENTRY_DSN)

  return NextResponse.json({
    ga,
    baseUrl,
    negotiationSecret,
    resend,
    bookingsFrom,
    bookingsInbox,
    db,
    sentry
  })
}
