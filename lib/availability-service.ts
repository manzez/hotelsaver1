// lib/availability-service.ts - Real-time availability management
import { prisma } from './prisma'

export interface AvailabilityQuery {
  hotelId: string
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
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

export interface BulkAvailabilityQuery {
  hotelIds: string[]
  checkIn: string
  checkOut: string
  rooms: number
}

class AvailabilityService {
  private cache = new Map<string, { data: AvailabilityResult; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Check availability for a single hotel
   */
  async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const cacheKey = this.getCacheKey(query)
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return { ...cached, cacheTimestamp: Date.now() }
    }

    const result = await this.fetchAvailability(query)
    this.setCache(cacheKey, result)
    
    return { ...result, cacheTimestamp: Date.now() }
  }

  /**
   * Check availability for multiple hotels
   */
  async checkBulkAvailability(query: BulkAvailabilityQuery): Promise<Record<string, AvailabilityResult>> {
    const results: Record<string, AvailabilityResult> = {}
    
    // Check cache first for each hotel
    const uncachedQueries: AvailabilityQuery[] = []
    
    for (const hotelId of query.hotelIds) {
      const hotelQuery = {
        hotelId,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        rooms: query.rooms
      }
      
      const cacheKey = this.getCacheKey(hotelQuery)
      const cached = this.getFromCache(cacheKey)
      
      if (cached) {
        results[hotelId] = { ...cached, cacheTimestamp: Date.now() }
      } else {
        uncachedQueries.push(hotelQuery)
      }
    }

    // Fetch uncached data in bulk
    if (uncachedQueries.length > 0) {
      const freshData = await this.fetchBulkAvailability({
        hotelIds: uncachedQueries.map(q => q.hotelId),
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        rooms: query.rooms
      })

      // Cache and add to results
      for (const [hotelId, availability] of Object.entries(freshData)) {
        const cacheKey = this.getCacheKey({
          hotelId,
          checkIn: query.checkIn,
          checkOut: query.checkOut,
          rooms: query.rooms
        })
        
        this.setCache(cacheKey, availability)
        results[hotelId] = { ...availability, cacheTimestamp: Date.now() }
      }
    }

    return results
  }

  /**
   * Update availability for a hotel (real-time updates)
   */
  async updateAvailability(hotelId: string, date: string, roomsAvailable: number): Promise<void> {
    const dateObj = new Date(date + 'T00:00:00.000Z')
    
    await prisma.availability.upsert({
      where: {
        hotelId_date: {
          hotelId,
          date: dateObj
        }
      },
      update: {
        roomsAvailable
      },
      create: {
        hotelId,
        date: dateObj,
        roomsAvailable
      }
    })

    // Invalidate relevant cache entries
    this.invalidateCacheForHotel(hotelId, date)
  }

  /**
   * Simulate real-time booking (reduce availability)
   */
  async processBooking(hotelId: string, checkIn: string, checkOut: string, roomsBooked: number): Promise<void> {
    const checkInDate = new Date(checkIn + 'T00:00:00.000Z')
    const checkOutDate = new Date(checkOut + 'T00:00:00.000Z')
    
    const nightsToUpdate = []
    for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
      nightsToUpdate.push(new Date(d))
    }

    // Update availability for each night
    for (const date of nightsToUpdate) {
      const existing = await prisma.availability.findUnique({
        where: {
          hotelId_date: {
            hotelId,
            date
          }
        }
      })

      if (existing) {
        const newAvailability = Math.max(0, existing.roomsAvailable - roomsBooked)
        await prisma.availability.update({
          where: {
            hotelId_date: {
              hotelId,
              date
            }
          },
          data: {
            roomsAvailable: newAvailability
          }
        })
      }
    }

