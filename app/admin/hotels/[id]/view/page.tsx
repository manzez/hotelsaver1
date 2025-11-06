'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Hotel {
  id: string
  name: string
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Owerri'
  basePriceNGN: number
  stars: number
  type: 'Hotel' | 'Apartment'
  address: string
  phone: string
  email: string
  description: string
  amenities: string[]
  images: string[]
  status: 'active' | 'inactive' | 'maintenance'
  featured: boolean
  totalRooms: number
  availableRooms: number
  createdAt: string
  updatedAt: string
}

interface Booking {
  id: string
  customerName: string
  checkIn: string
  checkOut: string
  status: 'confirmed' | 'pending' | 'cancelled'
  totalAmount: number
}

// Mock hotel data
const mockHotel: Hotel = {
  id: 'eko-hotel-and-suites-lagos',
  name: 'Eko Hotels and Suites',
  city: 'Lagos',
  basePriceNGN: 185000,
  stars: 5,
  type: 'Hotel',
  address: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
  phone: '+234 1 277 7000',
  email: 'reservations@ekohotels.com',
  description: 'Luxury hotel in the heart of Victoria Island offering world-class amenities and services. Our hotel provides exceptional hospitality with modern facilities, making it the perfect choice for both business and leisure travelers.',
  amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Conference Rooms', 'Parking', 'Business Center', 'Room Service'],
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  status: 'active',
  featured: true,
  totalRooms: 450,
  availableRooms: 387,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2025-10-20T14:30:00Z'
}

// Mock recent bookings
const mockBookings: Booking[] = [
  {
    id: 'BK001',
    customerName: 'John Adebayo',
    checkIn: '2025-11-01',
    checkOut: '2025-11-03',
    status: 'confirmed',
    totalAmount: 185000
  },
  {
    id: 'BK002',
    customerName: 'Sarah Okafor',
    checkIn: '2025-11-05',
    checkOut: '2025-11-07',
    status: 'pending',
    totalAmount: 370000
  },
  {
    id: 'BK003',
    customerName: 'Michael Johnson',
    checkIn: '2025-10-28',
    checkOut: '2025-10-30',
    status: 'cancelled',
    totalAmount: 185000
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getBookingStatusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function HotelViewPage() {
  const params = useParams()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const loadHotel = async () => {
      try {
        // In production, fetch from API
        // const response = await fetch(`/api/admin/hotels/${params.id}`)
        // const data = await response.json()
        
        // For now, use mock data
        setTimeout(() => {
          setHotel(mockHotel)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error loading hotel:', error)
        setLoading(false)
      }
    }

    loadHotel()
  }, [params.id])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hotel Not Found</h3>
          <p className="text-gray-600 mb-4">The hotel with ID "{params.id}" could not be found.</p>
          <Link 
            href="/admin/hotels"
            className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            ← Back to Hotels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/hotels"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Hotels
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600">Hotel details and management overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/hotels/${params.id}`}
            className="px-4 py-2 bg-brand-green text-white hover:bg-brand-dark rounded-md transition-colors"
          >
            ✏️ Edit Hotel
          </Link>
          <Link
            href={`/hotel/${params.id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            🌐 Public View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel Images Gallery */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-64 md:h-80">
              <img
                src={hotel.images[activeImageIndex]}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              {hotel.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Featured Hotel
                </div>
              )}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(hotel.status)}`}>
                {hotel.status}
              </div>
            </div>
            
            {hotel.images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {hotel.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                        index === activeImageIndex ? 'border-brand-green' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${hotel.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hotel Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Basic Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Hotel Name</span>
                    <div className="font-medium text-lg">{hotel.name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Location</span>
                    <div className="font-medium">{hotel.city}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Star Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-lg">{'★'.repeat(hotel.stars)}{'☆'.repeat(5 - hotel.stars)}</span>
                      <span className="text-sm text-gray-600">({hotel.stars} stars)</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Property Type</span>
                    <div className="font-medium">{hotel.type}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Pricing & Availability</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Fallback Price</span>
                    <div className="font-bold text-xl text-gray-900">₦{hotel.basePriceNGN.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">per night (used if no room types defined)</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Room Availability</span>
                    <div className="font-medium">{hotel.availableRooms} of {hotel.totalRooms} rooms</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(hotel.availableRooms / hotel.totalRooms) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.round((1 - hotel.availableRooms / hotel.totalRooms) * 100)}% occupancy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Address</h3>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">📍</span>
                <p className="text-gray-700">{hotel.address}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities & Services</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm font-medium text-green-800">{amenity}</span>
                </div>
              ))}
            </div>
            
            {hotel.amenities.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No amenities listed for this hotel.
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                href={`/admin/bookings?hotel=${hotel.id}`}
                className="text-sm text-brand-green hover:text-brand-dark transition-colors"
              >
                View All Bookings →
              </Link>
            </div>
            
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      ₦{booking.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBookingStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {bookings.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No recent bookings for this hotel.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <Link
                href={`/admin/hotels/${hotel.id}`}
                className="block w-full px-3 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors text-center"
              >
                ✏️ Edit Hotel Details
              </Link>
              <Link
                href={`/admin/bookings?hotel=${hotel.id}`}
                className="block w-full px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-center"
              >
                📋 View All Bookings
              </Link>
              <button className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                📞 Call Hotel
              </button>
              <button className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">
                📧 Email Hotel
              </button>
              <button className="w-full px-3 py-2 text-sm bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors">
                📊 Generate Report
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Phone</span>
                <div className="font-medium">
                  <a href={`tel:${hotel.phone}`} className="text-brand-green hover:text-brand-dark transition-colors">
                    {hotel.phone}
                  </a>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email</span>
                <div className="font-medium">
                  <a href={`mailto:${hotel.email}`} className="text-brand-green hover:text-brand-dark transition-colors">
                    {hotel.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-semibold">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue (Oct)</span>
                <span className="font-semibold">₦4.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Commission</span>
                <span className="font-semibold">₦210K</span>
              </div>
            </div>
          </div>

          {/* Hotel Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hotel ID:</span>
                <span className="font-mono text-xs">{hotel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{formatDateTime(hotel.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{formatDateTime(hotel.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(hotel.status)}`}>
                  {hotel.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Featured:</span>
                <span className={hotel.featured ? 'text-green-600' : 'text-gray-500'}>
                  {hotel.featured ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}