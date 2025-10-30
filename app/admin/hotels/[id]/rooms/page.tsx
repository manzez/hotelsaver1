'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface RoomType {
  id: string
  name: string
  description: string
  basePrice: number
  maxOccupancy: number
  bedType: string
  roomSize: number // in square meters
  amenities: string[]
  images: string[]
  totalRooms: number
  availableRooms: number
}

interface Room {
  id: string
  roomTypeId: string
  roomNumber: string
  floor: number
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  lastCleaned: string
  lastBooked: string
  currentBooking?: {
    id: string
    guestName: string
    checkIn: string
    checkOut: string
  }
}

interface RoomBooking {
  id: string
  roomId: string
  roomNumber: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  specialRequests?: string
}

// Mock data
const mockRoomTypes: RoomType[] = [
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    description: 'Spacious room with modern amenities and city view',
    basePrice: 185000,
    maxOccupancy: 2,
    bedType: 'King Size',
    roomSize: 35,
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'City View'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    totalRooms: 120,
    availableRooms: 95
  },
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    description: 'Luxurious suite with separate living area and premium amenities',
    basePrice: 350000,
    maxOccupancy: 4,
    bedType: 'King Size + Sofa Bed',
    roomSize: 65,
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Ocean View', 'Living Area', 'Kitchenette'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    totalRooms: 30,
    availableRooms: 22
  },
  {
    id: 'presidential-suite',
    name: 'Presidential Suite',
    description: 'Ultimate luxury with panoramic views and exclusive services',
    basePrice: 750000,
    maxOccupancy: 6,
    bedType: 'Master Bedroom + Guest Room',
    roomSize: 120,
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'Balcony', 'Panoramic View', 'Living Area', 'Dining Area', 'Butler Service'],
    images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    totalRooms: 5,
    availableRooms: 4
  }
]

const mockRooms: Room[] = [
  {
    id: 'room-101',
    roomTypeId: 'deluxe-room',
    roomNumber: '101',
    floor: 1,
    status: 'available',
    lastCleaned: '2025-10-30T08:00:00Z',
    lastBooked: '2025-10-28T14:00:00Z'
  },
  {
    id: 'room-102',
    roomTypeId: 'deluxe-room',
    roomNumber: '102',
    floor: 1,
    status: 'occupied',
    lastCleaned: '2025-10-29T08:00:00Z',
    lastBooked: '2025-10-29T15:00:00Z',
    currentBooking: {
      id: 'BK001',
      guestName: 'John Adebayo',
      checkIn: '2025-10-29',
      checkOut: '2025-11-01'
    }
  },
  {
    id: 'room-501',
    roomTypeId: 'executive-suite',
    roomNumber: '501',
    floor: 5,
    status: 'maintenance',
    lastCleaned: '2025-10-28T08:00:00Z',
    lastBooked: '2025-10-26T14:00:00Z'
  }
]

