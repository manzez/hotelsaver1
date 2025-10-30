'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  hotelId: string
  hotelName: string
  hotelCity: string
  hotelAddress: string
  hotelPhone: string
  customerName: string
  customerEmail: string
  customerPhone: string
  checkIn: string
  checkOut: string
  nights: number
  rooms: number
  adults: number
  children: number
  roomType: string
  totalAmount: number
  paymentStatus: 'pending' | 'confirmed' | 'failed' | 'refunded'
  paymentMethod: 'paystack' | 'pay-at-property' | 'bank-transfer'
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  bookingDate: string
  specialRequests?: string
  discountApplied?: number
  commission: number
  transactionId?: string
  paymentDate?: string
  cancellationReason?: string
  modifications: Array<{
    date: string
    type: string
    description: string
    user: string
  }>
}

// Mock data - replace with API call
const mockBooking: Booking = {
  id: 'BK001',
  hotelId: 'eko-hotels-lagos',
  hotelName: 'Eko Hotels and Suites',
  hotelCity: 'Lagos',
  hotelAddress: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
  hotelPhone: '+234 1 277 7000',
  customerName: 'John Adebayo',
  customerEmail: 'john.adebayo@email.com',
  customerPhone: '+234 901 234 5678',
  checkIn: '2025-11-01',
  checkOut: '2025-11-03',
  nights: 2,
  rooms: 1,
  adults: 2,
  children: 0,
  roomType: 'Deluxe Room',
  totalAmount: 185000,
  paymentStatus: 'confirmed',
  paymentMethod: 'paystack',
  bookingStatus: 'confirmed',
  bookingDate: '2025-10-30T10:30:00Z',
  specialRequests: 'Late check-in requested around 11 PM. Non-smoking room preferred.',
  discountApplied: 15,
  commission: 9250,
  transactionId: 'TXN_123456789',
  paymentDate: '2025-10-30T10:32:15Z',
  modifications: [
    {
      date: '2025-10-30T10:30:00Z',
      type: 'booking_created',
      description: 'Booking created successfully',
      user: 'System'
    },
    {
      date: '2025-10-30T10:32:15Z',
      type: 'payment_confirmed',
      description: 'Payment confirmed via Paystack',
      user: 'System'
    },
    {
      date: '2025-10-30T11:15:00Z',
      type: 'confirmation_sent',
      description: 'Confirmation email sent to customer',
      user: 'Admin'
    }
  ]
}

