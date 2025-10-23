'use client'

import { useState, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { HOTELS } from '@/lib/data'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'

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

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasPaystack = !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  // Get booking details from URL params
  const propertyId = searchParams.get('propertyId') || ''
  const negotiatedPrice = Number(searchParams.get('price')) || 0
  const negotiationToken = searchParams.get('negotiationToken') || ''
  const hotel = HOTELS.find(h => h.id === propertyId)
  const originalPriceParam = Number(searchParams.get('originalPrice')) || 0
  const originalPrice = originalPriceParam || (typeof hotel?.basePriceNGN === 'number' ? hotel.basePriceNGN : negotiatedPrice)
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const adults = searchParams.get('adults') || '2'
  const children = searchParams.get('children') || '0'
  const rooms = searchParams.get('rooms') || '1'

  const savings = originalPrice - negotiatedPrice

  // Calculate nights and total
  const nights = useMemo(() => (nightsBetween(checkIn, checkOut) || 1), [checkIn, checkOut])
  const subtotal = negotiatedPrice * nights
  const tax = nights > 1 ? Math.round(subtotal * 0.075) : 0 // VAT only for multi-night
  const total = subtotal + tax

  const paymentMethods = [
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Pay with your debit/credit card via Paystack',
      icon: '💳',
      popular: true
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Secure payment with Flutterwave',
      icon: '🌊',
      popular: true
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      description: 'Direct transfer to our Nigerian bank account',
      icon: '🏦',
      popular: false
    },
    {
      id: 'mastercard',
      name: 'Mastercard Direct',
      description: 'Pay directly with your Mastercard',
      icon: '💎',
      popular: false
    },
    {
      id: 'pay-at-hotel',
      name: 'Pay at Hotel',
      description: 'Pay when you check in (cash or card)',
      icon: '🏨',
      popular: true
    }
  ]

  // Hide Paystack option entirely when no public key is configured
  const visibleMethods = useMemo(() => {
    return paymentMethods.filter(m => (m.id === 'paystack' ? hasPaystack : true))
  }, [hasPaystack])

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
        <p className="text-gray-600 mb-8">Invalid booking details. Please start over.</p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  const hasValidToken = Boolean(negotiationToken)

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method')
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required customer information')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

  if (selectedPayment === 'pay-at-hotel') {
        // For pay at hotel, just create the booking
        const bookingResponse = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            negotiatedPrice,
            originalPrice,
            checkIn,
            checkOut,
            adults,
            children,
            rooms,
            negotiationToken,
            paymentMethod: 'pay-at-hotel',
            customerInfo,
            total
          })
        })

        const booking = await bookingResponse.json()
        
        // Redirect to confirmation page with full context and customer name
        const qp = new URLSearchParams({
          bookingId: String(booking.bookingId || `BK${Date.now()}`),
          paymentMethod: 'pay-at-hotel',
          name: customerInfo.name,
          propertyId,
          price: String(negotiatedPrice),
          originalPrice: String(originalPrice),
          checkIn,
          checkOut,
          adults: String(adults),
          children: String(children),
          rooms: String(rooms),
        })
        router.push(`/confirmation?${qp.toString()}`)
      } else if (selectedPayment === 'paystack') {
        if (!hasPaystack) {
          alert('Online card payment is not available right now. Please choose Pay at Hotel.')
          return
        }
        // Initialize Paystack transaction via server
        const context = {
          propertyId,
          price: String(negotiatedPrice),
          originalPrice: String(originalPrice),
          checkIn,
          checkOut,
          adults: String(adults),
          children: String(children),
          rooms: String(rooms),
          name: customerInfo.name,
          negotiationToken,
          // you can include more fields if needed
        }
        const initRes = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, email: customerInfo.email, context })
        })
        const initData = await initRes.json()
        if (!initRes.ok || !initData?.authorization_url) {
          alert(initData?.error || 'Unable to initialize Paystack')
          return
        }
        // Redirect to Paystack checkout
        window.location.href = initData.authorization_url
      } else {
        // Placeholder for other providers
        alert(`Redirecting to ${selectedPayment} for payment of ${naira(total)}...`)
        const qp = new URLSearchParams({
          bookingId: `BK${Date.now()}`,
          paymentMethod: selectedPayment,
          name: customerInfo.name,
          propertyId,
          price: String(negotiatedPrice),
          originalPrice: String(originalPrice),
          checkIn,
          checkOut,
          adults: String(adults),
          children: String(children),
          rooms: String(rooms),
        })
        router.push(`/confirmation?${qp.toString()}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">Secure your negotiated rate for {hotel.name}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>
                
                {/* Hotel Info */}
                <div className="flex gap-3 mb-4">
                  <SafeImage 
                    src={hotel.images?.[0] || ''} 
                    alt={hotel.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                    <p className="text-sm text-gray-600">{hotel.city}</p>
                    <div className="text-amber-400 text-sm">{"★".repeat(hotel.stars)}</div>
                  </div>
                </div>

                {/* Stay Details */}
                <div className="space-y-2 text-sm border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{adults} adults{children !== '0' ? `, ${children} children` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms:</span>
                    <span className="font-medium">{rooms}</span>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
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
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                
                {/* Customer Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pay-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        id="pay-name"
                        type="text"
                        className="input"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pay-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        id="pay-email"
                        type="email"
                        className="input"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pay-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        id="pay-phone"
                        type="tel"
                        className="input"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="+234 800 000 0000"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="pay-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        id="pay-address"
                        type="text"
                        className="input"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        placeholder="Your address"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Payment Method</h3>
                  <div className="space-y-3">
                    {visibleMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-brand-green bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{method.name}</span>
                                {method.popular && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            selectedPayment === method.id
                              ? 'border-brand-green bg-brand-green'
                              : 'border-gray-300'
                          }`}>
                            {selectedPayment === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Button */}
                <div className="flex gap-4">
                  <Link
                    href={`/negotiate?propertyId=${propertyId}`}
                    className="flex-1 text-center py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Negotiation
                  </Link>
                  <button
                    onClick={handlePayment}
                    disabled={!selectedPayment || isProcessing || !hasValidToken}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      selectedPayment && !isProcessing && hasValidToken
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : selectedPayment === 'pay-at-hotel' ? (
                      hasValidToken ? 'Confirm Booking' : 'Token required'
                    ) : (
                      hasValidToken ? `Pay ₦${total.toLocaleString()}` : 'Token required'
                    )}
                  </button>
                </div>

                {!hasValidToken && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
                    Your negotiation token is missing or expired. Please re-run negotiation to secure a fresh price.
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">🔒</span>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
                      <p className="text-sm text-blue-700">
                        Your payment information is encrypted and secure. We partner with trusted Nigerian payment processors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading payment...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}