
'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { HOTELS } from '@/lib/data'

// Hotel addresses mapping (would ideally be in the hotels data)
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

function BookPageContent(){
  const sp = useSearchParams()
  const propertyId = sp.get('propertyId') || ''
  const price = sp.get('price') || ''
  const [form, setForm] = useState({name:'',phone:'',email:'',eta:''})
  const [done, setDone] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [hotel, setHotel] = useState<any>(null)

  useEffect(() => {
    const foundHotel = HOTELS.find(h => h.id === propertyId)
    if (foundHotel) {
      setHotel(foundHotel)
    }
  }, [propertyId])

  async function submit(e: React.FormEvent){
    e.preventDefault()
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        propertyId,
        negotiationToken: 'demo',
        rooms: 1,
        adults: 2,
        children: 0,
        checkIn: '',
        checkOut: '',
        contact: form
      })
    })
    const data = await res.json()
    if (res.ok) {
      setBookingId(data.bookingId || 'BK' + Date.now())
      setDone(true)
    }
  }

  const hotelInfo = HOTEL_ADDRESSES[propertyId] || {
    address: `${hotel?.city || 'Nigeria'}`,
    landmarks: `Located in ${hotel?.city || 'Nigeria'}`,
    phone: '+234 1 234 5678'
  }

  const directionsUrl = `https://www.google.com/maps/search/${encodeURIComponent(hotel?.name + ' ' + hotel?.city)}`
  
  const bookingDetails = {
    bookingId,
    hotelName: hotel?.name || 'Hotel',
    address: hotelInfo.address,
    phone: hotelInfo.phone,
    customerName: form.name,
    customerPhone: form.phone,
    customerEmail: form.email,
    arrivalTime: form.eta,
    price: price ? `₦${Number(price).toLocaleString()}` : 'N/A',
    bookingDate: new Date().toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const shareText = `🏨 Hotel Booking Confirmed!\n\nBooking ID: ${bookingDetails.bookingId}\nHotel: ${bookingDetails.hotelName}\nAddress: ${bookingDetails.address}\nPrice: ${bookingDetails.price}\nGuest: ${bookingDetails.customerName}\n\nBooked via HotelSaver.ng`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      alert('Booking details copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Hotel Booking Confirmation - ${bookingDetails.bookingId}`)
    const body = encodeURIComponent(shareText)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareByWhatsApp = () => {
    const text = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${text}`)
  }

  if (done && hotel) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your reservation has been successfully processed</p>
          </div>

          {/* Booking Details Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ID: {bookingId}
              </span>
            </div>

            {/* Hotel Image and Info */}
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0">
                <img
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300'}
                  alt={hotel.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {'⭐'.repeat(hotel.stars)} {hotel.stars}-Star {hotel.type}
                </p>
                <p className="text-sm text-gray-700">{hotelInfo.address}</p>
                <p className="text-sm text-gray-500 mt-1">{hotelInfo.landmarks}</p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{form.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{form.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{form.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Arrival:</span>
                  <span className="ml-2 font-medium">{form.eta || 'TBD'}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            {price && (
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-2xl font-bold text-brand-green">₦{Number(price).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Hotel Contact</h4>
              <p className="text-sm text-gray-600 mb-1">
                📞 {hotelInfo.phone}
              </p>
              <p className="text-sm text-gray-600">
                📧 We've emailed you and admin@hotelsaver.ng with confirmation details
              </p>
            </div>
          </div>

          {/* Directions */}
          <div className="card p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">📍 Directions</h3>
            <p className="text-sm text-gray-600 mb-4">{hotelInfo.address}</p>
            <p className="text-sm text-gray-500 mb-4">Near: {hotelInfo.landmarks}</p>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center"
            >
              🗺️ Get Directions
            </a>
          </div>

          {/* Sharing Options */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">📤 Share Booking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={shareByWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={shareByEmail}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                📧 Email
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <a href="/" className="btn-ghost">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
        
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
                {price && (
                  <p className="text-lg font-bold text-brand-green">₦{Number(price).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input 
              className="input" 
              placeholder="Enter your full name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (WhatsApp) *</label>
            <input 
              className="input" 
              placeholder="e.g. +234 801 234 5678" 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input 
              type="email" 
              className="input" 
              placeholder="your.email@example.com" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Arrival Time</label>
            <input 
              className="input" 
              placeholder="e.g. 2:00 PM or 14:00" 
              value={form.eta} 
              onChange={e => setForm({...form, eta: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={!form.name || !form.phone || !form.email}
          >
            🔒 Confirm Booking
          </button>

          <p className="text-xs text-gray-500 text-center">
            By booking, you agree to our terms. We'll send confirmation via email and WhatsApp.
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
