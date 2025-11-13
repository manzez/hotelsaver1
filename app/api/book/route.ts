import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'
import { HotelBookingConfirmationEmail } from '@/emails/HotelBookingConfirmation';
import { NewBookingNotificationEmail } from '@/emails/NewBookingNotification';
import { verifyNegotiationToken } from '@/lib/negotiation';

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // Zod schema to accept both payment and classic booking shapes
  const ContactSchema = z.object({
    name: z.string().min(1, 'name-required').max(120),
    email: z.string().email('email-invalid').max(160),
    phone: z.string().min(6, 'phone-invalid').max(40),
    address: z.string().max(200).optional().nullable().transform(v => v ?? undefined),
  })

  const BaseSchema = z.object({
    propertyId: z.string().min(1, 'propertyId-required').max(200),
    checkIn: z.string().optional().nullable(),
    checkOut: z.string().optional().nullable(),
    adults: z.union([z.string(), z.number()]).optional().transform(v => Number(v ?? 2) || 2),
    children: z.union([z.string(), z.number()]).optional().transform(v => Number(v ?? 0) || 0),
    rooms: z.union([z.string(), z.number()]).optional().transform(v => Math.max(1, Number(v ?? 1) || 1)),
    pricePerNight: z.union([z.number(), z.string()]).optional().transform(v => Number(v ?? 0) || 0),
    price: z.union([z.number(), z.string()]).optional().transform(v => Number(v ?? 0) || 0),
    total: z.union([z.number(), z.string()]).optional().transform(v => Number(v ?? 0) || 0),
    nights: z.union([z.number(), z.string()]).optional().transform(v => Math.max(1, Number(v ?? 1) || 1)),
    negotiationToken: z.string().optional(),
    paymentMethod: z.string().optional(),
    // Contact can be under different keys
    contact: ContactSchema.optional(),
    customerInfo: ContactSchema.optional(),
    form: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email('email-invalid').optional(),
      phone: z.string().optional(),
    }).optional(),
  })

  const parsed = BaseSchema.safeParse(payload)
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message, code: i.code }))
    return NextResponse.json({ error: 'validation-error', issues }, { status: 400 })
  }

  const data = parsed.data
  const propertyId = String(data.propertyId || '').trim()
  const checkIn = data.checkIn
  const checkOut = data.checkOut
  const adults = data.adults
  const children = data.children
  const rooms = data.rooms
  const pricePerNight = data.pricePerNight || data.price || 0
  const negotiationToken = String(data.negotiationToken || '')
  // Normalize contact from available sources
  const contact = data.contact || data.customerInfo || {
    name: `${data.form?.firstName ?? ''} ${data.form?.lastName ?? ''}`.trim(),
    email: data.form?.email ?? '',
    phone: data.form?.phone ?? '',
  }

  // Basic date sanity checks (optional but helpful)
  const parseDate = (s?: string | null) => {
    if (!s) return undefined
    const d = new Date(s)
    return isNaN(+d) ? undefined : d
  }
  const ci = parseDate(checkIn)
  const co = parseDate(checkOut)
  if ((ci && co) && co.getTime() < ci.getTime()) {
    return NextResponse.json({ error: 'validation-error', issues: [{ path: 'checkOut', message: 'checkOut-before-checkIn' }] }, { status: 400 })
  }
  const ciLabel = ci ? ci.toLocaleDateString() : 'N/A'
  const coLabel = co ? co.toLocaleDateString() : 'N/A'
  // Derive billing fields for email/reporting consistency
  const computedNights = (() => {
    if (!ci || !co) return 1
    const ms = co.getTime() - ci.getTime()
    const n = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
    return n
  })()
  const nightly = Math.round(pricePerNight || 0)
  const subtotal = nightly * computedNights
  const tax = computedNights > 1 ? Math.round(subtotal * 0.075) : 0
  const totalAmount = Number(payload.total) || (subtotal + tax)

  // If a negotiation token is provided, enforce signature, expiry, and price/property match
  if (negotiationToken) {
    const verified = verifyNegotiationToken(negotiationToken)
    if (!verified.ok) {
      return NextResponse.json({ error: 'invalid negotiation token', reason: verified.reason }, { status: 400 })
    }
    if (!propertyId || propertyId !== verified.payload.propertyId) {
      return NextResponse.json({ error: 'mismatched propertyId' }, { status: 400 })
    }
    if (pricePerNight && Math.round(pricePerNight) !== Math.round(verified.payload.discountedTotal)) {
      return NextResponse.json({ error: 'price mismatch' }, { status: 400 })
    }
    // Optionally, we could compute totals from token + nights here if needed
  }

  // Fetch hotel from the database by slug (we preserved legacy JSON id as slug)
  // If database is not available, use static hotel data
  let hotel: any = null;
  try {
    hotel = await prisma.hotel.findUnique({ where: { slug: String(propertyId || '').trim() } });
  } catch (dbError) {
    console.log('Database not available, using static hotel data');
    // Fallback to static hotel data
    const { HOTELS } = await import('@/lib/data');
    hotel = HOTELS.find(h => h.id === propertyId);
    if (hotel) {
      // Add slug field for compatibility
      hotel = { ...hotel, slug: hotel.id };
    }
  }
  
  if (!hotel) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }

  const bookingId = 'BK' + Date.now();

  // Attempt to send emails only if Resend is configured; never block booking on email issues
  if (resend) {
    try {
      // Send confirmation email to customer
      if (contact?.email) {
        await resend.emails.send({
          from: process.env.BOOKINGS_FROM || 'HotelSaver.ng <bookings@hotelsaver.ng>',
          replyTo: process.env.BOOKINGS_INBOX || 'admin@hotelsaver.ng',
          to: contact.email,
          subject: `Your Booking at ${hotel.name} is Confirmed – ${ciLabel}`,
          react: HotelBookingConfirmationEmail({
            customerName: contact?.name || 'Guest',
            hotelName: hotel.name,
            checkInDate: ciLabel,
            checkOutDate: coLabel,
            bookingId,
            city: (hotel as any).city || undefined,
            rooms,
            adults,
            children,
            pricePerNight: nightly,
            nights: computedNights,
            subtotal,
            tax,
            total: totalAmount,
          }),
        });
      }

      // Send notification email to hotel (no email stored in DB yet, fallback to admin inbox)
      const adminInbox = process.env.BOOKINGS_INBOX || 'admin@hotelsaver.ng';
      await resend.emails.send({
        from: process.env.BOOKINGS_FROM || 'HotelSaver.ng <bookings@hotelsaver.ng>',
        to: adminInbox,
        subject: `New Booking ${bookingId} – ${hotel.name} (${ciLabel})`,
        react: NewBookingNotificationEmail({
          hotelName: hotel.name,
          customerName: contact?.name || 'Guest',
          checkInDate: ciLabel,
          checkOutDate: coLabel,
          bookingId,
          propertyId: propertyId,
          rooms,
          adults,
          children,
          pricePerNight: nightly,
          nights: computedNights,
          subtotal,
          tax,
          total: totalAmount,
        }),
      });
    } catch (error) {
      console.error('Email sending error:', error);
      // continue; don't fail the booking
    }
  }

  return NextResponse.json({ bookingId, status: 'confirmed' });
}
