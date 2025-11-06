'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { HOTELS } from '@/lib/data'
import { track } from '@/lib/analytics'

// Hotel addresses mapping
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

function BookPageContent() {
  const router = useRouter()
  const sp = useSearchParams()
  const serviceType = sp.get('service') || 'hotel'
  const propertyId = sp.get('propertyId') || ''
  const priceParam = sp.get('price') || ''
  const checkIn = sp.get('checkIn')
  const checkOut = sp.get('checkOut')
  const bookingDataParam = sp.get('data')

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('pay-at-property')
  const [hotel, setHotel] = useState<any>(null)
  const [hotelInfo, setHotelInfo] = useState<{ address: string; landmarks: string; phone: string }>({ 
    address: '', 
    landmarks: '', 
    phone: '' 
  })

  // Parse airport taxi booking data
  const airportTaxiData = useMemo(() => {
    if (serviceType !== 'airport-taxi' || !bookingDataParam) return null
    try {
      return JSON.parse(decodeURIComponent(bookingDataParam))
    } catch {
      return null
    }
  }, [serviceType, bookingDataParam])

  // Fetch hotel data
  useEffect(() => {
    async function fetchHotelData() {
      if (!propertyId) return

      // Try static hotels first
      const staticHotel = HOTELS.find(h => h.id === propertyId)
      if (staticHotel) {
        setHotel(staticHotel)
        setHotelInfo(HOTEL_ADDRESSES[propertyId] || { address: '', landmarks: '', phone: '' })
        return
      }

      // If it's a Places API hotel, fetch from API
      if (propertyId.startsWith('places_')) {
        try {
          const response = await fetch(`/api/hotels/live?city=Owerri&limit=50`)
          const data = await response.json()
          const placesHotel = data.hotels?.find((h: any) => h.placeId === propertyId.replace('places_', ''))
          if (placesHotel) {
            setHotel({
              id: `places_${placesHotel.placeId}`,
              name: placesHotel.name,
              city: placesHotel.city,
              basePriceNGN: placesHotel.estimatedPriceNGN || 150000,
              stars: Math.round(placesHotel.rating || 4),
              type: 'Hotel',
              images: [],
              source: 'places'
            })
            setHotelInfo({
              address: placesHotel.address || `${placesHotel.city}, Nigeria`,
              landmarks: placesHotel.vicinity || 'Live hotel data from Google Places',
              phone: placesHotel.phoneNumber || ''
            })
          }
        } catch (error) {
          console.error('Error fetching Places API hotel for booking:', error)
        }
      }
    }
    
    fetchHotelData()
  }, [propertyId])

  const price = useMemo(() => {
    const p = Number(priceParam)
    return p > 0 ? p : (hotel?.basePriceNGN || hotel?.price || 0)
  }, [priceParam, hotel])

  const nights = useMemo(() => nightsBetween(checkIn, checkOut) || 1, [checkIn, checkOut])
  const subtotal = useMemo(() => price * nights, [price, nights])
  const vat = useMemo(() => nights > 1 ? Math.round(subtotal * 0.075) : 0, [subtotal, nights])
  const total = useMemo(() => subtotal + vat, [subtotal, vat])

  const directionsUrl = useMemo(() => {
    if (!hotelInfo.address) return '#'
    return `https://maps.google.com/maps?q=${encodeURIComponent(hotelInfo.address)}`
  }, [hotelInfo.address])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    try {
      let payload: any
      let apiEndpoint: string

      if (serviceType === 'airport-taxi' && airportTaxiData) {
        // Airport taxi booking
        payload = {
          ...airportTaxiData,
          customerInfo: form,
          paymentMethod
        }
        apiEndpoint = '/api/airport-taxi/book'
      } else {
        // Hotel booking (default)
        payload = {
          propertyId,
          price,
          form,
          checkIn,
          checkOut,
          nights,
          total,
          paymentMethod
        }
        apiEndpoint = '/api/book'
      }

      // Track booking submit intent before network (beacon transport)
      track('booking_submit', {
        serviceType,
        propertyId,
        total,
        nights,
        paymentMethod,
      })

      const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (resp.ok) {
        const result = await resp.json()
        // Redirect to confirmation page with customer details
        const confirmationParams = new URLSearchParams({
          bookingId: result.bookingId || 'BK' + Date.now(),
          propertyId: propertyId || '',
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          paymentMethod,
          status: 'confirmed',
          price: String(price),
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          adults: sp.get('adults') || '2',
          children: sp.get('children') || '0',
          rooms: sp.get('rooms') || '1'
        })
        
        // Track booking success (non-payment) before navigating
        track('booking_confirmed', {
          serviceType,
          propertyId,
          total,
          nights,
          paymentMethod,
        })
        router.push(`/confirmation?${confirmationParams.toString()}`)
      } else {
        track('booking_failed', { serviceType, propertyId, total, nights, paymentMethod })
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      track('booking_error', { serviceType, propertyId, total, nights, paymentMethod })
      alert('Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const shareByWhatsApp = () => {
    if (!hotel) return
    const message = `🏨 Booking Confirmed!\n\n${hotel.name}\n${hotelInfo.address}\n\nTotal: ${naira(total)}\nNights: ${nights}\n\nBooking reference: BK${Date.now()}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareByEmail = () => {
    if (!hotel) return
    const subject = `Hotel Booking Confirmation - ${hotel.name}`
    const body = `Booking Confirmed!\n\n${hotel.name}\n${hotelInfo.address}\n\nTotal: ${naira(total)}\nNights: ${nights}\n\nBooking reference: BK${Date.now()}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const copyToClipboard = async () => {
    if (!hotel) return
    const text = `Booking Confirmed! ${hotel.name}, ${hotelInfo.address}. Total: ${naira(total)}, Nights: ${nights}. Reference: BK${Date.now()}`
    try {
      await navigator.clipboard.writeText(text)
      alert('Booking details copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // Validation for different service types
  if (serviceType === 'hotel' && !propertyId) {
    return (
      <div className="container py-10">
        <div className="max-w-xl mx-auto">
          <div className="card p-6 text-center">
            <h2 className="text-xl font-bold mb-4">No Property Selected</h2>
            <p className="text-gray-600 mb-4">Please go back and select a property to book.</p>
            <a href="/" className="btn-primary">Back to Search</a>
          </div>
        </div>
      </div>
    )
  }

  if (serviceType === 'airport-taxi' && !airportTaxiData) {
    return (
      <div className="container py-10">
        <div className="max-w-xl mx-auto">
          <div className="card p-6 text-center">
            <h2 className="text-xl font-bold mb-4">No Booking Data</h2>
            <p className="text-gray-600 mb-4">Please go back and select your airport taxi options.</p>
            <a href="/airport-taxi" className="btn-primary">Back to Airport Taxi</a>
          </div>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="container py-10">
        <div className="max-w-xl mx-auto">
          <div className="card p-6 text-center">
            <h2 className="text-xl font-bold mb-4">
              {serviceType === 'airport-taxi' ? 'Loading Taxi details...' : 'Loading hotel details...'}
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (done && (hotel || airportTaxiData)) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-5xl text-brand-green">✔️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-brand-green mb-2 tracking-tight">Booking Confirmed!</h1>
            <p className="text-lg text-gray-700">
              {serviceType === 'airport-taxi' 
                ? 'Your airport taxi has been booked successfully!' 
                : `Your reservation is secured. Welcome to ${hotel?.name}!`}
            </p>
          </div>

          <div className="card p-8 mb-8 border-2 border-brand-green/20 shadow-soft">
            {serviceType === 'airport-taxi' && airportTaxiData ? (
              // Airport Taxi Confirmation
              <div className="flex items-center gap-5 mb-6">
                <div className="w-28 h-28 bg-green-100 rounded-xl border border-gray-200 shadow flex items-center justify-center">
                  <span className="text-4xl">🚖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-green mb-1">Airport Taxi Booked</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600 font-medium">{airportTaxiData.tripType === 'return' ? 'Return Trip' : 'One-Way Trip'}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{airportTaxiData.pickupLocation}</p>
                  <p className="text-sm text-gray-600">→ {airportTaxiData.destination}</p>
                  {airportTaxiData.flightNumber && (
                    <p className="text-xs text-blue-600 font-medium">Flight: {airportTaxiData.flightNumber}</p>
                  )}
                </div>
              </div>
            ) : (
              // Hotel Confirmation
              <div className="flex items-center gap-5 mb-6">
                <img
                  src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=300&fit=crop&auto=format&q=80'}
                  alt={hotel?.name}
                  className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=300&fit=crop&auto=format&q=80'
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-brand-green mb-1">{hotel?.name}</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-lg">{'★'.repeat(hotel?.stars || 4)}</span>
                    <span className="text-gray-600 font-medium">{hotel?.stars || 4}-Star {hotel?.type || 'Hotel'}</span>
                  </div>
                  <span className="badge bg-green-50 text-brand-green mb-1">{hotel?.city}</span>
                  <p className="text-sm text-gray-700">{hotelInfo.address}</p>
                  <p className="text-xs text-gray-500">{hotelInfo.landmarks}</p>
                </div>
              </div>
            )}

            {serviceType === 'airport-taxi' && airportTaxiData ? (
              // Airport Taxi Details
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-600">Pickup Date:</span>
                  <span className="ml-2 font-semibold">{new Date(airportTaxiData.pickupDate).toLocaleDateString('en-NG')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Pickup Time:</span>
                  <span className="ml-2 font-semibold">{airportTaxiData.pickupTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Passengers:</span>
                  <span className="ml-2 font-semibold">{airportTaxiData.passengers}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trip Type:</span>
                  <span className="ml-2 font-semibold capitalize">{airportTaxiData.tripType}</span>
                </div>
                {airportTaxiData.tripType === 'return' && (
                  <>
                    <div>
                      <span className="text-gray-600">Return Date:</span>
                      <span className="ml-2 font-semibold">{airportTaxiData.returnDate ? new Date(airportTaxiData.returnDate).toLocaleDateString('en-NG') : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Return Time:</span>
                      <span className="ml-2 font-semibold">{airportTaxiData.returnTime || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Hotel Details
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-600">Check-in:</span>
                  <span className="ml-2 font-semibold">{checkIn ? new Date(checkIn).toLocaleDateString('en-NG') : 'Today'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nights:</span>
                  <span className="ml-2 font-semibold">{nights}</span>
                </div>
                <div>
                  <span className="text-gray-600">Guests:</span>
                  <span className="ml-2 font-semibold">2 adults</span>
                </div>
                <div>
                  <span className="text-gray-600">Rooms:</span>
                  <span className="ml-2 font-semibold">1</span>
                </div>
              </div>
            )}

            {serviceType === 'airport-taxi' && airportTaxiData ? (
              // Airport Taxi Pricing
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Base fare:</span>
                  <span className="font-semibold text-brand-green">₦15,000</span>
                </div>
                {airportTaxiData.tripType === 'return' && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Return trip:</span>
                    <span className="font-semibold text-brand-green">₦15,000</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service fee:</span>
                  <span className="font-semibold">₦2,000</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-2">
                  <span className="text-brand-green">Total:</span>
                  <span className="text-brand-green">
                    {naira(airportTaxiData.tripType === 'return' ? 32000 : 17000)}
                  </span>
                </div>
              </div>
            ) : (
              // Hotel Pricing
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Original price:</span>
                  <span className="font-semibold text-gray-700">{naira(hotel?.basePriceNGN || hotel?.price || price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Negotiated price:</span>
                  <span className="font-semibold text-brand-green">{naira(price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">You saved:</span>
                  <span className="font-semibold text-green-600">{naira(Math.max(0, (hotel?.basePriceNGN || hotel?.price || price) - price))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal ({nights} nights):</span>
                  <span className="font-semibold">{naira(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">VAT (7.5%):</span>
                  <span className="font-semibold">{naira(vat)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-2">
                  <span className="text-brand-green">Total:</span>
                  <span className="text-brand-green">{naira(total)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">📤 Share Booking</h3>
              <div className="flex gap-3">
                <button onClick={shareByWhatsApp} className="btn-primary flex-1">
                  📱 WhatsApp
                </button>
                <button onClick={shareByEmail} className="btn-primary flex-1 bg-blue-500 hover:bg-blue-600">
                  📧 Email
                </button>
                <button onClick={copyToClipboard} className="btn-primary flex-1 bg-gray-500 hover:bg-gray-600">
                  📋 Copy
                </button>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-3">📍 Directions</h3>
              <p className="text-sm text-gray-600 mb-2">{hotelInfo.address}</p>
              <p className="text-sm text-gray-500 mb-2">Near: {hotelInfo.landmarks}</p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center">
                🗺️ Get Directions
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/" className="btn-ghost text-lg font-medium">← Back to Home</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {serviceType === 'airport-taxi' ? 'Complete Your Airport Taxi Booking' : 'Your Details'}
        </h2>

        {/* Booking Summary Card */}
        {serviceType === 'airport-taxi' && airportTaxiData ? (
          <div className="card p-4 mb-6">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚖</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Airport Taxi</h3>
                <p className="text-sm text-gray-600">{airportTaxiData.tripType === 'return' ? 'Return Trip' : 'One-Way Trip'}</p>
                <p className="text-sm text-gray-500">{airportTaxiData.pickupLocation} → {airportTaxiData.destination}</p>
                <p className="text-lg font-bold text-brand-green">
                  {naira(airportTaxiData.tripType === 'return' ? 32000 : 17000)}
                </p>
              </div>
            </div>
          </div>
        ) : hotel && (
          <div className="card p-0 mb-6 overflow-hidden">
            {/* Property Photos */}
            <div className="relative h-48">
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=400&fit=crop&auto=format&q=80'}
                alt={hotel.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop&auto=format&q=80'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{hotel.name}</h3>
                <p className="text-sm text-white/90">{hotel.city} • {'⭐'.repeat(hotel.stars || 4)}</p>
              </div>
              {price > 0 && (
                <div className="absolute top-4 right-4 bg-brand-green text-white px-3 py-1 rounded-full font-bold">
                  {naira(price)}
                </div>
              )}
            </div>
            
            {/* Additional Photos Thumbnail Strip */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="flex gap-2 p-3 bg-gray-50">
                {hotel.images.slice(1, 4).map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${hotel.name} view ${idx + 2}`}
                    className="w-16 h-12 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=100&h=80&fit=crop&auto=format&q=80'
                    }}
                  />
                ))}
                {hotel.images.length > 4 && (
                  <div className="w-16 h-12 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                    +{hotel.images.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                id="firstName"
                className="input"
                placeholder="Enter your first name"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                id="lastName"
                className="input"
                placeholder="Enter your last name"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number (WhatsApp) *</label>
            <input
              id="phone"
              className="input"
              placeholder="e.g. +234 801 234 5678"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay-at-property"
                  checked={paymentMethod === 'pay-at-property'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏨</span>
                  <div>
                    <div className="font-medium">Pay at Property</div>
                    <div className="text-sm text-gray-600">Pay when you arrive (Cash or Card)</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank-transfer"
                  checked={paymentMethod === 'bank-transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-600">Transfer to our bank account</div>
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paystack"
                  checked={paymentMethod === 'paystack'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <div className="font-medium">Pay with Card</div>
                    <div className="text-sm text-gray-600">Secure online payment via Paystack</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-accent w-full" disabled={submitting || !form.firstName || !form.lastName || !form.phone || !form.email}>
            {submitting 
              ? 'Processing…' 
              : serviceType === 'airport-taxi' 
                ? 'Confirm Airport Taxi Booking' 
                : 'Continue to Payment'
            }
          </button>

          <p className="text-xs text-gray-500 text-center">
            We'll personalize your payment step and keep you updated via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container py-10"><div className="max-w-xl mx-auto"><div className="card p-6 text-center">Loading...</div></div></div>}>
      <BookPageContent />
    </Suspense>
  )
}