import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyNegotiationToken } from '@/lib/negotiation'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 })
    }

    const origin = req.nextUrl.origin
    const body = await req.json().catch(() => ({})) as {
      amount: number
      email: string
      context?: Record<string, string>
    }

    const amount = Number(body.amount) || 0
    const email = String(body.email || '')
    const context = body.context || {}

    if (!amount || !email) {
      return NextResponse.json({ error: 'amount and email required' }, { status: 400 })
    }

    // Verify negotiation token in context before proceeding
    const token = String(context?.negotiationToken || '')
    const verified = verifyNegotiationToken(token)
    if (!verified.ok) {
      return NextResponse.json({ error: 'invalid negotiation token', reason: verified.reason }, { status: 400 })
    }

    // Optional sanity: ensure context contains same propertyId
    if (context?.propertyId && context.propertyId !== verified.payload.propertyId) {
      return NextResponse.json({ error: 'mismatched propertyId' }, { status: 400 })
    }

    const qs = new URLSearchParams(context).toString()
    const redirect_url = `${origin}/payment/callback${qs ? `?${qs}` : ''}`

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // kobo
        email,
        callback_url: redirect_url,
      })
    })

  const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'Paystack init failed' }, { status: 500 })
    }

    const authUrl: string | undefined = data?.data?.authorization_url
    const reference: string | undefined = data?.data?.reference

    if (!authUrl) {
      return NextResponse.json({ error: 'authorization_url missing' }, { status: 500 })
    }

    // Persist minimal intent for later reconciliation
    try {
      const db = prisma as any
      await db.paymentIntent.upsert({
        where: { reference: reference || 'no-ref' },
        update: {
          amountNGN: Math.round(amount),
          email,
          context,
          status: 'INITIATED',
          provider: 'Paystack'
        },
        create: {
          amountNGN: Math.round(amount),
          email,
          context,
          status: 'INITIATED',
          provider: 'Paystack',
          reference: reference,
          propertyId: context.propertyId || undefined,
        }
      })
    } catch (e) {
      // Non-fatal: DB might be unavailable in some environments
      console.warn('PaymentIntent upsert failed:', e)
    }

    return NextResponse.json({ authorization_url: authUrl, reference })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'server-error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
