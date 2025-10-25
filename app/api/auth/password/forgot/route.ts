import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid-email' }, { status: 400 })
    }
    const base = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const token = createToken({ email, kind: 'password-reset' }, 60 * 60) // 1h
    const link = `${base}/auth/reset?token=${encodeURIComponent(token)}`
    try {
      await sendPasswordResetEmail(email, link)
    } catch (e: any) {
      if (String(e?.message).includes('rate-limited')) {
        return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 })
      }
      throw e
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[password:forgot:error]', e)
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