const mockBookings: RoomBooking[] = [
  {
    id: 'BK001',
    roomId: 'room-102',
    roomNumber: '102',
    guestName: 'John Adebayo',
    guestEmail: 'john.adebayo@email.com',
    checkIn: '2025-10-29',
    checkOut: '2025-11-01',
    nights: 3,
    totalAmount: 555000,
    status: 'confirmed',
    specialRequests: 'Late check-in requested'
  },
  {
    id: 'BK002',
    roomId: 'room-201',
    roomNumber: '201',
    guestName: 'Sarah Okafor',
    guestEmail: 'sarah.okafor@email.com',
    checkIn: '2025-11-05',
    checkOut: '2025-11-07',
    nights: 2,
    totalAmount: 370000,
    status: 'pending'
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 border-green-200'
    case 'occupied': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'maintenance': return 'bg-red-100 text-red-800 border-red-200'
    case 'cleaning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function RoomManagementPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'types' | 'bookings'>('overview')
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(mockRoomTypes)
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [bookings, setBookings] = useState<RoomBooking[]>(mockBookings)
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
  const availableRooms = rooms.filter(r => r.status === 'available').length
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

  const filteredRooms = rooms.filter(room => {
    const matchesType = !selectedRoomType || room.roomTypeId === selectedRoomType
    const matchesFloor = !selectedFloor || room.floor === parseInt(selectedFloor)
    const matchesStatus = !selectedStatus || room.status === selectedStatus
    return matchesType && matchesFloor && matchesStatus
  })

  const floors = [...new Set(rooms.map(r => r.floor))].sort()

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
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

  const handleRoomStatusChange = (roomId: string, newStatus: string) => {
    setLoading(true)
    setTimeout(() => {
      setRooms(prev => prev.map(room =>
        room.id === roomId
          ? { ...room, status: newStatus as Room['status'] }
          : room
      ))
      setLoading(false)
    }, 500)
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
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600">Manage rooms, types, and availability</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-brand-green text-white hover:bg-brand-dark rounded-md transition-colors">
            ➕ Add Room Type
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">
            📋 Add Room
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-4">🏨</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 mr-4">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{availableRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-orange-600 mr-4">👤</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{occupiedRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-purple-600 mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Room Overview', icon: '🏨' },
              { id: 'rooms', label: 'Individual Rooms', icon: '🚪' },
              { id: 'types', label: 'Room Types', icon: '🏷️' },
              { id: 'bookings', label: 'Room Bookings', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Room Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters */}
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                      <select
                        value={selectedRoomType}
                        onChange={(e) => setSelectedRoomType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                      >
                        <option value="">All Types</option>
                        {roomTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                      <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                      >
                        <option value="">All Floors</option>
                        {floors.map(floor => (
                          <option key={floor} value={floor}>Floor {floor}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="cleaning">Cleaning</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Room Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-6 gap-2">
                    {filteredRooms.map(room => {
                      const roomType = roomTypes.find(t => t.id === room.roomTypeId)
                      return (
                        <div
                          key={room.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                            room.status === 'available' ? 'bg-green-50 border-green-200' :
                            room.status === 'occupied' ? 'bg-blue-50 border-blue-200' :
                            room.status === 'maintenance' ? 'bg-red-50 border-red-200' :
                            'bg-yellow-50 border-yellow-200'
                          }`}
                          title={`Room ${room.roomNumber} - ${roomType?.name} - ${room.status}`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{room.roomNumber}</div>
                            <div className="text-xs text-gray-600">{roomType?.name}</div>
                            {room.currentBooking && (
                              <div className="text-xs text-blue-600 mt-1">
                                {room.currentBooking.guestName}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Individual Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Room</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Floor</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Current Guest</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Last Cleaned</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRooms.map(room => {
                      const roomType = roomTypes.find(t => t.id === room.roomTypeId)
                      return (
                        <tr key={room.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{room.roomNumber}</td>
                          <td className="px-4 py-3 text-gray-600">{roomType?.name}</td>
                          <td className="px-4 py-3 text-gray-600">Floor {room.floor}</td>
                          <td className="px-4 py-3">
                            <select
                              value={room.status}
                              onChange={(e) => handleRoomStatusChange(room.id, e.target.value)}
                              disabled={loading}
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}
                            >
                              <option value="available">Available</option>
                              <option value="occupied">Occupied</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="cleaning">Cleaning</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {room.currentBooking ? room.currentBooking.guestName : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatDateTime(room.lastCleaned)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                                👁️ View
                              </button>
                              <button className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                                ✏️ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Room Types Tab */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {roomTypes.map(roomType => (
                <div key={roomType.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">₦{roomType.basePrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <img
                      src={roomType.images[0]}
                      alt={roomType.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{roomType.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span className="font-medium">{roomType.maxOccupancy} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bed Type:</span>
                      <span className="font-medium">{roomType.bedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Size:</span>
                      <span className="font-medium">{roomType.roomSize} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rooms:</span>
                      <span className="font-medium">{roomType.totalRooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">{roomType.availableRooms}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {roomType.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors text-sm">
                      ✏️ Edit Type
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                      📊 Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Room Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Booking ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Room</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Guest</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Check In</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Check Out</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Nights</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{booking.id}</td>
                        <td className="px-4 py-3 text-gray-600">{booking.roomNumber}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{booking.guestName}</div>
                            <div className="text-xs text-gray-500">{booking.guestEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(booking.checkIn)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(booking.checkOut)}</td>
                        <td className="px-4 py-3 text-gray-600">{booking.nights}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₦{booking.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                            >
                              👁️ View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}