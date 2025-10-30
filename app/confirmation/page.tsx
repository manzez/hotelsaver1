'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import SafeImage from '@/components/SafeImage'
import { HOTELS } from '@/lib/data'

// Minimal address directory for directions (can be expanded or moved to a shared util)
const HOTEL_ADDRESSES: Record<string, { address: string; landmarks: string; phone: string }> = {
  'eko-hotels-and-suites-lagos': {
    address: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    landmarks: 'Near Tafawa Balewa Square, opposite Lagos Island',
    phone: '+234 1 277 7000'
  },
  'transcorp-hilton-abuja-abuja': {
    address: '1 Aguiyi Ironsi Street, Maitama District, Abuja',
    landmarks: 'Near National Assembly Complex, Central Business District',
    phone: '+234 9 461 0900'
  },
  'golden-tulip-port-harcourt-portharcourt': {
    address: '1 Stadium Road, GRA Phase IV, Port Harcourt',
    landmarks: 'Near Liberation Stadium, Government Residential Area',
    phone: '+234 84 817 777'
  },
  'protea-hotel-owerri-owerri': {
    address: 'Plot 1, Ikenegbu Layout, New Owerri, Imo State',
    landmarks: 'Near Imo State University, New Owerri axis',
    phone: '+234 83 828 888'
  }
}

