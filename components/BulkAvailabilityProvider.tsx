// components/BulkAvailabilityProvider.tsx - Context provider for bulk availability
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useBulkAvailability, AvailabilityResult } from '@/hooks/useAvailability'

interface BulkAvailabilityContextType {
  availability: Record<string, AvailabilityResult>
  loading: boolean
  error: string | null
}

const BulkAvailabilityContext = createContext<BulkAvailabilityContextType>({
  availability: {},
  loading: false,
  error: null
})

interface BulkAvailabilityProviderProps {
  children: React.ReactNode
  hotelIds: string[]
  checkIn: string
  checkOut: string
  rooms: number
}

export function BulkAvailabilityProvider({
  children,
  hotelIds,
  checkIn,
  checkOut,
  rooms
}: BulkAvailabilityProviderProps) {
  const { availability, loading, error } = useBulkAvailability(
    hotelIds,
    checkIn,
    checkOut,
    rooms
  )

  return (
    <BulkAvailabilityContext.Provider value={{ availability, loading, error }}>
      {children}
    </BulkAvailabilityContext.Provider>
  )
}

export function useBulkAvailabilityContext() {
  return useContext(BulkAvailabilityContext)
}

// Optimized AvailabilityStatus that uses bulk data
interface OptimizedAvailabilityStatusProps {
  hotelId: string
  className?: string
  showDetails?: boolean
}

export function OptimizedAvailabilityStatus({
  hotelId,
  className = '',
  showDetails = false
}: OptimizedAvailabilityStatusProps) {
  const { availability, loading, error } = useBulkAvailabilityContext()
  const hotelAvailability = availability[hotelId]

  const getStatusDisplay = () => {
    if (loading) return { icon: '⏳', text: 'Checking...', color: 'text-gray-600' }
    if (error) return { icon: '❓', text: 'Check availability', color: 'text-gray-500' }
    if (!hotelAvailability) return { icon: '❓', text: 'Limited data', color: 'text-gray-500' }
    
    if (!hotelAvailability.hasCompleteData) {
      return { icon: '❓', text: 'Limited data', color: 'text-gray-500' }
    }

    if (hotelAvailability.isAvailable) {
      return { 
        icon: '✅', 
        text: `${hotelAvailability.minRoomsAvailable} rooms available`, 
        color: 'text-green-600' 
      }
    }

    if (hotelAvailability.minRoomsAvailable > 0) {
      return { 
        icon: '⚠️', 
        text: `Only ${hotelAvailability.minRoomsAvailable} rooms left`, 
        color: 'text-yellow-600' 
      }
    }

    return { icon: '❌', text: 'No rooms available', color: 'text-red-600' }
  }

  const status = getStatusDisplay()

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-xs">{status.icon}</span>
      <span className={`text-xs font-medium ${status.color}`}>
        {status.text}
      </span>
    </div>
  )
}