import { Resend } from 'resend'
import type { NextRequest } from 'next/server'

type BookingPayload = {
  bookingId: string
  propertyId?: string
  city?: string
  checkIn?: string
  checkOut?: string
  rooms?: number | string
  adults?: number | string
  children?: number | string
  negotiatedPrice?: number
  originalPrice?: number
  price?: number
  contact?: { name?: string; email?: string; phone?: string }
  name?: string
  email?: string
  phone?: string
  paymentMethod?: string
  [k: string]: any
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'HotelSaver.ng <no-reply@hotelsaver.ng>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function naira(n?: number) {
  if (!n || !Number.isFinite(n)) return ''
  return `₦${Math.round(n).toLocaleString()}`
}

function safe(val: any) {
  return typeof val === 'string' ? val : val == null ? '' : String(val)
}

function deriveGuestSummary(p: BookingPayload) {
  const a = Number(p.adults || 0)
  const c = Number(p.children || 0)
  const r = Number(p.rooms || 1)
  const parts = [
    `${a || 0} adult${a === 1 ? '' : 's'}`,
    c ? `${c} child${c === 1 ? '' : 'ren'}` : null,
    `${r || 1} room${r === 1 ? '' : 's'}`,
  ].filter(Boolean)
  return parts.join(', ')
}

function bookingHtml(payload: BookingPayload, audience: 'user' | 'admin' | 'hotel') {
  const guestSummary = deriveGuestSummary(payload)
  const ci = safe(payload.checkIn)
  const co = safe(payload.checkOut)
  const price = payload.negotiatedPrice ?? payload.price ?? payload.originalPrice
  const priceLine = price ? naira(price) : '—'
  const title =
    audience === 'user'
      ? 'Your booking is confirmed'
      : audience === 'admin'
      ? 'New booking received'
      : 'New booking for your property'

  const contactName = payload.contact?.name || payload.name || ''
  const contactEmail = payload.contact?.email || payload.email || ''
  const contactPhone = payload.contact?.phone || payload.phone || ''

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.55; color:#111;">
    <h2 style="margin:0 0 12px;">${title}</h2>
    <p style="margin:0 0 12px;">Booking ID: <strong>${safe(payload.bookingId)}</strong></p>
    <table style="border-collapse:collapse; width:100%; max-width:560px;">
      <tbody>
        <tr><td style="padding:6px 0; width:160px; color:#555;">Property</td><td style="padding:6px 0;">${safe(payload.propertyId)}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">City</td><td style="padding:6px 0;">${safe(payload.city)}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Check‑in</td><td style="padding:6px 0;">${ci || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Check‑out</td><td style="padding:6px 0;">${co || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Guests</td><td style="padding:6px 0;">${guestSummary}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Price</td><td style="padding:6px 0; font-weight:600;">${priceLine}</td></tr>
      </tbody>
    </table>
    <h3 style="margin:16px 0 8px;">Contact</h3>
    <table style="border-collapse:collapse; width:100%; max-width:560px;">
      <tbody>
        <tr><td style="padding:6px 0; width:160px; color:#555;">Name</td><td style="padding:6px 0;">${safe(contactName) || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Email</td><td style="padding:6px 0;">${safe(contactEmail) || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#555;">Phone</td><td style="padding:6px 0;">${safe(contactPhone) || '—'}</td></tr>
      </tbody>
    </table>
    <p style="margin:16px 0 0; color:#444;">Thank you for choosing HotelSaver.ng.</p>
  </div>
  `
}

function resolveHotelEmail(propertyId?: string): string | null {
  if (!propertyId) return null
  try {
    // Optional mapping file: lib/hotel-contacts.json { "hotel-id": "email@hotel.com" }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mapping = require('../lib/hotel-contacts.json') as Record<string, string>
    const email = mapping[propertyId]
    return email || null
  } catch {
    return null
  }
}

export async function sendBookingEmails(payload: BookingPayload) {
  const resend = getResend()
  const toUser = payload.contact?.email || payload.email
  const toAdmin = ADMIN_EMAIL || ''
  const toHotel = resolveHotelEmail(payload.propertyId || '') || ''

  const tasks: Array<Promise<any>> = []

  const send = async (to: string, subject: string, html: string) => {
    if (!to) return
    if (!resend) {
      console.log('[email:dry-run]', { to, subject })
      return
    }
    try {
      await resend.emails.send({ from: EMAIL_FROM, to, subject, html })
    } catch (e) {
      console.error('[email:send:error]', subject, to, e)
    }
  }

  if (toUser) {
    tasks.push(send(toUser, `Booking confirmed — ${payload.bookingId}`, bookingHtml(payload, 'user')))
  }
  if (toAdmin) {
    tasks.push(send(toAdmin, `New booking — ${payload.bookingId}`, bookingHtml(payload, 'admin')))
  }
  if (toHotel) {
    tasks.push(send(toHotel, `New booking for your property — ${payload.bookingId}`, bookingHtml(payload, 'hotel')))
  } else if (toAdmin) {
    // Fallback: if we don't have hotel email, CC admin only (already above).
  }

  await Promise.allSettled(tasks)
}

// === Transactional (Activation / Password Reset) ===

const emailRateBucket: Map<string, { count: number; resetAt: number }> = new Map()

function canSendTo(email: string, maxPerWindow = 5, windowMs = 10 * 60 * 1000) {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const cur = emailRateBucket.get(key)
  if (!cur || now > cur.resetAt) {
    emailRateBucket.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (cur.count >= maxPerWindow) return false
  cur.count++
  return true
}

async function sendWithRetry(args: { to: string; subject: string; html: string }, attempts = 3) {
  const resend = getResend()
  if (!resend) {
    console.log('[email:dry-run:tx]', { to: args.to, subject: args.subject })
    return
  }
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      await resend.emails.send({ from: EMAIL_FROM, ...args })
      return
    } catch (e) {
      lastErr = e
      await new Promise(r => setTimeout(r, 300 * (i + 1)))
    }
  }
  console.error('[email:tx:error]', args.subject, args.to, lastErr)
}

function activationHtml(link: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.55; color:#111;">
    <h2 style="margin:0 0 12px;">Confirm your email</h2>
    <p style="margin:0 0 12px;">Click the button below to activate your account on HotelSaver.ng.</p>
    <p style="margin:16px 0;"><a href="${link}" style="display:inline-block; background:#009739; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Activate account</a></p>
    <p style="margin:12px 0; font-size:12px; color:#555;">If the button doesn't work, copy and paste this link: <br/><span style="word-break:break-all;">${link}</span></p>
  </div>`
}

function passwordResetHtml(link: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.55; color:#111;">
    <h2 style="margin:0 0 12px;">Reset your password</h2>
    <p style="margin:0 0 12px;">We received a request to reset your password. Click the button below to continue.</p>
    <p style="margin:16px 0;"><a href="${link}" style="display:inline-block; background:#009739; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Reset password</a></p>
    <p style="margin:12px 0; font-size:12px; color:#555;">If the button doesn't work, copy and paste this link: <br/><span style="word-break:break-all;">${link}</span></p>
  </div>`
}

export async function sendActivationEmail(email: string, link: string) {
  if (!canSendTo(email)) throw new Error('rate-limited')
  await sendWithRetry({ to: email, subject: 'Activate your HotelSaver.ng account', html: activationHtml(link) })
}

export async function sendPasswordResetEmail(email: string, link: string) {
  if (!canSendTo(email)) throw new Error('rate-limited')
  await sendWithRetry({ to: email, subject: 'Reset your HotelSaver.ng password', html: passwordResetHtml(link) })
}

