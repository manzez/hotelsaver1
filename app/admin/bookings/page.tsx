'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Mock booking data - in production, this would come from your database
interface Booking {
  id: string
  hotelId: string
  hotelName: string
  hotelCity: string
  customerName: string
  customerEmail: string
  customerPhone: string
  checkIn: string
  checkOut: string
  nights: number
  rooms: number
  adults: number
  children: number
  totalAmount: number
  paymentStatus: 'pending' | 'confirmed' | 'failed' | 'refunded'
  paymentMethod: 'paystack' | 'pay-at-property' | 'bank-transfer'
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  bookingDate: string
  specialRequests?: string
  discountApplied?: number
  commission: number
}

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    hotelId: 'eko-hotels-lagos',
    hotelName: 'Eko Hotels and Suites',
    hotelCity: 'Lagos',
    customerName: 'John Adebayo',
    customerEmail: 'john.adebayo@email.com',
    customerPhone: '+234 901 234 5678',
    checkIn: '2025-11-01',
    checkOut: '2025-11-03',
    nights: 2,
    rooms: 1,
    adults: 2,
    children: 0,
    totalAmount: 185000,
    paymentStatus: 'confirmed',
    paymentMethod: 'paystack',
    bookingStatus: 'confirmed',
    bookingDate: '2025-10-30T10:30:00Z',
    specialRequests: 'Late check-in requested',
    discountApplied: 15,
    commission: 9250
  },
  {
    id: 'BK002',
    hotelId: 'transcorp-hilton-abuja',
    hotelName: 'Transcorp Hilton Abuja',
    hotelCity: 'Abuja',
    customerName: 'Mary Okafor',
    customerEmail: 'mary.okafor@email.com',
    customerPhone: '+234 802 345 6789',
    checkIn: '2025-11-05',
    checkOut: '2025-11-08',
    nights: 3,
    rooms: 1,
    adults: 2,
    children: 1,
    totalAmount: 220000,
    paymentStatus: 'pending',
    paymentMethod: 'pay-at-property',
    bookingStatus: 'pending',
    bookingDate: '2025-10-30T14:15:00Z',
    discountApplied: 12,
    commission: 11000
  },
  {
    id: 'BK003',
    hotelId: 'golden-tulip-portharcourt',
    hotelName: 'Golden Tulip Port Harcourt',
    hotelCity: 'Port Harcourt',
    customerName: 'David Chukwu',
    customerEmail: 'david.chukwu@email.com',
    customerPhone: '+234 803 456 7890',
    checkIn: '2025-10-31',
    checkOut: '2025-11-02',
    nights: 2,
    rooms: 2,
    adults: 3,
    children: 1,
    totalAmount: 145000,
    paymentStatus: 'confirmed',
    paymentMethod: 'paystack',
    bookingStatus: 'confirmed',
    bookingDate: '2025-10-29T16:20:00Z',
    discountApplied: 18,
    commission: 7250
  },
  {
    id: 'BK004',
    hotelId: 'protea-hotel-owerri',
    hotelName: 'Protea Hotel Owerri',
    hotelCity: 'Owerri',
    customerName: 'Sarah Bello',
    customerEmail: 'sarah.bello@email.com',
    customerPhone: '+234 804 567 8901',
    checkIn: '2025-11-10',
    checkOut: '2025-11-12',
    nights: 2,
    rooms: 1,
    adults: 1,
    children: 0,
    totalAmount: 95000,
    paymentStatus: 'failed',
    paymentMethod: 'paystack',
    bookingStatus: 'cancelled',
    bookingDate: '2025-10-29T09:45:00Z',
    discountApplied: 20,
    commission: 0
  },
  {
    id: 'BK005',
    hotelId: 'lagos-marriott',
    hotelName: 'Lagos Marriott Hotel',
    hotelCity: 'Lagos',
    customerName: 'Ahmed Mohammed',
    customerEmail: 'ahmed.mohammed@email.com',
    customerPhone: '+234 805 678 9012',
    checkIn: '2025-11-15',
    checkOut: '2025-11-18',
    nights: 3,
    rooms: 1,
    adults: 2,
    children: 2,
    totalAmount: 275000,
    paymentStatus: 'confirmed',
    paymentMethod: 'bank-transfer',
    bookingStatus: 'confirmed',
    bookingDate: '2025-10-30T12:00:00Z',
    specialRequests: 'Connecting rooms for family',
    discountApplied: 10,
    commission: 13750
  }
]