function naira(n: number) {
  return `₦${Math.round(n).toLocaleString()}`
}
function nightsBetween(checkIn?: string | null, checkOut?: string | null) {
  if (!checkIn || !checkOut) return 0
  const ci = new Date(checkIn)
  const co = new Date(checkOut)
  if (isNaN(+ci) || isNaN(+co)) return 0
  const ms = co.getTime() - ci.getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const [emailSent, setEmailSent] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null)
  
  const bookingId = searchParams.get('bookingId') || ''
  const paymentMethod = searchParams.get('paymentMethod') || ''
  const status = searchParams.get('status') || ''
  const reference = searchParams.get('reference') || ''
  const propertyId = searchParams.get('propertyId') || ''
  const customerName = searchParams.get('name') || ''
  const customerEmail = searchParams.get('email') || ''
  const pricePerNight = Number(searchParams.get('price')) || 0
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const adults = searchParams.get('adults') || '2'
  const children = searchParams.get('children') || '0'
  const rooms = searchParams.get('rooms') || '1'

  const hotel = useMemo(() => HOTELS.find(h => h.id === propertyId), [propertyId])
  const [paidAt, setPaidAt] = useState<string | null>(null)
  const hotelInfo = HOTEL_ADDRESSES[propertyId] || { address: '', landmarks: '', phone: '' }
  const nights = useMemo(() => (nightsBetween(checkIn, checkOut) || 1), [checkIn, checkOut])
  const subtotal = pricePerNight * nights
  const tax = nights > 1 ? Math.round(subtotal * 0.075) : 0
  const total = subtotal + tax

  const directionsUrl = useMemo(() => {
    const q = [hotel?.name, hotelInfo.address || hotel?.city].filter(Boolean).join(' ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
  }, [hotel?.name, hotel?.city, hotelInfo.address])

  function fmtDateForGCAL(d?: string | null) {
    if (!d) return ''
    const dt = new Date(d)
    if (isNaN(+dt)) return ''
    const y = dt.getUTCFullYear()
    const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dt.getUTCDate()).padStart(2, '0')
    return `${y}${m}${day}`
  }

  const gcalUrl = useMemo(() => {
    if (!hotel || !checkIn || !checkOut) return ''
    const start = fmtDateForGCAL(checkIn)
    const end = fmtDateForGCAL(checkOut)
    const text = `Stay at ${hotel.name}`
    const details = `Booking ID: ${bookingId}`
    const location = hotelInfo.address || hotel.city
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
  }, [hotel, checkIn, checkOut, hotelInfo.address, bookingId])

  useEffect(() => {
    // Check if email is configured on the server
    let cancelled = false
    const probe = async () => {
      try {
        const res = await fetch('/api/system/email-config', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!cancelled) setEmailConfigured(Boolean(data?.configured))
      } catch {
        if (!cancelled) setEmailConfigured(false)
      }
    }
    probe()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    // Simulate async send only when email is configured
    if (!emailConfigured) return
    const timer = setTimeout(() => setEmailSent(true), 1500)
    return () => clearTimeout(timer)
  }, [emailConfigured])

  // Try to look up paidAt from our server if we have a reference and this was a paid paystack flow
  useEffect(() => {
    let cancelled = false
    const fetchPaidAt = async () => {
      if (paymentMethod !== 'paystack' || status !== 'paid' || !reference) return
      try {
        const res = await fetch(`/api/payments/intent?reference=${encodeURIComponent(reference)}`)
        const data = await res.json().catch(() => ({}))
        const ts = data?.paidAt
        if (!cancelled && ts) setPaidAt(ts)
      } catch {}
    }
    fetchPaidAt()
    return () => { cancelled = true }
  }, [paymentMethod, status, reference])

  const paymentMethodNames: { [key: string]: string } = {
    'paystack': 'Paystack',
    'flutterwave': 'Flutterwave',
    'bank-transfer': 'Bank Transfer',
    'mastercard': 'Mastercard',
    'pay-at-hotel': 'Pay at Hotel'
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Status Icon */}
          <div className="mb-8">
            {paymentMethod === 'paystack' && status === 'failed' ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-red-600">❌</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600">
                  We couldn't complete your payment. No charges were made. You can try again or choose Pay at Hotel.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-green-600">✅</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {customerName ? `Thank you, ${customerName.split(' ')[0]}!` : 'Booking Confirmed!'}
                </h1>
                <h2 className="text-xl font-semibold text-brand-green mb-3">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600">
                  {paymentMethod === 'pay-at-property' 
                    ? 'Your reservation has been secured. Pay when you check in.'
                    : paymentMethod === 'bank-transfer'
                    ? 'Please complete your bank transfer to confirm your reservation.'
                    : 'Payment successful! Your hotel reservation is confirmed.'
                  }
                </p>
              </>
            )}
            {/* Polite thank you with enhanced styling and visibility */}
            {customerName ? (
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                  <span className="text-sm text-gray-700">Thank you,</span>
                  <span className="text-base md:text-lg font-bold text-brand-green">{customerName}</span>
                  <span className="hidden sm:inline text-sm text-gray-700">— we truly appreciate your booking.</span>
                </div>
                <div className="sm:hidden text-xs text-gray-600 mt-2">We truly appreciate your booking.</div>
              </div>
            ) : (
              <div className="mt-3 text-sm font-medium text-gray-700">
                Thank you for choosing HotelSaver.ng. We truly appreciate your booking.
              </div>
            )}

            {/* Email/WhatsApp Notice */}
            {emailConfigured && emailSent && (
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800 text-left max-w-xl mx-auto">
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>Email sent to your inbox.</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span>📱</span>
                  <span>We’ll reach out via WhatsApp if needed.</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Details Card with image */}
          <div className="bg-white rounded-xl shadow-sm p-0 mb-8 overflow-hidden">
            {hotel && (
              <div className="relative h-40 w-full">
                <SafeImage
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&h=800&fit=crop&auto=format&q=80'}
                  alt={hotel.name}
                  className="h-40 w-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&h=800&fit=crop&auto=format&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-lg font-semibold">{hotel.name}</div>
                  <div className="text-sm text-white/90">{hotel.city} • {"★".repeat(hotel.stars)}</div>
                </div>
              </div>
            )}
            <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-brand-green">{bookingId}</span>
                  </div>
                  {customerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">{customerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentMethodNames[paymentMethod] || paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {paymentMethod === 'paystack' && status === 'failed' ? (
                      <span className="text-red-600 font-medium">Payment Failed</span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        {paymentMethod === 'pay-at-hotel' ? 'Reserved' : 'Paid & Confirmed'}
                      </span>
                    )}
                  </div>
                  {hotel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hotel:</span>
                      <span className="font-medium">{hotel.name}</span>
                    </div>
                  )}
                  {checkIn && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{checkIn}</span>
                    </div>
                  )}
                  {checkOut && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{checkOut}</span>
                    </div>
                  )}
                  {(adults || children) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{adults} adults{children !== '0' ? `, ${children} children` : ''}</span>
                    </div>
                  )}
                  {rooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rooms:</span>
                      <span className="font-medium">{rooms}</span>
                    </div>
                  )}
                  {paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium">
                        {paymentMethod === 'pay-at-property' && '🏨 Pay at Property'}
                        {paymentMethod === 'bank-transfer' && '🏦 Bank Transfer'}
                        {paymentMethod === 'paystack' && '💳 Card Payment'}
                      </span>
                    </div>
                  )}
                  {customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-sm">{customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {emailConfigured ? (
                    emailSent ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Confirmation email sent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span>Hotel has been notified</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending confirmation email...</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-brand-green">📱</span>
                      <span>We’ll reach out via WhatsApp with your booking details.</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-brand-green">→</span>
                    <span>{emailConfigured ? 'Check your email for details' : 'Our team will message you shortly'}</span>
                  </div>
                  {paymentMethod === 'pay-at-hotel' && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">💳</span>
                      <span>Bring payment for check-in</span>
                    </div>
                  )}
                  {paymentMethod === 'paystack' && status === 'failed' && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">↩️</span>
                      <span>Return to payment and try another method</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => window.print()} className="btn-ghost">🖨️ Print Confirmation</button>
                  {gcalUrl && (
                    <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">📅 Add to Calendar</a>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {(pricePerNight > 0) && (
              <div className="mt-6 border-t pt-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Price Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate per night:</span>
                    <span className="font-medium">{naira(pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({nights} nights):</span>
                    <span>{naira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (7.5%):</span>
                    <span>{naira(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>{naira(total)}</span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              Important Information
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Check-in time: 2:00 PM | Check-out time: 12:00 PM</p>
              <p>• Please bring a valid ID for check-in</p>
              {/* Booking journey does not use negotiation */}
              {paymentMethod === 'pay-at-hotel' && (
                <p>• Payment can be made by cash or card at the hotel</p>
              )}
              <p>• Free cancellation up to 24 hours before check-in</p>
            </div>
          </div>

          {/* Directions & Share */}
          {hotel && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Directions to {hotel.name}</h3>
              {hotelInfo.address && (
                <>
                  <div className="text-sm font-medium text-gray-700 mb-1">Hotel: {hotel.name}</div>
                  <p className="text-sm text-gray-700">{hotelInfo.address}</p>
                  {hotelInfo.landmarks && (
                    <p className="text-xs text-gray-500 mt-1">Near: {hotelInfo.landmarks}</p>
                  )}
                </>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary sm:flex-1 text-center">🗺️ Get Directions</a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Directions to ${hotel.name}: ${directionsUrl}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-ghost sm:flex-1 text-center"
                >
                  📱 Share via WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Directions to ${hotel.name}`)}&body=${encodeURIComponent(`Here are the directions to ${hotel.name}:
${directionsUrl}
${hotelInfo.address ? `Address: ${hotelInfo.address}` : ''}`)}`}
                  className="btn-ghost sm:flex-1 text-center"
                >
                  ✉️ Share via Email
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directionsUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-ghost sm:flex-1 text-center"
                >
                  👍 Share on Facebook
                </a>
              </div>
            </div>
          )}

          {/* Customer Support */}
          <div className="bg-gray-100 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-3">
              <a 
                href="https://wa.me/2347077775545" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="text-xl">📱</span>
                Contact us on WhatsApp
              </a>
              <p className="text-sm text-gray-600">
                Our customer support team is available 24/7 to assist you
              </p>
              {hotelInfo.phone && (
                <p className="text-sm text-gray-700">Hotel phone: <span className="font-medium">{hotelInfo.phone}</span></p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {paymentMethod === 'paystack' && status === 'failed' ? (
              <>
                <Link
                  href={`/payment?propertyId=${propertyId}`}
                  className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
                >
                  Retry Payment
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Back to Home
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
                >
                  Book Another Hotel
                </Link>
                <Link
                  href="/services"
                  className="flex-1 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-dark transition-colors text-center"
                >
                  Book Local Services
                </Link>
              </>
            )}
          </div>

          {/* Booking ID Reference */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Save your booking ID:</strong> <span className="font-mono">{bookingId}</span>
              <br />
              You'll need this for any inquiries about your reservation.
            </p>
          </div>
        </div>
      </div>

            {/* Payment Receipt (Paystack paid) */}
            {paymentMethod === 'paystack' && status === 'paid' && (
              <div className="mt-6 border-t pt-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">Paystack</span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono">{reference}</span>
                    </div>
                  )}
                  {paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid at:</span>
                      <span className="font-medium">{new Date(paidAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading confirmation...</div>}>
      <ConfirmationPageContent />
    </Suspense>
  );
}