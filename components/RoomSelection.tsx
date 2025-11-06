// components/RoomSelection.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RoomType, HotelRoomData } from '@/lib/room-types'
import RoomAvailability from './RoomAvailability'

interface RoomSelectionProps {
  hotelId: string
  basePrice: number
  searchParams: {
    checkIn?: string
    checkOut?: string
    adults?: string
    children?: string
    rooms?: string
  }
}

export default function RoomSelection({ 
  hotelId, 
  basePrice,
  searchParams 
}: RoomSelectionProps) {
  const [roomData, setRoomData] = useState<HotelRoomData | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoomTypes() {
      try {
        setLoading(true)
        
        // Add timeout for mobile networks
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`/api/hotels/${hotelId}/rooms`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to fetch room types: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        setRoomData(data)
        
        // Auto-select the first available room
        if (data.roomTypes && data.roomTypes.length > 0) {
          setSelectedRoom(data.roomTypes[0])
        }
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
        <h3 className="text-lg font-semibold">Available Rooms</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Rooms</h3>
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-red-700">Unable to load room types. Using standard pricing.</p>
        </div>
      </div>
    )
  }

  if (!roomData || roomData.roomTypes.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Rooms</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">Standard Room</h4>
              <p className="text-gray-600 text-sm">Comfortable accommodation with essential amenities</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-brand-green">
                ₦{basePrice.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per night</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const buildBookingUrl = (room: RoomType) => {
    const params = new URLSearchParams({
      propertyId: hotelId,
      roomId: room.id,
      price: String(room.pricePerNight || 0),
      ...(searchParams.checkIn && { checkIn: searchParams.checkIn }),
      ...(searchParams.checkOut && { checkOut: searchParams.checkOut }),
      ...(searchParams.adults && { adults: searchParams.adults }),
      ...(searchParams.children && { children: searchParams.children }),
      ...(searchParams.rooms && { rooms: searchParams.rooms })
    })
    return `/book?${params.toString()}`
  }

  const buildNegotiateUrl = (room: RoomType) => {
    const params = new URLSearchParams({
      propertyId: hotelId,
      roomId: room.id,
      ...(searchParams.checkIn && { checkIn: searchParams.checkIn }),
      ...(searchParams.checkOut && { checkOut: searchParams.checkOut }),
      ...(searchParams.adults && { adults: searchParams.adults }),
      ...(searchParams.children && { children: searchParams.children }),
      ...(searchParams.rooms && { rooms: searchParams.rooms })
    })
    return `/negotiate?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-semibold">Choose Your Room</h3>
        {selectedRoom && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Selected Room</div>
            <div className="font-semibold text-brand-green">
              ₦{(selectedRoom.pricePerNight || 0).toLocaleString()}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {roomData.roomTypes.map((room) => (
          <div
            key={room.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedRoom?.id === room.id 
                ? 'border-brand-green bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRoom(room)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{room.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    👥 {room.maxOccupancy} guests
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    🛏️ {room.bedType}
                  </span>
                  {room.size && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      📐 {room.size}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-3">
                <div className="text-xl font-bold text-brand-green">
                  ₦{(room.pricePerNight || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">per night</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-medium">Amenities: </span>
              {room.amenities.slice(0, 4).join(', ')}
              {room.amenities.length > 4 && ` +${room.amenities.length - 4} more`}
            </div>
            
            <div className="mb-3">
              <RoomAvailability 
                hotelId={hotelId}
                roomId={room.id}
                checkIn={searchParams.checkIn}
                checkOut={searchParams.checkOut}
              />
            </div>
            
            {selectedRoom?.id === room.id && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-green-200">
                <Link 
                  href={buildBookingUrl(room)}
                  className="flex-1 text-center py-2 bg-brand-green text-white text-sm font-medium rounded hover:bg-brand-dark transition-colors"
                >
                  Book This Room
                </Link>
                <Link 
                  href={buildNegotiateUrl(room)}
                  className="flex-1 text-center py-2 border border-brand-green text-brand-green text-sm font-medium rounded hover:bg-green-50 transition-colors"
                >
                  Negotiate Price
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedRoom && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Room Features</h4>
          <div className="flex flex-wrap gap-1">
            {selectedRoom.amenities.map((amenity, index) => (
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