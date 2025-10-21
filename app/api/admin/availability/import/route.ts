import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'default-key'

export async function POST(req: NextRequest) {
  // Check admin authentication
  const authKey = req.headers.get('x-admin-key')
  if (authKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 })
    }

    const header = lines[0].toLowerCase()
    if (!header.includes('slug') || !header.includes('date') || !header.includes('rooms')) {
      return NextResponse.json({ 
        error: 'CSV must have columns: slug, date, roomsAvailable (or rooms)' 
      }, { status: 400 })
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: [] as string[]
    }

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim())
      
      if (row.length < 3) {
        results.errors.push(`Line ${i + 1}: insufficient columns`)
        continue
      }

      const [slug, dateStr, roomsStr] = row
      const roomsAvailable = parseInt(roomsStr)
      
      if (!slug || !dateStr || isNaN(roomsAvailable)) {
        results.errors.push(`Line ${i + 1}: invalid data (slug: ${slug}, date: ${dateStr}, rooms: ${roomsStr})`)
        continue
      }

      // Parse date (expect YYYY-MM-DD format)
      const date = new Date(dateStr + 'T00:00:00.000Z')
      if (isNaN(date.getTime())) {
        results.errors.push(`Line ${i + 1}: invalid date format ${dateStr} (use YYYY-MM-DD)`)
        continue
      }

      try {
        // Find hotel by slug
        const hotel = await prisma.hotel.findUnique({ where: { slug } })
        if (!hotel) {
          results.errors.push(`Line ${i + 1}: hotel not found for slug ${slug}`)
          continue
        }

        // Upsert availability record
        await prisma.availability.upsert({
          where: {
            hotelId_date: {
              hotelId: hotel.id,
              date
            }
          },
          update: {
            roomsAvailable
          },
          create: {
            hotelId: hotel.id,
            date,
            roomsAvailable
          }
        })

        results.imported++
      } catch (error) {
        results.errors.push(`Line ${i + 1}: database error - ${error}`)
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Processed ${lines.length - 1} rows`,
      results
    })

  } catch (error) {
    console.error('Availability import error:', error)
    return NextResponse.json(
      { error: 'Failed to process availability import' },
      { status: 500 }
    )
  }
}