import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payments/intent?reference=REF
// Returns minimal status information for a PaymentIntent if available.
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get('reference')
    if (!reference) {
      return NextResponse.json({ error: 'reference required' }, { status: 400 })
    }

    try {
      const db = prisma as any
      const intent = await db.paymentIntent.findUnique({ where: { reference } })
      if (!intent) {
        return NextResponse.json({ ok: false, found: false }, { status: 404 })
      }
      return NextResponse.json({
        ok: true,
        found: true,
        status: intent.status,
        amountNGN: intent.amountNGN,
        currency: intent.currency,
        provider: intent.provider,
        paidAt: intent.paidAt,
        propertyId: intent.propertyId,
        reference: intent.reference,
      })
    } catch (e) {
      // DB not configured; respond gracefully
      return NextResponse.json({ ok: false, found: false, reason: 'db-unavailable' }, { status: 503 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'server-error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
