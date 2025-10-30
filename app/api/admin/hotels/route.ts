// app/api/admin/hotels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listHotels } from '@/lib/hotels-source'
import { HOTELS } from '@/lib/data'

// Simple validation system
interface ValidationError {
  field: string
  message: string
  code: string
}

interface ValidationResult {
  success: boolean
  errors: ValidationError[]
  data?: any
}

// Validation helpers
function validateHotelCreate(data: any): ValidationResult {
  const errors: ValidationError[] = []
  
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Hotel name is required', code: 'REQUIRED' })
  } else if (data.name.length > 200) {
    errors.push({ field: 'name', message: 'Hotel name too long (max 200 characters)', code: 'TOO_LONG' })
  }
  
  if (!['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'].includes(data.city)) {
    errors.push({ field: 'city', message: 'Invalid city. Must be Lagos, Abuja, Port Harcourt, or Owerri', code: 'INVALID_VALUE' })
  }
  
  if (!data.basePriceNGN || typeof data.basePriceNGN !== 'number') {
    errors.push({ field: 'basePriceNGN', message: 'Price is required and must be a number', code: 'REQUIRED' })
  } else if (data.basePriceNGN < 1000) {
    errors.push({ field: 'basePriceNGN', message: 'Price must be at least ₦1,000', code: 'TOO_LOW' })
  } else if (data.basePriceNGN > 10000000) {
    errors.push({ field: 'basePriceNGN', message: 'Price too high (max ₦10,000,000)', code: 'TOO_HIGH' })
  }
  
  if (!data.stars || typeof data.stars !== 'number' || !Number.isInteger(data.stars)) {
    errors.push({ field: 'stars', message: 'Stars rating is required and must be an integer', code: 'REQUIRED' })
  } else if (data.stars < 1 || data.stars > 5) {
    errors.push({ field: 'stars', message: 'Stars rating must be between 1 and 5', code: 'OUT_OF_RANGE' })
  }
  
  if (!['Hotel', 'Apartment'].includes(data.type)) {
    errors.push({ field: 'type', message: 'Type must be Hotel or Apartment', code: 'INVALID_VALUE' })
  }
  
  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push({ field: 'images', message: 'At least one image is required', code: 'REQUIRED' })
  } else if (data.images.length > 20) {
    errors.push({ field: 'images', message: 'Maximum 20 images allowed', code: 'TOO_MANY' })
  } else {
    // Validate image URLs
    data.images.forEach((img: any, index: number) => {
      if (typeof img !== 'string' || !isValidURL(img)) {
        errors.push({ field: `images.${index}`, message: 'Invalid image URL', code: 'INVALID_URL' })
      }
    })
  }
  
  // Optional field validations
  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format', code: 'INVALID_EMAIL' })
  }
  
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length < 10)) {
    errors.push({ field: 'phone', message: 'Invalid phone number', code: 'INVALID_PHONE' })
  }
  
  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined
  }
}

function validateQueryParams(params: URLSearchParams): ValidationResult {
  const errors: ValidationError[] = []
  
  const limit = params.get('limit')
  if (limit) {
    const limitNum = Number(limit)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      errors.push({ field: 'limit', message: 'Limit must be between 1 and 1000', code: 'OUT_OF_RANGE' })
    }
  }
  
  const sortBy = params.get('sortBy')
  if (sortBy && !['name', 'city', 'price', 'stars', 'created'].includes(sortBy)) {
    errors.push({ field: 'sortBy', message: 'Invalid sortBy value', code: 'INVALID_VALUE' })
  }
  
  const sortOrder = params.get('sortOrder')
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push({ field: 'sortOrder', message: 'Invalid sortOrder value', code: 'INVALID_VALUE' })
  }
  
  return {
    success: errors.length === 0,
    errors
  }
}

