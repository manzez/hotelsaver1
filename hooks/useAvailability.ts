// hooks/useAvailability.ts - React hooks for real-time availability
import { useState, useEffect, useCallback, useRef } from 'react'

export interface AvailabilityQuery {
  hotelId: string
  checkIn: string
  checkOut: string
  rooms: number
}

export interface AvailabilityResult {
  hotelId: string
  isAvailable: boolean
  hasCompleteData: boolean
  minRoomsAvailable: number
  dailyAvailability: Array<{
    date: string
    roomsAvailable: number
    canAccommodate: boolean
  }>
  cacheTimestamp?: number
}

export interface UseAvailabilityReturn {
  availability: AvailabilityResult | null
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Hook for checking single hotel availability
 */
export function useAvailability(query: AvailabilityQuery | null): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const checkAvailability = useCallback(async () => {
    if (!query) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        hotelId: query.hotelId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        rooms: query.rooms.toString()
      })

      const response = await fetch(`/api/hotels/availability/check?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAvailability(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability')
    } finally {
      setLoading(false)
    }
  }, [query?.hotelId, query?.checkIn, query?.checkOut, query?.rooms])

  const debouncedCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      checkAvailability()
    }, 100) // 100ms debounce
  }, [checkAvailability])

  useEffect(() => {
    if (!query) return
    
    debouncedCheck()

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debouncedCheck, query?.hotelId, query?.checkIn, query?.checkOut, query?.rooms])

  return {
    availability,
    loading,
    error,
    refresh: checkAvailability
  }
}

/**
 * Hook for checking multiple hotels availability
 */
export function useBulkAvailability(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  rooms: number
): {
  availability: Record<string, AvailabilityResult>
  loading: boolean
  error: string | null
  refresh: () => void
} {
  const [availability, setAvailability] = useState<Record<string, AvailabilityResult>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkBulkAvailability = useCallback(async () => {
    if (!hotelIds.length || !checkIn || !checkOut) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hotels/availability/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelIds,
          checkIn,
          checkOut,
          rooms
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extract results from API response
      const availabilityMap = data.results.reduce((acc: Record<string, AvailabilityResult>, result: any) => {
        acc[result.hotelId] = result
        return acc
      }, {})
      
      setAvailability(availabilityMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check bulk availability')
    } finally {
      setLoading(false)
    }
  }, [hotelIds.join(','), checkIn, checkOut, rooms])

  useEffect(() => {
    checkBulkAvailability()
  }, [checkBulkAvailability])

  return {
    availability,
    loading,
    error,
    refresh: checkBulkAvailability
  }
}

/**
 * Hook for real-time availability updates (polling)
 */
export function useRealTimeAvailability(
  query: AvailabilityQuery | null,
  intervalMs: number = 30000 // 30 seconds default
): UseAvailabilityReturn {
  const basicResult = useAvailability(query)
  const intervalRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    if (!query || !basicResult.refresh) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      basicResult.refresh()
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [query?.hotelId, query?.checkIn, query?.checkOut, query?.rooms, basicResult.refresh, intervalMs])

  return basicResult
}

/**
 * Hook for availability with WebSocket updates (future enhancement)
 */
export function useWebSocketAvailability(query: AvailabilityQuery | null): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Implement WebSocket connection for real-time updates
  // For now, fall back to regular polling

  const refresh = useCallback(async () => {
    if (!query) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        hotelId: query.hotelId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        rooms: query.rooms.toString()
      })

      const response = await fetch(`/api/hotels/availability/check?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAvailability(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    availability,
    loading,
    error,
    refresh
  }
}

/**
 * Utility function to format availability status for display
 */
export function formatAvailabilityStatus(availability: AvailabilityResult | null): {
  status: 'available' | 'unavailable' | 'limited' | 'unknown'
  message: string
  color: 'green' | 'red' | 'yellow' | 'gray'
} {
  if (!availability) {
    return {
      status: 'unknown',
      message: 'Checking availability...',
      color: 'gray'
    }
  }

  if (!availability.hasCompleteData) {
    return {
      status: 'unknown',
      message: 'Limited availability data',
      color: 'gray'
    }
  }

  if (availability.isAvailable) {
    return {
      status: 'available',
      message: `${availability.minRoomsAvailable} rooms available`,
      color: 'green'
    }
  }

  if (availability.minRoomsAvailable > 0) {
    return {
      status: 'limited',
      message: `Only ${availability.minRoomsAvailable} rooms available`,
      color: 'yellow'
    }
  }

  return {
    status: 'unavailable',
    message: 'No rooms available',
    color: 'red'
  }
}