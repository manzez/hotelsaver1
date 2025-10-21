import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 })
    }

    const signature = req.headers.get('x-paystack-signature') || ''
    const rawBody = await req.text()
    const computed = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')

    if (!signature || signature !== computed) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const reference: string | undefined = payload?.data?.reference
    const status: string | undefined = payload?.data?.status
    const paid = status === 'success'

    if (reference) {
      try {
        const db = prisma as any
        await db.paymentIntent.update({
          where: { reference },
          data: {
            status: paid ? 'PAID' : 'FAILED',
            paidAt: paid ? new Date() : null,
            raw: payload,
          }
        })
      } catch (e) {
        console.warn('PaymentIntent webhook update failed:', e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'server-error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
