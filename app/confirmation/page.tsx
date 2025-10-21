'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { HOTELS } from '@/lib/data'

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
  
  const bookingId = searchParams.get('bookingId') || ''
  const paymentMethod = searchParams.get('paymentMethod') || ''
  const propertyId = searchParams.get('propertyId') || ''
  const negotiatedPrice = Number(searchParams.get('price')) || 0
  const originalPriceParam = Number(searchParams.get('originalPrice')) || 0
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const adults = searchParams.get('adults') || '2'
  const children = searchParams.get('children') || '0'
  const rooms = searchParams.get('rooms') || '1'

  const hotel = useMemo(() => HOTELS.find(h => h.id === propertyId), [propertyId])
  const originalPrice = originalPriceParam || (typeof hotel?.basePriceNGN === 'number' ? hotel.basePriceNGN : negotiatedPrice)
  const nights = useMemo(() => (nightsBetween(checkIn, checkOut) || 1), [checkIn, checkOut])
  const subtotal = negotiatedPrice * nights
  const tax = nights > 1 ? Math.round(subtotal * 0.075) : 0
  const total = subtotal + tax
  const savings = Math.max(0, originalPrice - negotiatedPrice)

  useEffect(() => {
    // Simulate sending confirmation email
    const timer = setTimeout(() => {
      setEmailSent(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const paymentMethodNames: { [key: string]: string } = {
    'paystack': 'Paystack',
    'flutterwave': 'Flutterwave',
    'bank-transfer': 'Bank Transfer',
    'mastercard': 'Mastercard',
    'pay-at-hotel': 'Pay at Hotel'
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-green-600">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">
              {paymentMethod === 'pay-at-hotel' 
                ? 'Your reservation has been secured. Pay when you check in.'
                : 'Payment successful! Your hotel reservation is confirmed.'
              }
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-brand-green">{bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentMethodNames[paymentMethod] || paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">
                      {paymentMethod === 'pay-at-hotel' ? 'Reserved' : 'Paid & Confirmed'}
                    </span>
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
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {emailSent ? (
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
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-brand-green">→</span>
                    <span>Check your email for details</span>
                  </div>
                  {paymentMethod === 'pay-at-hotel' && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">💳</span>
                      <span>Bring payment for check-in</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary (if context present) */}
            {(negotiatedPrice > 0) && (
              <div className="mt-6 border-t pt-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Price Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original price:</span>
                    <span className="line-through text-gray-500">{naira(originalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Negotiated price:</span>
                    <span className="font-medium">{naira(negotiatedPrice)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You saved:</span>
                    <span className="font-bold">{naira(savings)}</span>
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

          {/* Important Information */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              Important Information
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Check-in time: 2:00 PM | Check-out time: 12:00 PM</p>
              <p>• Please bring a valid ID for check-in</p>
              <p>• Your negotiated rate is locked and guaranteed</p>
              {paymentMethod === 'pay-at-hotel' && (
                <p>• Payment can be made by cash or card at the hotel</p>
              )}
              <p>• Free cancellation up to 24 hours before check-in</p>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-gray-100 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-3">
              <a 
                href="https://wa.me/2347077775545" 
                target="_blank"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="text-xl">📱</span>
                Contact us on WhatsApp
              </a>
              <p className="text-sm text-gray-600">
                Our customer support team is available 24/7 to assist you
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Book Another Hotel
            </Link>
            <Link
              href="/services"
              className="flex-1 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              Book Local Services
            </Link>
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