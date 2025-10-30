import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminKey = request.headers.get('x-admin-key')
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'No file provided' 
      }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Please upload CSV or Excel files only.'
      }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()
    
    // Parse CSV content (basic parsing - for production, use proper CSV parser)
    const lines = fileContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Expected headers: id, basePriceNGN, roomType?, discountPercentage?
    const requiredHeaders = ['id', 'basePriceNGN']
    const hasRequiredHeaders = requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    )

    if (!hasRequiredHeaders) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file format. Required columns: Hotel ID, Base Price NGN',
        errors: [`Missing required headers: ${requiredHeaders.join(', ')}`]
      }, { status: 400 })
    }

    const processed = []
    const errors = []

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      try {
        const hotelId = values[0]
        const price = parseFloat(values[1])

        if (!hotelId || isNaN(price) || price < 0) {
          errors.push(`Row ${i + 1}: Invalid hotel ID or price`)
          continue
        }

        // In production, you would update the database here
        // For now, we'll just simulate success
        processed.push({
          hotelId,
          price,
          roomType: values[2] || 'standard',
          discount: values[3] ? parseFloat(values[3]) : 15
        })

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Processing error'}`)
      }
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processed.length} price updates`,
      processed: processed.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit errors shown
    })

  } catch (error) {
    console.error('Error importing prices:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process file. Please check the format and try again.'
    }, { status: 500 })
  }
}