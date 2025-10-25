import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Verify HMAC-SHA256 signature from Resend webhooks.
// Header may be provided as 'resend-signature' or 'Resend-Signature'.
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string | undefined): boolean {
  if (!secret) return false
  if (!signatureHeader) return false
  // Support formats: 'sha256=abcdef...', 't=..,v1=abcdef..', or raw hex
  let sig = signatureHeader.trim()
  if (sig.includes(',')) {
    // Parse key=value pairs (e.g., t=...,v1=...)
    const parts = Object.fromEntries(sig.split(',').map(kv => kv.split('='))) as Record<string, string>
    sig = parts['v1'] || parts['v'] || ''
  }
  if (sig.startsWith('sha256=')) sig = sig.slice('sha256='.length)
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed))
  } catch {
    return false
  }
}

async function appendEventToFile(event: any) {
  try {
    const dir = path.join(process.cwd(), 'data')
    const file = path.join(dir, 'email-events.log')
    await fs.promises.mkdir(dir, { recursive: true })
    await fs.promises.appendFile(file, JSON.stringify(event) + '\n', 'utf8')
  } catch (e) {
    console.error('[resend:webhook:file-append:error]', e)
  }
}

export async function POST(req: NextRequest) {
  // Read raw text first for signature verification
  const raw = await req.text()
  const signature = req.headers.get('resend-signature') || req.headers.get('Resend-Signature')
  const secret = process.env.RESEND_WEBHOOK_SECRET

  // In production, require valid signature. In dev, log a warning but continue.
  const valid = verifySignature(raw, signature, secret)
  if (!valid && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'invalid-signature' }, { status: 401 })
  }
  if (!valid) {
    console.warn('[resend:webhook] Signature invalid or secret missing; allowing in non-production for testing')
  }

  let payload: any = null
  try {
    payload = JSON.parse(raw)
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 })
  }

  const type: string = payload?.type || 'unknown'
  const createdAt: string = payload?.created_at || new Date().toISOString()
  const data = payload?.data || {}
  const messageId: string = data?.id || data?.message_id || ''
  const to = Array.isArray(data?.to) ? data.to.join(',') : (data?.to || '')
  const subject: string = data?.subject || ''
  const status: string = data?.delivery?.status || data?.status || ''

  const record = {
    ts: new Date().toISOString(),
    provider: 'resend',
    type,
    createdAt,
    messageId,
    to,
    subject,
    status,
    raw: payload,
  }

  // Store to lightweight log file (works locally and in non-ephemeral environments)
  await appendEventToFile(record)

  // Optional DB storage (fallback if model/table not present)
  try {
    const { prisma } = await import('@/lib/prisma')
    // Use any to avoid type errors if Prisma client hasn't generated the model yet
    const p: any = prisma as any
    if (p?.emailEvent?.create) {
      await p.emailEvent.create({
        data: {
          provider: 'resend',
          type,
          messageId,
          to,
          subject,
          status,
          createdAt: new Date(createdAt),
          raw: payload,
        },
      })
    }
  } catch (e) {
    // Silently ignore; file logging still captured
  }

  return new NextResponse(null, { status: 204 })
}

