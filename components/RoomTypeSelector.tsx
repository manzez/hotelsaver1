// components/RoomTypeSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { RoomType, HotelRoomData } from '@/lib/room-types'

interface RoomTypeSelectorProps {
  hotelId: string
  onRoomSelect: (roomType: RoomType) => void
  selectedRoomId?: string
}

export default function RoomTypeSelector({ 
  hotelId, 
  onRoomSelect, 
  selectedRoomId 
}: RoomTypeSelectorProps) {
  const [roomData, setRoomData] = useState<HotelRoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        setLoading(true)
        const response = await fetch(`/api/hotels/${hotelId}/rooms`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch room types')
        }
        
        const data = await response.json()
        setRoomData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room types')
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      fetchRoomTypes()
    }
  }, [hotelId])

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Room Types</h3>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 border-red-200 bg-red-50">
        <p className="text-red-700">Error loading room types: {error}</p>
      </div>
    )
  }

  if (!roomData || roomData.roomTypes.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Room Types</h3>
        <p className="text-gray-600">No room types available for this hotel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Your Room</h3>
      
      <div className="grid gap-4">
        {roomData.roomTypes.map((room) => (
          <div
            key={room.id}
            className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedRoomId === room.id 
                ? 'border-brand-green bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onRoomSelect(room)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{room.name}</h4>
              <div className="text-right">
                <div className="text-xl font-bold text-brand-green">
                  ₦{(room.pricePerNight || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per night</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-3">{room.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-blue-100 text-blue-800">
                👥 {room.maxOccupancy} guests
              </span>
              <span className="badge bg-purple-100 text-purple-800">
                🛏️ {room.bedType}
              </span>
              {room.size && (
                <span className="badge bg-green-100 text-green-800">
                  📐 {room.size}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Amenities:</div>
              <div className="flex flex-wrap gap-1">
                {room.amenities.slice(0, 6).map((amenity, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 6 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    +{room.amenities.length - 6} more
                  </span>
                )}
              </div>
            </div>
            
            {selectedRoomId === room.id && (
              <div className="mt-3 p-2 bg-green-100 rounded-md text-green-800 text-sm font-medium">
                ✓ Selected
              </div>
            )}
          </div>
        ))}
      </div>
      
      {roomData.amenities.length > 0 && (
        <div className="card p-4 bg-gray-50">
          <h4 className="font-semibold mb-2">Hotel Amenities</h4>
          <div className="flex flex-wrap gap-1">
            {roomData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-white text-gray-700 rounded-full border"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}