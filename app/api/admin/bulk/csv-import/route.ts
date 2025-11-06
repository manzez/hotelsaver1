import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface CSVHotelRow {
  id?: string
  name: string
  city: string
  basePriceNGN: number | string
  stars: number | string
  type: string
  description?: string
  images?: string
  amenities?: string
}

interface ProcessedHotel {
  id: string
  name: string
  city: string
  basePriceNGN: number
  stars: number
  type: string
  description: string
  images: string[]
  amenities: string[]
  createdAt?: string
  updatedAt?: string
}

interface ImportResult {
  success: boolean
  processed: number
  created: number
  updated: number
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
  preview?: ProcessedHotel[]
}

function parseCSVRow(row: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    
    if (char === '"' && (i === 0 || row[i - 1] === ',')) {
      inQuotes = true
    } else if (char === '"' && inQuotes && (i === row.length - 1 || row[i + 1] === ',')) {
      inQuotes = false
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function validateHotelData(data: CSVHotelRow, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Hotel name is required')
  }
  
  if (!data.city || typeof data.city !== 'string' || data.city.trim().length === 0) {
    errors.push('City is required')
  }
  
  const validCities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri', 'Kano', 'Ibadan']
  if (data.city && !validCities.includes(data.city)) {
    errors.push(`City must be one of: ${validCities.join(', ')}`)
  }
  
  const price = Number(data.basePriceNGN)
  if (isNaN(price) || price <= 0) {
    errors.push('Base price must be a positive number')
  }
  
  const stars = Number(data.stars)
  if (isNaN(stars) || stars < 1 || stars > 5) {
    errors.push('Stars rating must be between 1 and 5')
  }
  
  if (!data.type || !['Hotel', 'Apartment', 'Resort'].includes(data.type)) {
    errors.push('Type must be Hotel, Apartment, or Resort')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function processHotelRow(data: CSVHotelRow): ProcessedHotel {
  const images = data.images 
    ? data.images.split(';').map(img => img.trim()).filter(Boolean)
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
  
  const amenities = data.amenities 
    ? data.amenities.split(';').map(amenity => amenity.trim()).filter(Boolean)
    : ['WiFi', 'Air Conditioning', '24/7 Reception']
  
  return {
    id: data.id || `HTL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name.trim(),
    city: data.city.trim(),
    basePriceNGN: Number(data.basePriceNGN),
    stars: Number(data.stars),
    type: data.type.trim(),
    description: data.description?.trim() || `Beautiful ${data.type.toLowerCase()} in ${data.city}`,
    images,
    amenities,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'preview' // 'preview' or 'import'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }
    
    const csvContent = await file.text()
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0)
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV must contain at least a header row and one data row' },
        { status: 400 }
      )
    }
    
    // Parse header
    const headerLine = lines[0]
    const headers = parseCSVRow(headerLine).map(h => h.toLowerCase().replace(/\s+/g, ''))
    
    // Required headers mapping
    const headerMap: { [key: string]: string } = {
      'name': 'name',
      'hotelname': 'name',
      'city': 'city',
      'location': 'city',
      'price': 'basePriceNGN',
      'baseprice': 'basePriceNGN',
      'basepricengn': 'basePriceNGN',
      'stars': 'stars',
      'rating': 'stars',
      'starrating': 'stars',
      'type': 'type',
      'hoteltype': 'type',
      'description': 'description',
      'images': 'images',
      'amenities': 'amenities',
      'id': 'id'
    }
    
    // Check required headers
    const requiredFields = ['name', 'city', 'basePriceNGN', 'stars', 'type']
    const mappedHeaders = headers.map(h => headerMap[h] || h)
    const missingFields = requiredFields.filter(field => !mappedHeaders.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Process data rows
    const result: ImportResult = {
      success: true,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
      preview: []
    }
    
    const processedHotels: ProcessedHotel[] = []
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const dataRow = parseCSVRow(lines[i])
        const rowData: any = {}
        
        // Map CSV columns to hotel fields
        headers.forEach((header, index) => {
          const mappedField = headerMap[header] || header
          if (dataRow[index] !== undefined) {
            rowData[mappedField] = dataRow[index]
          }
        })
        
        // Validate row data
        const validation = validateHotelData(rowData, i + 1)
        if (!validation.isValid) {
          result.errors.push({
            row: i + 1,
            error: validation.errors.join(', '),
            data: rowData
          })
          continue
        }
        
        // Process valid row
        const processedHotel = processHotelRow(rowData)
        processedHotels.push(processedHotel)
        result.processed++
        
      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: `Failed to process row: ${error}`,
          data: null
        })
      }
    }
    
    // For preview mode, return processed data without saving
    if (mode === 'preview') {
      result.preview = processedHotels.slice(0, 10) // Limit preview to 10 items
      return NextResponse.json(result)
    }
    
    // For import mode, save to file system
    if (mode === 'import' && processedHotels.length > 0) {
      try {
        // Load existing hotels
        const hotelsPath = path.join(process.cwd(), 'lib.hotels.json')
        let existingHotels: ProcessedHotel[] = []
        
        if (fs.existsSync(hotelsPath)) {
          const hotelsData = fs.readFileSync(hotelsPath, 'utf8')
          existingHotels = JSON.parse(hotelsData)
        }
        
        // Create backup
        const backupPath = path.join(process.cwd(), `lib.hotels.backup.${new Date().toISOString().replace(/:/g, '-')}.json`)
        fs.writeFileSync(backupPath, JSON.stringify(existingHotels, null, 2))
        
        // Merge hotels (update existing, add new)
        const existingIds = new Set(existingHotels.map(h => h.id))
        
        processedHotels.forEach(newHotel => {
          if (existingIds.has(newHotel.id)) {
            // Update existing
            const index = existingHotels.findIndex(h => h.id === newHotel.id)
            existingHotels[index] = { ...existingHotels[index], ...newHotel, updatedAt: new Date().toISOString() }
            result.updated++
          } else {
            // Add new
            existingHotels.push(newHotel)
            result.created++
          }
        })
        
        // Save updated hotels
        fs.writeFileSync(hotelsPath, JSON.stringify(existingHotels, null, 2))
        
      } catch (error) {
        console.error('Error saving hotels:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to save hotels to database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error processing CSV import:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}