function isValidURL(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Enhanced error handling
class APIError extends Error {
  constructor(public message: string, public status: number = 400, public code?: string) {
    super(message)
    this.name = 'APIError'
  }
}

function handleError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    }, { status: error.status })
  }
  
  return NextResponse.json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  }, { status: 500 })
}

function authorize(req: NextRequest): NextResponse | null {
  try {
    const key = req.headers.get('x-admin-key') || ''
    const expected = process.env.ADMIN_API_KEY || ''
    
    if (!expected) {
      throw new APIError('Admin API key not configured', 500, 'CONFIG_ERROR')
    }
    
    if (!key) {
      throw new APIError('Admin API key required', 401, 'AUTH_REQUIRED')
    }
    
    if (key !== expected) {
      throw new APIError('Invalid admin API key', 401, 'AUTH_INVALID')
    }
    
    return null
  } catch (error) {
    return handleError(error)
  }
}

// Updated function signature - already defined above

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

// Response formatting
function formatHotelResponse(hotel: any) {
  return {
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    stars: hotel.stars || 4,
    type: hotel.type || 'Hotel',
    basePriceNGN: hotel.basePriceNGN || hotel.price || 0,
    images: hotel.images || [],
    description: hotel.description,
    amenities: hotel.amenities || [],
    address: hotel.address,
    phone: hotel.phone,
    email: hotel.email,
    checkInTime: hotel.checkInTime || '15:00',
    checkOutTime: hotel.checkOutTime || '11:00',
    policies: hotel.policies || {},
    status: hotel.status || 'active',
    createdAt: hotel.createdAt || new Date().toISOString(),
    updatedAt: hotel.updatedAt || new Date().toISOString()
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = authorize(req)
    if (auth) return auth

    const { searchParams } = new URL(req.url)
    
    // Validate query parameters
    const validation = validateQueryParams(searchParams)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      }, { status: 400 })
    }

    // Extract and validate parameters
    const q = (searchParams.get('q') || '').toLowerCase().trim()
    const city = searchParams.get('city') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const status = searchParams.get('status') || 'active'
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const limit = Math.min(1000, Math.max(1, Number(searchParams.get('limit') || '200')))
    const offset = Math.max(0, Number(searchParams.get('offset') || '0'))

    if (isDbEnabled()) {
      try {
        // Use DB-backed source when enabled
        const hotels = await listHotels({ city, limit: limit + offset })
        
        // Apply comprehensive filtering
        let filtered = hotels.filter(h => {
          const name = String(h.name || '').toLowerCase()
          const id = String(h.id || '').toLowerCase()
          const description = String(h.description || '').toLowerCase()
          
          // Text search filter
          const matchesSearch = !q || name.includes(q) || id.includes(q) || description.includes(q)
          
          // City filter
          const matchesCity = !city || h.city === city
          
          // Price range filter
          const price = h.basePriceNGN || h.price || 0
          const matchesMinPrice = minPrice === undefined || price >= minPrice
          const matchesMaxPrice = maxPrice === undefined || price <= maxPrice
          
          // Status filter
          const matchesStatus = !status || (h.status || 'active') === status
          
          return matchesSearch && matchesCity && matchesMinPrice && matchesMaxPrice && matchesStatus
        })

        // Apply sorting
        filtered.sort((a, b) => {
          let aVal, bVal
          
          switch (sortBy) {
            case 'city':
              aVal = a.city || ''
              bVal = b.city || ''
              break
            case 'price':
              aVal = a.basePriceNGN || a.price || 0
              bVal = b.basePriceNGN || b.price || 0
              break
            case 'stars':
              aVal = a.stars || 0
              bVal = b.stars || 0
              break
            case 'created':
              aVal = (a as any)?.createdAt ? new Date((a as any).createdAt as any).getTime() : 0
              bVal = (b as any)?.createdAt ? new Date((b as any).createdAt as any).getTime() : 0
              break
            default: // name
              aVal = a.name || ''
              bVal = b.name || ''
          }
          
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
          return 0
        })

        // Apply pagination
        const total = filtered.length
        const paginatedResults = filtered.slice(offset, offset + limit)
        const results = paginatedResults.map(formatHotelResponse)

        return NextResponse.json({
          success: true,
          data: {
            hotels: results,
            pagination: {
              total,
              limit,
              offset,
              hasMore: offset + limit < total
            }
          }
        })
      } catch (error) {
        // Fall back to JSON on DB error
        console.error('Admin hotels DB error, falling back to JSON:', error)
      }
    }

    // JSON fallback with enhanced filtering and sorting
    let filtered = HOTELS.filter((h: any) => {
      const name = String(h.name || '').toLowerCase()
      const id = String(h.id || '').toLowerCase()
      const description = String(h.description || '').toLowerCase()
      
      // Text search filter
      const matchesSearch = !q || name.includes(q) || id.includes(q) || description.includes(q)
      
      // City filter
      const matchesCity = !city || String(h.city || '') === city
      
      // Price range filter
      const price = h.basePriceNGN || h.price || 0
      const matchesMinPrice = minPrice === undefined || price >= minPrice
      const matchesMaxPrice = maxPrice === undefined || price <= maxPrice
      
      // Status filter
      const matchesStatus = !status || (h.status || 'active') === status
      
      return matchesSearch && matchesCity && matchesMinPrice && matchesMaxPrice && matchesStatus
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'city':
          aVal = a.city || ''
          bVal = b.city || ''
          break
        case 'price':
          aVal = a.basePriceNGN || a.price || 0
          bVal = b.basePriceNGN || b.price || 0
          break
        case 'stars':
          aVal = a.stars || 0
          bVal = b.stars || 0
          break
        case 'created':
          aVal = (a as any)?.createdAt ? new Date((a as any).createdAt as any).getTime() : 0
          bVal = (b as any)?.createdAt ? new Date((b as any).createdAt as any).getTime() : 0
          break
        default: // name
          aVal = a.name || ''
          bVal = b.name || ''
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Apply pagination
    const total = filtered.length
    const paginatedResults = filtered.slice(offset, offset + limit)
    const results = paginatedResults.map(formatHotelResponse)

    return NextResponse.json({
      success: true,
      data: {
        hotels: results,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    })
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/admin/hotels - Create new hotel
export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req)
    if (auth) return auth

    const hotelData = await req.json()
    
    // Validate input data
    const validation = validateHotelCreate(hotelData)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      }, { status: 400 })
    }

    // Generate unique ID if not provided
    const hotelId = hotelData.id || `hotel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Check if hotel ID already exists
    if (HOTELS.find((h: any) => h.id === hotelId)) {
      throw new APIError('Hotel with this ID already exists', 409, 'DUPLICATE_ID')
    }

    // Create new hotel object with all required fields
    const newHotel = {
      ...validation.data,
      id: hotelId,
      status: hotelData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional computed fields
      bookingCount: 0,
      averageRating: 0,
      totalRevenue: 0
    }

    // TODO: In production, save to database
    // await createHotel(newHotel)
    
    // For development, add to in-memory array (temporary)
    HOTELS.push(newHotel)

    return NextResponse.json({
      success: true,
      data: formatHotelResponse(newHotel),
      message: 'Hotel created successfully'
    }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/admin/hotels - Bulk update hotels
export async function PUT(req: NextRequest) {
  try {
    const auth = authorize(req)
    if (auth) return auth

    const { action, hotelIds, updates } = await req.json()
    
    if (!action || typeof action !== 'string') {
      throw new APIError('Action is required', 400, 'MISSING_ACTION')
    }

    if (!Array.isArray(hotelIds) || hotelIds.length === 0) {
      throw new APIError('Hotel IDs array is required', 400, 'MISSING_HOTEL_IDS')
    }

    let updatedHotels: any[] = []
    let updatedCount = 0

    switch (action) {
      case 'update_status':
        if (!updates?.status || !['active', 'inactive', 'draft'].includes(updates.status)) {
          throw new APIError('Valid status is required for status update', 400, 'INVALID_STATUS')
        }
        
        // Update hotels in memory (replace with DB update in production)
        HOTELS.forEach((hotel: any) => {
          if (hotelIds.includes(hotel.id)) {
            hotel.status = updates.status
            hotel.updatedAt = new Date().toISOString()
            updatedHotels.push(formatHotelResponse(hotel))
            updatedCount++
          }
        })
        break

      case 'update_prices':
        if (!updates?.priceMultiplier || typeof updates.priceMultiplier !== 'number') {
          throw new APIError('Valid price multiplier is required', 400, 'INVALID_PRICE_MULTIPLIER')
        }
        
        HOTELS.forEach((hotel: any) => {
          if (hotelIds.includes(hotel.id)) {
            const oldPrice = hotel.basePriceNGN || hotel.price || 0
            hotel.basePriceNGN = Math.round(oldPrice * updates.priceMultiplier)
            hotel.updatedAt = new Date().toISOString()
            updatedHotels.push(formatHotelResponse(hotel))
            updatedCount++
          }
        })
        break

      case 'bulk_update':
        // Validate each update
        for (const hotelId of hotelIds) {
          const hotelUpdates = updates[hotelId]
          if (hotelUpdates) {
            const validation = validateHotelCreate({ ...hotelUpdates, id: hotelId })
            if (!validation.success) {
              throw new APIError(`Validation failed for hotel ${hotelId}`, 400, 'VALIDATION_ERROR')
            }
          }
        }

        // Apply updates
        HOTELS.forEach((hotel: any) => {
          if (hotelIds.includes(hotel.id) && updates[hotel.id]) {
            Object.assign(hotel, updates[hotel.id], {
              updatedAt: new Date().toISOString()
            })
            updatedHotels.push(formatHotelResponse(hotel))
            updatedCount++
          }
        })
        break

      default:
        throw new APIError(`Unknown action: ${action}`, 400, 'UNKNOWN_ACTION')
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedCount,
        hotels: updatedHotels
      },
      message: `${updatedCount} hotels updated successfully`
    })
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/admin/hotels - Bulk delete hotels
export async function DELETE(req: NextRequest) {
  try {
    const auth = authorize(req)
    if (auth) return auth

    const { ids, action = 'delete' } = await req.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new APIError('Hotel IDs array is required', 400, 'MISSING_HOTEL_IDS')
    }

    // Validate hotel IDs exist
    const existingIds = ids.filter(id => HOTELS.some((h: any) => h.id === id))
    if (existingIds.length === 0) {
      throw new APIError('No valid hotel IDs found', 404, 'NO_HOTELS_FOUND')
    }

    let deletedCount = 0
    const deletedHotels: any[] = []

    switch (action) {
      case 'delete':
        // Permanently delete hotels (replace with DB deletion in production)
        for (let i = HOTELS.length - 1; i >= 0; i--) {
          if (ids.includes(HOTELS[i].id)) {
            const deletedHotel = HOTELS.splice(i, 1)[0]
            deletedHotels.push(formatHotelResponse(deletedHotel))
            deletedCount++
          }
        }
        break

      case 'soft_delete':
        // Mark hotels as inactive instead of deleting
        HOTELS.forEach((hotel: any) => {
          if (ids.includes(hotel.id)) {
            hotel.status = 'inactive'
            hotel.deletedAt = new Date().toISOString()
            hotel.updatedAt = new Date().toISOString()
            deletedHotels.push(formatHotelResponse(hotel))
            deletedCount++
          }
        })
        break

      default:
        throw new APIError(`Unknown delete action: ${action}`, 400, 'UNKNOWN_ACTION')
    }

    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        action,
        hotels: deletedHotels
      },
      message: `${deletedCount} hotels ${action === 'soft_delete' ? 'deactivated' : 'deleted'} successfully`
    })
  } catch (error) {
    return handleError(error)
  }
}