const cities = ['All Cities', 'Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
const paymentStatuses = ['All', 'pending', 'confirmed', 'failed', 'refunded']
const bookingStatuses = ['All', 'confirmed', 'pending', 'cancelled', 'completed', 'no-show']

function getStatusColor(status: string, type: 'payment' | 'booking') {
  if (type === 'payment') {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  } else {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
}

function BookingCard({ booking, onStatusUpdate }: { 
  booking: Booking
  onStatusUpdate: (bookingId: string, field: string, value: string) => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">{booking.id}</h3>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus, 'payment')}`}>
                  {booking.paymentStatus}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus, 'booking')}`}>
                  {booking.bookingStatus}
                </span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">{booking.customerName}</span>
                <div>{booking.hotelName}</div>
                <div>{booking.hotelCity}</div>
              </div>
              <div>
                <div>Check-in: {formatDate(booking.checkIn)}</div>
                <div>Check-out: {formatDate(booking.checkOut)}</div>
                <div>{booking.nights} night(s)</div>
              </div>
              <div>
                <div>{booking.rooms} room(s)</div>
                <div>{booking.adults} adults, {booking.children} children</div>
                <div>{booking.paymentMethod}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">₦{booking.totalAmount.toLocaleString()}</div>
                <div className="text-green-600">Commission: ₦{booking.commission.toLocaleString()}</div>
                <div className="text-blue-600">Discount: {booking.discountApplied}%</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
            <Link
              href={`/admin/bookings/${booking.id}`}
              className="px-3 py-1 text-sm bg-brand-green text-white hover:bg-brand-dark rounded-md transition-colors"
            >
              Details
            </Link>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Customer Details */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span>
                  <div>{booking.customerEmail}</div>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <div>{booking.customerPhone}</div>
                </div>
                <div>
                  <span className="font-medium">Booking Date:</span>
                  <div>{formatDateTime(booking.bookingDate)}</div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{booking.specialRequests}</p>
              </div>
            )}

            {/* Status Updates */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={booking.paymentStatus}
                    onChange={(e) => onStatusUpdate(booking.id, 'paymentStatus', e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Booking Status</label>
                  <select
                    value={booking.bookingStatus}
                    onChange={(e) => onStatusUpdate(booking.id, 'bookingStatus', e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                📧 Email Customer
              </button>
              <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                📱 WhatsApp
              </button>
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">
                📄 Generate Invoice
              </button>
              {booking.bookingStatus === 'confirmed' && (
                <button 
                  onClick={() => onStatusUpdate(booking.id, 'bookingStatus', 'cancelled')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                >
                  ❌ Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingsPageInner() {
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(mockBookings)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || 'All Cities',
    paymentStatus: 'All',
    bookingStatus: 'All',
    dateRange: '30d'
  })

  useEffect(() => {
    let filtered = bookings

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(query) ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query) ||
        booking.hotelName.toLowerCase().includes(query)
      )
    }

    // City filter
    if (filters.city !== 'All Cities') {
      filtered = filtered.filter(booking => booking.hotelCity === filters.city)
    }

    // Payment status filter
    if (filters.paymentStatus !== 'All') {
      filtered = filtered.filter(booking => booking.paymentStatus === filters.paymentStatus)
    }

    // Booking status filter
    if (filters.bookingStatus !== 'All') {
      filtered = filtered.filter(booking => booking.bookingStatus === filters.bookingStatus)
    }

    setFilteredBookings(filtered)
  }, [filters, bookings])

  const handleStatusUpdate = (bookingId: string, field: string, value: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, [field]: value }
        : booking
    ))
  }

  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter(b => b.bookingStatus === 'confirmed').length,
    pending: filteredBookings.filter(b => b.bookingStatus === 'pending').length,
    cancelled: filteredBookings.filter(b => b.bookingStatus === 'cancelled').length,
    totalRevenue: filteredBookings.reduce((sum, b) => sum + (b.bookingStatus !== 'cancelled' ? b.totalAmount : 0), 0),
    totalCommission: filteredBookings.reduce((sum, b) => sum + b.commission, 0)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage all hotel bookings and customer reservations</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
            📧 Send Reminders
          </button>
          <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Bookings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-lg font-bold text-gray-900">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-500">Revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-lg font-bold text-green-600">₦{(stats.totalCommission / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-500">Commission</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Booking ID, customer name, email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            >
              {paymentStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
            <select
              value={filters.bookingStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, bookingStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            >
              {bookingStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">No bookings match your current filters. Try adjusting the search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading bookings…</div>}>
      <BookingsPageInner />
    </Suspense>
  )
}