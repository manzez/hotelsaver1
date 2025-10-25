import crypto from 'node:crypto'

export type NegotiationPayload = {
  propertyId: string
  baseTotal: number
  discountedTotal: number
  discountRate: number
  expiresAt: number // epoch ms
}

function getSecret(): string {
  const s = process.env.NEGOTIATION_SECRET || process.env.NEXTAUTH_SECRET || ''
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: NEGOTIATION_SECRET or NEXTAUTH_SECRET required in production')
    }
    // Dev fallback only
    return 'dev-only-secret-change-in-prod'
  }
  return s
}

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function signNegotiationOffer(payload: NegotiationPayload): string {
  const secret = getSecret()
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = b64url(JSON.stringify(header))
  const p = b64url(JSON.stringify(payload))
  const data = `${h}.${p}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  const s = b64url(sig)
  return `${data}.${s}`
}

export function verifyNegotiationToken(token?: string):
  | { ok: true; payload: NegotiationPayload }
  | { ok: false; reason: string } {
  if (!token || typeof token !== 'string') return { ok: false, reason: 'missing-token' }
  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, reason: 'malformed-token' }
  const [h, p, s] = parts
  try {
    const secret = getSecret()
    const data = `${h}.${p}`
    const expected = b64url(crypto.createHmac('sha256', secret).update(data).digest())
    // timing-safe compare
    const a = Buffer.from(s)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: 'bad-signature' }
    }
    const payload = JSON.parse(fromB64url(p).toString('utf8')) as NegotiationPayload
    if (!payload || typeof payload.expiresAt !== 'number') {
      return { ok: false, reason: 'invalid-payload' }
    }
    if (Date.now() > payload.expiresAt) {
      return { ok: false, reason: 'expired' }
    }
    if (!payload.propertyId || typeof payload.discountedTotal !== 'number') {
      return { ok: false, reason: 'invalid-payload' }
    }
    return { ok: true, payload }
  } catch (e) {
    return { ok: false, reason: 'invalid-token' }
  }
}
