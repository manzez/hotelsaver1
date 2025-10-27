// components/RoomAvailability.tsx
'use client'

import { useState, useEffect } from 'react'

interface RoomAvailabilityProps {
  hotelId: string
  roomId?: string
  checkIn?: string
  checkOut?: string
}

export default function RoomAvailability({ 
  hotelId, 
  roomId, 
  checkIn, 
  checkOut 
}: RoomAvailabilityProps) {
  const [availability, setAvailability] = useState<{
    available: boolean
    remainingRooms: number
    lastUpdated: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAvailability() {
      try {
        setLoading(true)
        
        // Simulate availability check (in real app, this would be an API call)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock availability data based on current time for demo
        const now = new Date().getTime()
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
        const baseAvailability = isWeekend ? 3 : 7 // Lower availability on weekends
        
        setAvailability({
          available: true,
          remainingRooms: Math.max(1, baseAvailability - (now % 5)),
          lastUpdated: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error checking availability:', error)
        setAvailability({
          available: true,
          remainingRooms: 5,
          lastUpdated: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      checkAvailability()
    }
  }, [hotelId, roomId, checkIn, checkOut])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Checking availability...</span>
      </div>
    )
  }

  if (!availability) {
    return null
  }

  const getAvailabilityColor = () => {
    if (availability.remainingRooms >= 5) return 'text-green-600'
    if (availability.remainingRooms >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAvailabilityMessage = () => {
    if (availability.remainingRooms >= 5) {
      return `${availability.remainingRooms}+ rooms available`
    }
    if (availability.remainingRooms === 1) {
      return 'Only 1 room left!'
    }
    return `Only ${availability.remainingRooms} rooms left!`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        availability.remainingRooms >= 5 ? 'bg-green-500' : 
        availability.remainingRooms >= 2 ? 'bg-yellow-500' : 'bg-red-500'
      }`}></div>
      <span className={getAvailabilityColor()}>
        {getAvailabilityMessage()}
      </span>
      {availability.remainingRooms <= 2 && (
        <span className="text-xs text-gray-500 ml-1">
          (High demand)
        </span>
      )}
    </div>
  )
}