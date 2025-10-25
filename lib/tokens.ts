import crypto from 'crypto'

type TokenPayload = Record<string, any>

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input))
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function b64urlDecode(input: string) {
  const pad = 4 - (input.length % 4 || 4)
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad)
  return Buffer.from(base64, 'base64')
}

export function createToken(payload: TokenPayload, expiresInSeconds: number, secret = process.env.NEXTAUTH_SECRET || process.env.EMAIL_TOKEN_SECRET || 'change-me') {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const withExp = { ...payload, iat: now, exp: now + Math.max(60, expiresInSeconds) }
  const h = b64url(JSON.stringify(header))
  const p = b64url(JSON.stringify(withExp))
  const data = `${h}.${p}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  return `${data}.${b64url(sig)}`
}

export function verifyToken<T extends TokenPayload = TokenPayload>(token: string, secret = process.env.NEXTAUTH_SECRET || process.env.EMAIL_TOKEN_SECRET || 'change-me'):
  | { valid: true; payload: T }
  | { valid: false; reason: 'invalid' | 'expired' } {
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return { valid: false, reason: 'invalid' }
    const data = `${h}.${p}`
    const expected = b64url(crypto.createHmac('sha256', secret).update(data).digest())
    if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return { valid: false, reason: 'invalid' }
    const payload = JSON.parse(b64urlDecode(p).toString())
    if (typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) > payload.exp) {
      return { valid: false, reason: 'expired' }
    }
    return { valid: true, payload }
  } catch {
    return { valid: false, reason: 'invalid' }
  }
}
