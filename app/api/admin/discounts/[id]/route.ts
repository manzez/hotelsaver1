import { NextRequest, NextResponse } from 'next/server'
import { getDiscountFor } from '@/lib/discounts'

// Simple authorization check
function authorize(request: NextRequest): boolean {
  const adminKey = request.headers.get('X-Admin-Key')
  const expectedKey = process.env.ADMIN_API_KEY || 'dev-admin-key-2024'
  
  console.log('Auth check - Received key:', adminKey?.substring(0, 10) + '...')
  console.log('Auth check - Expected key:', expectedKey?.substring(0, 10) + '...')
  console.log('Auth check - Keys match:', adminKey === expectedKey)
  
  return adminKey === expectedKey
}

// GET /api/admin/discounts/[id] - Get discount for a specific hotel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const discountRate = getDiscountFor(params.id)
    const discountPercentage = Math.round(discountRate * 100)
    
    return NextResponse.json({
      hotelId: params.id,
      discountRate,
      discountPercentage,
      message: 'Discount retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting discount:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/discounts/[id] - Update discount for a specific hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { discountPercentage } = await request.json()
    
    // Validate input
    if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json(
        { error: 'Invalid discount percentage. Must be between 0 and 100.' },
        { status: 400 }
      )
    }

    // Convert percentage to decimal
    const discountRate = discountPercentage / 100

    // Import fs for file operations
    const fs = require('fs')
    const path = require('path')
    
    // Read current discounts data
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json')
    const discountsData = fs.readFileSync(discountsPath, 'utf8')
    const discounts = JSON.parse(discountsData)
    
    // Create backup first
    const backupPath = path.join(process.cwd(), `lib.discounts.backup.${new Date().toISOString().replace(/:/g, '-')}.json`)
    fs.writeFileSync(backupPath, discountsData)
    console.log('Discounts backup created:', backupPath)
    
    // Update the discount for this hotel
    if (discountPercentage === 15) {
      // If setting to default (15%), remove from overrides
      delete discounts.overrides[params.id]
      console.log('Removed override for hotel:', params.id, '(using default 15%)')
    } else {
      // Add/update override
      discounts.overrides[params.id] = discountRate
      console.log('Set discount override for hotel:', params.id, 'to', discountPercentage + '%')
    }
    
    // Write updated discounts back to file
    fs.writeFileSync(discountsPath, JSON.stringify(discounts, null, 2))
    console.log('Discounts file updated successfully')
    
    // Verify the write was successful
    const verifyData = fs.readFileSync(discountsPath, 'utf8')
    const verifyDiscounts = JSON.parse(verifyData)
    const verifiedRate = verifyDiscounts.overrides[params.id] || verifyDiscounts.default
    const verifiedPercentage = Math.round(verifiedRate * 100)
    
    console.log('Verification - Discount percentage is now:', verifiedPercentage + '%')
    
    return NextResponse.json({
      ok: true,
      hotelId: params.id,
      discountPercentage,
      discountRate,
      message: 'Discount updated successfully',
      backupCreated: backupPath.split(path.sep).pop(),
      verification: {
        requestedPercentage: discountPercentage,
        verifiedPercentage
      }
    })

  } catch (error) {
    console.error('Error updating discount:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/discounts/[id] - Remove discount override (use default)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Import fs for file operations
    const fs = require('fs')
    const path = require('path')
    
    // Read current discounts data
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json')
    const discountsData = fs.readFileSync(discountsPath, 'utf8')
    const discounts = JSON.parse(discountsData)
    
    // Create backup first
    const backupPath = path.join(process.cwd(), `lib.discounts.backup.${new Date().toISOString().replace(/:/g, '-')}.json`)
    fs.writeFileSync(backupPath, discountsData)
    
    // Remove override (hotel will use default discount)
    delete discounts.overrides[params.id]
    
    // Write updated discounts back to file
    fs.writeFileSync(discountsPath, JSON.stringify(discounts, null, 2))
    
    const defaultPercentage = Math.round(discounts.default * 100)
    
    return NextResponse.json({
      ok: true,
      hotelId: params.id,
      discountPercentage: defaultPercentage,
      discountRate: discounts.default,
      message: 'Discount override removed, using default discount',
      backupCreated: backupPath.split(path.sep).pop()
    })

  } catch (error) {
    console.error('Error removing discount override:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}