'use client'

import { useState, Suspense, useMemo, useEffect } from 'react'
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
  
  const [selectedPayment, setSelectedPayment] = useState<string>('pay-at-hotel') // Default to pay at hotel
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  // Get booking details from URL params
  const propertyId = searchParams.get('propertyId') || ''
  const priceParam = Number(searchParams.get('price')) || 0
  const negotiationToken = searchParams.get('negotiationToken') || ''
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const phoneFromParams = searchParams.get('phone') || ''
  
  // Find hotel in static data first, then try hybrid system for Places API hotels
  const [hotel, setHotel] = useState<any>(null)
  const [isLoadingHotel, setIsLoadingHotel] = useState(false)
  
  useEffect(() => {
    async function loadHotel() {
      // Try static data first
      let foundHotel = HOTELS.find(h => h.id === propertyId)
      
      // If not found and it's a Places API ID, try hybrid system
      if (!foundHotel && propertyId.startsWith('places_')) {
        setIsLoadingHotel(true)
        try {
          const { getHotelById } = await import('@/lib/hybrid-hotels')
          const hybridHotel = await getHotelById(propertyId, 'Lagos') // Default city
          if (hybridHotel) {
            foundHotel = {
              id: hybridHotel.id,
              name: hybridHotel.name,
              city: hybridHotel.city,
              type: hybridHotel.type,
              basePriceNGN: hybridHotel.basePriceNGN,
              images: hybridHotel.images || [],
              stars: hybridHotel.stars || 4
            }
          }
        } catch (error) {
          console.error('Error fetching Places API hotel for payment:', error)
        } finally {
          setIsLoadingHotel(false)
        }
      }
      
      setHotel(foundHotel)
    }
    
    if (propertyId) {
      loadHotel()
    }
  }, [propertyId])
  // Determine rate per night: prefer price from URL (negotiated or selected), else fall back to hotel data
  const baseRate = priceParam > 0
    ? priceParam
    : (typeof hotel?.basePriceNGN === 'number' ? hotel.basePriceNGN : 0)
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const adults = searchParams.get('adults') || '2'
  const children = searchParams.get('children') || '0'
  const rooms = searchParams.get('rooms') || '1'
  const fullName = `${firstName} ${lastName}`.trim()

  // Prime customer fields from URL if available
  useEffect(() => {
    setCustomerInfo(prev => ({
      ...prev,
      name: prev.name || fullName,
      phone: prev.phone || phoneFromParams,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate nights and total
  const nights = useMemo(() => (nightsBetween(checkIn, checkOut) || 1), [checkIn, checkOut])
  const subtotal = baseRate * nights
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

  // Show loading state while fetching hotel details
  if (isLoadingHotel) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
        <h1 className="text-xl font-medium text-gray-900">Loading hotel details...</h1>
      </div>
    )
  }

  // Handle missing hotel with fallback options
  if (!hotel && propertyId) {
    // Try to provide a fallback experience instead of blocking the user
    console.warn('Hotel not found, using fallback:', propertyId)
    
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
          <div className="card p-6 mb-6">
            <div className="text-amber-600 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Property Details Loading</span>
              </div>
              <p className="text-sm mt-2">We're having trouble loading the property details. You can still complete your booking.</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Property ID: {propertyId}</div>
                {priceParam > 0 && <div>Rate: {naira(priceParam)} per night</div>}
                {checkIn && <div>Check-in: {new Date(checkIn).toLocaleDateString()}</div>}
                {checkOut && <div>Check-out: {new Date(checkOut).toLocaleDateString()}</div>}
                <div>Guests: {adults} adults{children !== '0' ? `, ${children} children` : ''}</div>
                <div>Rooms: {rooms}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
                    alert('Please fill in all contact details')
                    return
                  }
                  
                  try {
                    setIsProcessing(true)
                    
                    // Use fallback booking API
                    const response = await fetch('/api/payments/fallback', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        propertyId,
                        price: priceParam,
                        customerInfo,
                        bookingDetails: {
                          checkIn, checkOut, adults, children, rooms
                        }
                      })
                    })
                    
                    const result = await response.json()
                    
                    if (result.bookingId) {
                      router.push(`/confirmation?bookingId=${result.bookingId}&method=fallback`)
                    } else {
                      throw new Error('Booking failed')
                    }
                  } catch (error) {
                    console.error('Fallback booking error:', error)
                    alert('Booking failed. Please try again or contact support.')
                  } finally {
                    setIsProcessing(false)
                  }
                }}
                disabled={isProcessing}
                className="btn-primary w-full"
              >
                {isProcessing ? 'Processing...' : 'Complete Booking'}
              </button>
            </div>
          </div>
          
          <div className="text-center space-x-4">
            <Link href="/" className="btn-ghost">Back to Home</Link>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-ghost"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle case where no propertyId at all
  if (!propertyId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
        <p className="text-gray-600 mb-8">No property selected. Please start a new search.</p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    )
  }

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method')
      return
    }

    // Require basic contact details
    const nameForPayment = (customerInfo.name || fullName || '').trim()
    const phoneForPayment = (customerInfo.phone || phoneFromParams || '').trim()
    const emailForPayment = (customerInfo.email || '').trim()

    if (!nameForPayment || !phoneForPayment || !emailForPayment) {
      alert('Please enter your name, phone number, and email to continue')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

  if (selectedPayment === 'pay-at-hotel') {
        // For pay at hotel, try main API first, then fallback
        let booking
        try {
          const bookingResponse = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId,
              pricePerNight: baseRate,
              checkIn,
              checkOut,
              adults,
              children,
              rooms,
              paymentMethod: 'pay-at-hotel',
              negotiationToken,
              customerInfo: { name: nameForPayment, phone: phoneForPayment, email: emailForPayment, address: customerInfo.address },
              total
            })
          })

          if (bookingResponse.ok) {
            booking = await bookingResponse.json()
          } else {
            throw new Error('Primary booking API failed')
          }
        } catch (error) {
          console.log('Primary booking failed, using fallback:', error)
          // Use fallback booking API
          const fallbackResponse = await fetch('/api/payments/fallback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId,
              pricePerNight: baseRate,
              checkIn,
              checkOut,
              adults,
              children,
              rooms,
              paymentMethod: 'pay-at-hotel',
              customerInfo: { name: nameForPayment, phone: phoneForPayment, email: emailForPayment, address: customerInfo.address },
              total
            })
          })
          booking = await fallbackResponse.json()
        }
        
        // Redirect to confirmation page with full context and customer name
        const qp = new URLSearchParams({
          bookingId: String(booking.bookingId || `BK${Date.now()}`),
          paymentMethod: 'pay-at-hotel',
          name: nameForPayment,
          propertyId,
          price: String(baseRate),
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
          price: String(baseRate),
          checkIn,
          checkOut,
          adults: String(adults),
          children: String(children),
          rooms: String(rooms),
          name: nameForPayment,
          phone: phoneForPayment,
          email: emailForPayment,
          flow: 'book',
          negotiationToken,
          // you can include more fields if needed
        }
        const initRes = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Pass amount for display, but server will recompute if a valid negotiationToken is present
          body: JSON.stringify({ amount: total, email: emailForPayment, context })
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
          name: nameForPayment,
          propertyId,
          price: String(baseRate),
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
            <p className="text-gray-600">Secure your booking at {hotel.name}</p>
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
                    mobileQuery={`${hotel.name} ${hotel.city} hotel Nigeria`}
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
                    <span className="text-gray-600">Rate per night:</span>
                    <span className="font-medium">{naira(baseRate)}</span>
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
                
                {/* Personalization + Address Only */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Hi {fullName || 'there'},</h3>
                  {phoneFromParams && (
                    <p className="text-sm text-gray-600 mb-4">We’ll contact you on {phoneFromParams} if needed.</p>
                  )}
                  <div>
                    <label htmlFor="pay-address" className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
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

                {/* Payment Notice */}
                {!hasPaystack && (
                  <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-0.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Payment Options Available</h4>
                        <p className="text-sm text-blue-800">
                          Online card payments are currently being set up. You can secure your booking now and pay at the hotel with cash or card.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer details (required) */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="cust-name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                      <input
                        id="cust-name"
                        type="text"
                        className="input"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="e.g. Adaeze Okafor"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cust-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                      <input
                        id="cust-phone"
                        type="tel"
                        inputMode="tel"
                        className="input"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        placeholder="e.g. 0701 234 5678"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cust-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        id="cust-email"
                        type="email"
                        className="input"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="e.g. you@example.com"
                        required
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
                    href={`/book?propertyId=${propertyId}${checkIn ? `&checkIn=${encodeURIComponent(checkIn)}` : ''}${checkOut ? `&checkOut=${encodeURIComponent(checkOut)}` : ''}`}
                    className="flex-1 text-center py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Details
                  </Link>
                  <button
                    onClick={handlePayment}
                    disabled={!selectedPayment || isProcessing}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      selectedPayment && !isProcessing
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
                      'Confirm Booking'
                    ) : (
                      `Pay ₦${total.toLocaleString()}`
                    )}
                  </button>
                </div>

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