import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 })
    }
    const reference = req.nextUrl.searchParams.get('reference')
    if (!reference) {
      return NextResponse.json({ error: 'reference required' }, { status: 400 })
    }

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { 'Authorization': `Bearer ${secret}` }
    })
  const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'verify failed' }, { status: 500 })
    }

    const status: string | undefined = data?.data?.status
    const paid = status === 'success'
    try {
      const db = prisma as any
      await db.paymentIntent.update({
        where: { reference },
        data: {
          status: paid ? 'PAID' : 'FAILED',
          paidAt: paid ? new Date() : null,
          raw: data,
        },
      })
    } catch (e) {
      // Non-fatal if DB not configured
      console.warn('PaymentIntent verify update failed:', e)
    }
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'server-error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