    // Invalidate cache
    for (const date of nightsToUpdate) {
      this.invalidateCacheForHotel(hotelId, date.toISOString().split('T')[0])
    }
  }

  /**
   * Get availability trends for analytics
   */
  async getAvailabilityTrends(hotelId: string, days: number = 30): Promise<Array<{
    date: string
    roomsAvailable: number
    occupancyRate?: number
  }>> {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (days * 24 * 60 * 60 * 1000))

    const availability = await prisma.availability.findMany({
      where: {
        hotelId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get hotel total rooms for occupancy calculation
    // TODO: Add totalRooms field to hotel schema and regenerate Prisma client
    const totalRooms = 100 // Default assumption until schema is updated

    return availability.map(avail => ({
      date: avail.date.toISOString().split('T')[0],
      roomsAvailable: avail.roomsAvailable,
      occupancyRate: totalRooms > 0 ? ((totalRooms - avail.roomsAvailable) / totalRooms) * 100 : undefined
    }))
  }

  private async fetchAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const checkInDate = new Date(query.checkIn + 'T00:00:00.000Z')
    const checkOutDate = new Date(query.checkOut + 'T00:00:00.000Z')
    
    const availability = await prisma.availability.findMany({
      where: {
        hotelId: query.hotelId,
        date: {
          gte: checkInDate,
          lt: checkOutDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return this.processAvailabilityData(query, availability)
  }

  private async fetchBulkAvailability(query: BulkAvailabilityQuery): Promise<Record<string, AvailabilityResult>> {
    const checkInDate = new Date(query.checkIn + 'T00:00:00.000Z')
    const checkOutDate = new Date(query.checkOut + 'T00:00:00.000Z')
    
    const availability = await prisma.availability.findMany({
      where: {
        hotelId: {
          in: query.hotelIds
        },
        date: {
          gte: checkInDate,
          lt: checkOutDate
        }
      },
      orderBy: [
        { hotelId: 'asc' },
        { date: 'asc' }
      ]
    })

    // Group by hotel
    const availabilityByHotel = availability.reduce((acc, avail) => {
      if (!acc[avail.hotelId]) {
        acc[avail.hotelId] = []
      }
      acc[avail.hotelId].push(avail)
      return acc
    }, {} as Record<string, typeof availability>)

    const results: Record<string, AvailabilityResult> = {}
    
    for (const hotelId of query.hotelIds) {
      const hotelAvailability = availabilityByHotel[hotelId] || []
      results[hotelId] = this.processAvailabilityData(
        { hotelId, checkIn: query.checkIn, checkOut: query.checkOut, rooms: query.rooms },
        hotelAvailability
      )
    }

    return results
  }

  private processAvailabilityData(query: AvailabilityQuery, availability: any[]): AvailabilityResult {
    const checkInDate = new Date(query.checkIn + 'T00:00:00.000Z')
    const checkOutDate = new Date(query.checkOut + 'T00:00:00.000Z')
    const nightsRequired = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    const availabilityByDate = availability.reduce((acc, avail) => {
      const dateKey = avail.date.toISOString().split('T')[0]
      acc[dateKey] = avail.roomsAvailable
      return acc
    }, {} as Record<string, number>)

    let isAvailable = true
    let minRoomsAvailable = Infinity
    let hasCompleteData = true
    const dailyAvailability = []

    for (let i = 0; i < nightsRequired; i++) {
      const currentDate = new Date(checkInDate.getTime() + (i * 24 * 60 * 60 * 1000))
      const dateKey = currentDate.toISOString().split('T')[0]
      const roomsAvailable = availabilityByDate[dateKey]

      if (roomsAvailable === undefined) {
        hasCompleteData = false
        isAvailable = false
        dailyAvailability.push({
          date: dateKey,
          roomsAvailable: -1,
          canAccommodate: false
        })
      } else {
        const canAccommodate = roomsAvailable >= query.rooms
        dailyAvailability.push({
          date: dateKey,
          roomsAvailable,
          canAccommodate
        })
        
        if (!canAccommodate) {
          isAvailable = false
        }
        
        minRoomsAvailable = Math.min(minRoomsAvailable, roomsAvailable)
      }
    }

    if (minRoomsAvailable === Infinity) {
      minRoomsAvailable = hasCompleteData ? 0 : -1
    }

    return {
      hotelId: query.hotelId,
      isAvailable,
      hasCompleteData,
      minRoomsAvailable,
      dailyAvailability
    }
  }

  private getCacheKey(query: AvailabilityQuery): string {
    return `${query.hotelId}:${query.checkIn}:${query.checkOut}:${query.rooms}`
  }

  private getFromCache(key: string): AvailabilityResult | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: AvailabilityResult): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private invalidateCacheForHotel(hotelId: string, date: string): void {
    // Remove all cache entries that include this hotel and date
    for (const [key] of this.cache) {
      if (key.startsWith(hotelId + ':') && key.includes(date)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService()