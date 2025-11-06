import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface StatusUpdateRequest {
  operation: 'activate' | 'deactivate' | 'archive' | 'feature' | 'unfeature'
  hotelIds: string[]
  filters?: {
    cities?: string[]
    starRatings?: number[]
    priceRange?: {
      min?: number
      max?: number
    }
    types?: string[]
  }
}

interface Hotel {
  id: string
  name: string
  city: string
  basePriceNGN: number
  stars: number
  type: string
  status?: 'active' | 'inactive' | 'archived'
  featured?: boolean
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    const body: StatusUpdateRequest = await request.json()
    
    // Validate request
    if (!body.operation) {
      return NextResponse.json(
        { success: false, error: 'Operation is required' },
        { status: 400 }
      )
    }
    
    if (!body.hotelIds || !Array.isArray(body.hotelIds)) {
      return NextResponse.json(
        { success: false, error: 'Hotel IDs array is required' },
        { status: 400 }
      )
    }
    
    const validOperations = ['activate', 'deactivate', 'archive', 'feature', 'unfeature']
    if (!validOperations.includes(body.operation)) {
      return NextResponse.json(
        { success: false, error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Load hotels data
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json')
    if (!fs.existsSync(hotelsPath)) {
      return NextResponse.json(
        { success: false, error: 'Hotels database not found' },
        { status: 404 }
      )
    }
    
    const hotelsData = fs.readFileSync(hotelsPath, 'utf8')
    let hotels: Hotel[] = JSON.parse(hotelsData)
    
    // Create backup before making changes
    const backupPath = path.join(process.cwd(), `lib.hotels.backup.${new Date().toISOString().replace(/:/g, '-')}.json`)
    fs.writeFileSync(backupPath, JSON.stringify(hotels, null, 2))
    
    // Find target hotels
    let targetHotels = hotels.filter(hotel => body.hotelIds.includes(hotel.id))
    
    // Apply additional filters if provided
    if (body.filters) {
      const { cities, starRatings, priceRange, types } = body.filters
      
      targetHotels = targetHotels.filter(hotel => {
        let matches = true
        
        if (cities && cities.length > 0) {
          matches = matches && cities.includes(hotel.city)
        }
        
        if (starRatings && starRatings.length > 0) {
          matches = matches && starRatings.includes(hotel.stars)
        }
        
        if (priceRange) {
          if (priceRange.min !== undefined) {
            matches = matches && hotel.basePriceNGN >= priceRange.min
          }
          if (priceRange.max !== undefined) {
            matches = matches && hotel.basePriceNGN <= priceRange.max
          }
        }
        
        if (types && types.length > 0) {
          matches = matches && types.includes(hotel.type)
        }
        
        return matches
      })
    }
    
    if (targetHotels.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hotels matched the criteria',
        processed: 0,
        skipped: body.hotelIds.length
      })
    }
    
    // Apply status updates
    const results = {
      processed: 0,
      skipped: 0,
      errors: [] as Array<{ hotelId: string; error: string }>
    }
    
    const targetHotelIds = new Set(targetHotels.map(h => h.id))
    
    hotels.forEach((hotel, index) => {
      if (!targetHotelIds.has(hotel.id)) {
        return
      }
      
      try {
        // Ensure hotel has status and featured fields
        if (!hotel.status) {
          hotel.status = 'active'
        }
        if (hotel.featured === undefined) {
          hotel.featured = false
        }
        
        // Apply operation
        switch (body.operation) {
          case 'activate':
            if (hotel.status === 'archived') {
              results.errors.push({
                hotelId: hotel.id,
                error: 'Cannot activate archived hotel'
              })
              results.skipped++
            } else {
              hotel.status = 'active'
              results.processed++
            }
            break
            
          case 'deactivate':
            if (hotel.status === 'archived') {
              results.errors.push({
                hotelId: hotel.id,
                error: 'Cannot deactivate archived hotel'
              })
              results.skipped++
            } else {
              hotel.status = 'inactive'
              results.processed++
            }
            break
            
          case 'archive':
            hotel.status = 'archived'
            hotel.featured = false // Remove featured status when archiving
            results.processed++
            break
            
          case 'feature':
            if (hotel.status === 'active') {
              hotel.featured = true
              results.processed++
            } else {
              results.errors.push({
                hotelId: hotel.id,
                error: 'Cannot feature inactive or archived hotel'
              })
              results.skipped++
            }
            break
            
          case 'unfeature':
            hotel.featured = false
            results.processed++
            break
        }
        
        // Update timestamp
        hotel.updatedAt = new Date().toISOString()
        
      } catch (error) {
        results.errors.push({
          hotelId: hotel.id,
          error: `Failed to update: ${error}`
        })
        results.skipped++
      }
    })
    
    // Save updated hotels
    fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2))
    
    // Create operation log
    const logEntry = {
      timestamp: new Date().toISOString(),
      operation: body.operation,
      targetHotelIds: Array.from(targetHotelIds),
      filters: body.filters,
      results,
      performedBy: 'admin' // TODO: Get from auth session
    }
    
    // Save to operations log
    const logsPath = path.join(process.cwd(), 'lib', 'operation-logs.json')
    let logs: any[] = []
    
    try {
      if (fs.existsSync(logsPath)) {
        const logsData = fs.readFileSync(logsPath, 'utf8')
        logs = JSON.parse(logsData)
      }
    } catch (error) {
      console.warn('Could not load existing logs, starting fresh')
    }
    
    logs.push(logEntry)
    
    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000)
    }
    
    fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2))
    
    return NextResponse.json({
      success: true,
      operation: body.operation,
      processed: results.processed,
      skipped: results.skipped,
      errors: results.errors,
      message: `Successfully ${body.operation}d ${results.processed} hotel(s)${results.skipped > 0 ? `, skipped ${results.skipped}` : ''}`,
      backupCreated: backupPath.split('/').pop()
    })
    
  } catch (error) {
    console.error('Error in bulk status update:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return operation logs
    const logsPath = path.join(process.cwd(), 'lib', 'operation-logs.json')
    
    if (!fs.existsSync(logsPath)) {
      return NextResponse.json({
        success: true,
        logs: []
      })
    }
    
    const logsData = fs.readFileSync(logsPath, 'utf8')
    const logs = JSON.parse(logsData)
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const operation = searchParams.get('operation')
    
    let filteredLogs = logs
    
    // Filter by operation type if specified
    if (operation) {
      filteredLogs = logs.filter((log: any) => log.operation === operation)
    }
    
    // Sort by timestamp (newest first) and limit results
    filteredLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    filteredLogs = filteredLogs.slice(0, limit)
    
    return NextResponse.json({
      success: true,
      logs: filteredLogs,
      total: logs.length
    })
    
  } catch (error) {
    console.error('Error fetching operation logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}