function getStatusColor(status: string, type: 'payment' | 'booking') {
  if (type === 'payment') {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  } else {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(mockBooking)
  const [loading, setLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [newNote, setNewNote] = useState('')

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

  const handleStatusUpdate = (field: string, value: string) => {
    if (!booking) return
    
    setLoading(true)
    // In production, make API call here
    setTimeout(() => {
      setBooking(prev => prev ? { ...prev, [field]: value } : null)
      setLoading(false)
      
      // Add modification log
      const modification = {
        date: new Date().toISOString(),
        type: `${field}_updated`,
        description: `${field} updated to ${value}`,
        user: 'Admin'
      }
      
      setBooking(prev => prev ? {
        ...prev,
        modifications: [modification, ...prev.modifications]
      } : null)
    }, 500)
  }

  const handleCancelBooking = () => {
    if (!booking || !cancellationReason.trim()) return
    
    setLoading(true)
    // In production, make API call here
    setTimeout(() => {
      setBooking(prev => prev ? { 
        ...prev, 
        bookingStatus: 'cancelled',
        cancellationReason: cancellationReason.trim()
      } : null)
      
      const modification = {
        date: new Date().toISOString(),
        type: 'booking_cancelled',
        description: `Booking cancelled. Reason: ${cancellationReason}`,
        user: 'Admin'
      }
      
      setBooking(prev => prev ? {
        ...prev,
        modifications: [modification, ...prev.modifications]
      } : null)
      
      setShowCancelModal(false)
      setCancellationReason('')
      setLoading(false)
    }, 500)
  }

  const addNote = () => {
    if (!newNote.trim() || !booking) return
    
    const modification = {
      date: new Date().toISOString(),
      type: 'admin_note',
      description: newNote.trim(),
      user: 'Admin'
    }
    
    setBooking(prev => prev ? {
      ...prev,
      modifications: [modification, ...prev.modifications]
    } : null)
    
    setNewNote('')
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Not Found</h3>
          <p className="text-gray-600 mb-4">The booking with ID "{params.id}" could not be found.</p>
          <Link 
            href="/admin/bookings"
            className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            ← Back to Bookings
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
            href="/admin/bookings"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Bookings
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking {booking.id}</h1>
            <p className="text-gray-600">Manage booking details and customer communication</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
            📧 Email Customer
          </button>
          <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors">
            📱 WhatsApp
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors">
            📄 Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Booking Overview</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.paymentStatus, 'payment')}`}>
                  {booking.paymentStatus}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.bookingStatus, 'booking')}`}>
                  {booking.bookingStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Stay Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formatDate(booking.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formatDate(booking.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{booking.nights} night(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{booking.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{booking.adults} adults, {booking.children} children</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms:</span>
                    <span className="font-medium">{booking.rooms}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg">₦{booking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Applied:</span>
                    <span className="text-green-600 font-medium">{booking.discountApplied}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission:</span>
                    <span className="text-green-600 font-medium">₦{booking.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{booking.paymentMethod}</span>
                  </div>
                  {booking.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{booking.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Special Requests</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Name</span>
                    <div className="font-medium">{booking.customerName}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email</span>
                    <div className="font-medium">
                      <a href={`mailto:${booking.customerEmail}`} className="text-brand-green hover:text-brand-dark">
                        {booking.customerEmail}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone</span>
                    <div className="font-medium">
                      <a href={`tel:${booking.customerPhone}`} className="text-brand-green hover:text-brand-dark">
                        {booking.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Booking History</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-medium">{formatDateTime(booking.bookingDate)}</span>
                  </div>
                  {booking.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">{formatDateTime(booking.paymentDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bookings:</span>
                    <span className="font-medium">3 bookings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Since:</span>
                    <span className="font-medium">Jan 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Property Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-lg">{booking.hotelName}</span>
                  </div>
                  <div className="text-sm text-gray-600">{booking.hotelAddress}</div>
                  <div className="text-sm text-gray-600">{booking.hotelCity}</div>
                  <div className="text-sm">
                    <a href={`tel:${booking.hotelPhone}`} className="text-brand-green hover:text-brand-dark">
                      {booking.hotelPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href={`/admin/hotels/${booking.hotelId}`}
                    className="block px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    🏨 View Hotel Details
                  </Link>
                  <button className="w-full text-left px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                    📞 Call Hotel
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">
                    📧 Contact Hotel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={booking.paymentStatus}
                  onChange={(e) => handleStatusUpdate('paymentStatus', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                <select
                  value={booking.bookingStatus}
                  onChange={(e) => handleStatusUpdate('bookingStatus', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>

              {booking.bookingStatus === 'confirmed' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                📧 Send Confirmation Email
              </button>
              <button className="w-full px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                📱 Send WhatsApp Update
              </button>
              <button className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">
                📄 Download Invoice
              </button>
              <button className="w-full px-3 py-2 text-sm bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors">
                🔄 Modify Booking
              </button>
              <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
                💰 Process Refund
              </button>
            </div>
          </div>

          {/* Add Note */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note about this booking..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                rows={3}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="w-full px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {booking.modifications.map((mod, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{mod.type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(mod.date)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{mod.description}</p>
                  <p className="text-xs text-gray-400">by {mod.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancelling this booking. This will be logged and may be shared with the customer.
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancellationReason.trim() || loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}