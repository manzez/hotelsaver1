// components/AvailabilityStatus.tsx - Real-time availability display component
'use client'

import { useAvailability, formatAvailabilityStatus } from '@/hooks/useAvailability'
import { useState } from 'react'

interface AvailabilityStatusProps {
  hotelId: string
  checkIn: string
  checkOut: string
  rooms: number
  className?: string
  showDetails?: boolean
  refreshInterval?: number // in ms
}

export default function AvailabilityStatus({
  hotelId,
  checkIn,
  checkOut,
  rooms,
  className = '',
  showDetails = false,
  refreshInterval = 30000 // 30 seconds default
}: AvailabilityStatusProps) {
  const [showFullDetails, setShowFullDetails] = useState(false)

  const { availability, loading, error, refresh } = useAvailability({
    hotelId,
    checkIn,
    checkOut,
    rooms
  })

  const status = formatAvailabilityStatus(availability)

  const getStatusIcon = () => {
    if (loading) return '⏳'
    switch (status.status) {
      case 'available': return '✅'
      case 'limited': return '⚠️'
      case 'unavailable': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = () => {
    switch (status.color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200'
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'red': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (error) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-md border text-sm ${className}`}>
        <span className="mr-1">❌</span>
        <span>Availability check failed</span>
        <button 
          onClick={refresh}
          className="ml-2 text-xs underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Main Status Badge */}
      <div 
        className={`inline-flex items-center px-2 py-1 rounded-md border text-sm cursor-pointer ${getStatusColor()}`}
        onClick={() => showDetails && setShowFullDetails(!showFullDetails)}
      >
        <span className="mr-1">{getStatusIcon()}</span>
        <span>{status.message}</span>
        {showDetails && (
          <span className="ml-1 text-xs">
            {showFullDetails ? '▼' : '▶'}
          </span>
        )}
      </div>

      {/* Detailed Availability */}
      {showDetails && showFullDetails && availability && (
        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white text-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Daily Availability</h4>
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="space-y-1">
            {availability.dailyAvailability.map((day, index) => (
              <div key={day.date} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <div className="flex items-center">
                  <span className={`mr-2 ${day.canAccommodate ? 'text-green-600' : 'text-red-600'}`}>
                    {day.roomsAvailable === -1 ? 'No data' : `${day.roomsAvailable} rooms`}
                  </span>
                  <span className="text-xs">
                    {day.canAccommodate ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {availability.cacheTimestamp && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
              Last updated: {new Date(availability.cacheTimestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}