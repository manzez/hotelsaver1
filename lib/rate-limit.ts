type Bucket = { tokens: number; lastRefill: number }

const buckets = new Map<string, Bucket>()

/**
 * Simple token bucket limiter kept in module memory. Suitable as a soft guard
 * in serverless; may reset between invocations. Return true to allow.
 */
export function allowIp(ip: string, opts?: { capacity?: number; refillPerSec?: number }) {
  const capacity = opts?.capacity ?? 12 // max tokens
  const refillPerSec = opts?.refillPerSec ?? 0.2 // 1 token every 5s (~12/min)
  const now = Date.now()
  const b = buckets.get(ip) || { tokens: capacity, lastRefill: now }
  // Refill tokens
  const elapsed = (now - b.lastRefill) / 1000
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec)
  b.lastRefill = now

  if (b.tokens >= 1) {
    b.tokens -= 1
    buckets.set(ip, b)
    return { allowed: true, remaining: Math.floor(b.tokens) }
  }
  buckets.set(ip, b)
  return { allowed: false, remaining: Math.floor(b.tokens) }
}
