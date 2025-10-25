import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/tokens'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body?.token || '')
    const newPassword = String(body?.newPassword || '')
    if (!token || newPassword.length < 8) {
      return NextResponse.json({ ok: false, error: 'invalid-input' }, { status: 400 })
    }
    const v = verifyToken<{ email: string; kind: string }>(token)
    if (!v.valid) {
      return NextResponse.json({ ok: false, error: v.reason === 'expired' ? 'expired' : 'invalid-token' }, { status: 400 })
    }
    if (v.payload.kind !== 'password-reset') {
      return NextResponse.json({ ok: false, error: 'invalid-token' }, { status: 400 })
    }
    // TODO: Persist password change in your user database
    // const email = v.payload.email
    // await prisma.user.update({ where: { email }, data: { passwordHash: hash(newPassword) } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[password:reset:error]', e)
    return NextResponse.json({ ok: false, error: 'server-error' }, { status: 500 })
  }
}
