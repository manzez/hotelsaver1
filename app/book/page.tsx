'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { HOTELS } from '@/lib/data'

// Hotel addresses mapping (ideally part of hotel data)
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
  const propertyId = sp.get('propertyId') || ''
  const priceParam = sp.get('price') || ''
  const checkIn = sp.get('checkIn')
  const checkOut = sp.get('checkOut')
  const adultsParam = sp.get('adults')
  const childrenParam = sp.get('children')
  const roomsParam = sp.get('rooms')

  const price = Number(priceParam) || 0
  const adults = Math.max(1, Number(adultsParam || '2') || 2)
  const children = Math.max(0, Number(childrenParam || '0') || 0)
  const rooms = Math.max(1, Number(roomsParam || '1') || 1)

  const hotel = useMemo(() => HOTELS.find(h => h.id === propertyId), [propertyId])
  const hotelInfo = HOTEL_ADDRESSES[propertyId] || { address: '', landmarks: '', phone: '' }
  const originalPrice = typeof hotel?.basePriceNGN === 'number' ? hotel.basePriceNGN : price

  const directionsUrl = useMemo(() => {
    const q = [hotel?.name, hotelInfo.address].filter(Boolean).join(' ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
  }, [hotel?.name, hotelInfo.address])

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const nights = useMemo(() => nightsBetween(checkIn, checkOut) || 2, [checkIn, checkOut])
  const subtotal = price * nights
  const vat = nights > 1 ? Math.round(subtotal * 0.075) : 0
  const total = subtotal + vat

  function shareByWhatsApp() {
    const text = `Booking confirmed at ${hotel?.name || 'Hotel'} for ${naira(price)}. Check-in: ${new Date().toLocaleDateString('en-NG')}.`
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  function shareByEmail() {
    const subject = `Booking Confirmation — ${hotel?.name || 'Hotel'}`
    const body = [
      `Hotel: ${hotel?.name || 'N/A'}`,
      `City: ${hotel?.city || 'N/A'}`,
      `Total: ${naira(total)}`,
      `Address: ${hotelInfo.address}`
    ].join('\n')
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }

  async function copyToClipboard() {
    const text = `${hotel?.name || 'Hotel'} — ${naira(total)}\n${hotelInfo.address}`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) return
    setSubmitting(true)
    try {
      const q = new URLSearchParams({
        propertyId,
        price: String(originalPrice || price),
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        adults: String(adults),
        children: String(children),
        rooms: String(rooms),
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      })
      router.push(`/payment?${q.toString()}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (done && hotel) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-5xl text-brand-green">✔️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-brand-green mb-2 tracking-tight">Booking Confirmed!</h1>
            <p className="text-lg text-gray-700">Your reservation is secured. Welcome to {hotel.name}!</p>
          </div>

          <div className="card p-8 mb-8 border-2 border-brand-green/20 shadow-soft">
            <div className="flex items-center gap-5 mb-6">
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300'}
                alt={hotel.name}
                className="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow"
              />
              <div>
                <h2 className="text-2xl font-bold text-brand-green mb-1">{hotel.name}</h2>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 text-lg">{'★'.repeat(hotel.stars)}</span>
                  <span className="text-gray-600 font-medium">{hotel.stars}-Star {hotel.type}</span>
                </div>
                <span className="badge bg-green-50 text-brand-green mb-1">{hotel.city}</span>
                <p className="text-sm text-gray-700">{hotelInfo.address}</p>
                <p className="text-xs text-gray-500">{hotelInfo.landmarks}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-600">Check-in:</span>
                <span className="ml-2 font-semibold">{new Date().toLocaleDateString('en-NG')}</span>
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

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Original price:</span>
                <span className="font-semibold text-gray-700">{naira(hotel.basePriceNGN ?? price)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Negotiated price:</span>
                <span className="font-semibold text-brand-green">{naira(price)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">You saved:</span>
                <span className="font-semibold text-green-600">{naira(Math.max(0, (hotel.basePriceNGN ?? price) - price))}</span>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">📤 Share Booking</h3>
              <div className="flex gap-3">
                <button onClick={shareByWhatsApp} className="btn-primary flex-1">
                  {`${String.fromCodePoint(0x1F4F1)} WhatsApp`}
                </button>
                <button onClick={shareByEmail} className="btn-primary flex-1 bg-blue-500 hover:bg-blue-600">
                  {`${String.fromCodePoint(0x1F4E7)} Email`}
                </button>
                <button onClick={copyToClipboard} className="btn-primary flex-1 bg-gray-500 hover:bg-gray-600">
                  {`${String.fromCodePoint(0x1F4CB)} Copy`}
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
        <h2 className="text-2xl font-bold mb-6">Your Details</h2>

        {hotel && (
          <div className="card p-4 mb-6">
            <div className="flex gap-3">
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=100'}
                alt={hotel.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.city} • {'⭐'.repeat(hotel.stars)}</p>
                {price > 0 && (
                  <p className="text-lg font-bold text-brand-green">{naira(price)}</p>
                )}
              </div>
            </div>
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

          <button type="submit" className="btn-accent w-full" disabled={submitting || !form.firstName || !form.lastName || !form.phone}>
            {submitting ? 'Processing…' : 'Continue to Payment'}
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
