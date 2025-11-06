import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface DiscountCampaignRequest {
  name: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  startDate: string
  endDate: string
  targetCities: string[]
  targetStarRatings: number[]
  targetHotelTypes: string[]
  minimumBookingValue: number
  maxRedemptions: number
  isActive: boolean
}

interface Campaign {
  id: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  startDate: string
  endDate: string
  targetCities: string[]
  targetStarRatings: number[]
  targetHotelTypes: string[]
  minimumBookingValue: number
  maxRedemptions: number
  currentRedemptions: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscountCampaignRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.discountType || !body.discountValue) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, discountType, discountValue' },
        { status: 400 }
      )
    }

    // Validate discount value
    if (body.discountType === 'percentage' && (body.discountValue <= 0 || body.discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount must be between 1-100' },
        { status: 400 }
      )
    }

    if (body.discountType === 'fixed' && body.discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Fixed discount amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Load existing campaigns
    const campaignsPath = path.join(process.cwd(), 'lib', 'campaigns.json')
    let campaigns: Campaign[] = []
    
    try {
      if (fs.existsSync(campaignsPath)) {
        const campaignsData = fs.readFileSync(campaignsPath, 'utf8')
        campaigns = JSON.parse(campaignsData)
      }
    } catch (error) {
      console.warn('Could not load existing campaigns, starting fresh')
    }

    // Create new campaign
    const newCampaign: Campaign = {
      id: `CAMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      description: body.description || '',
      discountType: body.discountType,
      discountValue: body.discountValue,
      startDate: body.startDate,
      endDate: body.endDate,
      targetCities: body.targetCities || [],
      targetStarRatings: body.targetStarRatings || [],
      targetHotelTypes: body.targetHotelTypes || [],
      minimumBookingValue: body.minimumBookingValue || 0,
      maxRedemptions: body.maxRedemptions || 0,
      currentRedemptions: 0,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin' // TODO: Get from auth session
    }

    // Add to campaigns list
    campaigns.push(newCampaign)

    // Save campaigns
    fs.writeFileSync(campaignsPath, JSON.stringify(campaigns, null, 2))

    // If campaign targets specific hotels, update discount overrides
    if (body.targetCities.length > 0 || body.targetStarRatings.length > 0 || body.targetHotelTypes.length > 0) {
      try {
        // Load hotels data
        const hotelsPath = path.join(process.cwd(), 'lib.hotels.json')
        const hotelsData = fs.readFileSync(hotelsPath, 'utf8')
        const hotels = JSON.parse(hotelsData)

        // Load discounts data
        const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json')
        let discounts: any = { default: 0.15, overrides: {} }
        
        if (fs.existsSync(discountsPath)) {
          const discountsData = fs.readFileSync(discountsPath, 'utf8')
          discounts = JSON.parse(discountsData)
        }

        // Filter hotels based on campaign criteria
        const targetHotels = hotels.filter((hotel: any) => {
          let matches = true

          if (body.targetCities.length > 0) {
            matches = matches && body.targetCities.includes(hotel.city)
          }

          if (body.targetStarRatings.length > 0) {
            matches = matches && body.targetStarRatings.includes(hotel.stars)
          }

          if (body.targetHotelTypes.length > 0) {
            matches = matches && body.targetHotelTypes.includes(hotel.type)
          }

          return matches
        })

        // Apply campaign discount to target hotels
        const campaignDiscountRate = body.discountType === 'percentage' 
          ? body.discountValue / 100 
          : Math.min(body.discountValue / 100000, 0.5) // Convert fixed amount to rate, max 50%

        targetHotels.forEach((hotel: any) => {
          const currentDiscount = discounts.overrides[hotel.id] || discounts.default
          const newDiscount = Math.max(currentDiscount, campaignDiscountRate)
          
          discounts.overrides[hotel.id] = {
            rate: newDiscount,
            campaignId: newCampaign.id,
            campaignName: newCampaign.name,
            appliedAt: new Date().toISOString()
          }
        })

        // Save updated discounts
        fs.writeFileSync(discountsPath, JSON.stringify(discounts, null, 2))

        return NextResponse.json({
          success: true,
          campaign: newCampaign,
          hotelsAffected: targetHotels.length,
          message: `Campaign "${body.name}" created successfully and applied to ${targetHotels.length} hotels`
        })

      } catch (error) {
        console.error('Error applying campaign to hotels:', error)
        return NextResponse.json({
          success: true,
          campaign: newCampaign,
          hotelsAffected: 0,
          warning: 'Campaign created but could not be applied to hotels automatically'
        })
      }
    }

    return NextResponse.json({
      success: true,
      campaign: newCampaign,
      message: `Campaign "${body.name}" created successfully`
    })

  } catch (error) {
    console.error('Error creating discount campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const campaignsPath = path.join(process.cwd(), 'lib', 'campaigns.json')
    
    if (!fs.existsSync(campaignsPath)) {
      return NextResponse.json({
        success: true,
        campaigns: []
      })
    }

    const campaignsData = fs.readFileSync(campaignsPath, 'utf8')
    const campaigns = JSON.parse(campaignsData)

    // Filter active campaigns if requested
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const filteredCampaigns = activeOnly 
      ? campaigns.filter((c: Campaign) => c.isActive)
      : campaigns

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}