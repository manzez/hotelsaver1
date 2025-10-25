import crypto from 'crypto'

/**
 * Timing-safe string comparison to prevent timing attacks.
 * Compares two strings in constant time (regardless of where they differ).
 * Returns true only if both strings are equal AND same length.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const aLen = Buffer.byteLength(a)
  const bLen = Buffer.byteLength(b)
  
  // If lengths don't match, still do a timing-safe comparison to avoid leaking length
  if (aLen !== bLen) {
    const maxLen = Math.max(aLen, bLen)
    const aBuf = Buffer.alloc(maxLen)
    const bBuf = Buffer.alloc(maxLen)
    Buffer.from(a).copy(aBuf)
    Buffer.from(b).copy(bBuf)
    crypto.timingSafeEqual(aBuf, bBuf).valueOf() // Will throw, caught below
    return false
  }
  
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch (e) {
    // timingSafeEqual throws if buffers are different lengths (already checked above)
    return false
  }
}

/**
 * Timing-safe API key validation
 */
export function validateAdminApiKey(providedKey: string, expectedKey: string): boolean {
  if (!providedKey || !expectedKey) return false
  return timingSafeCompare(providedKey, expectedKey)
}
