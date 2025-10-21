// Service Availability API
// GET /api/services/availability - Check availability for services

import { NextRequest, NextResponse } from 'next/server'
import { checkServiceAvailability, getAvailabilityCalendar } from '@/lib/availability'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')
  const dateStr = searchParams.get('date')
  const quantity = parseInt(searchParams.get('quantity') || '1')
  const calendar = searchParams.get('calendar') === 'true'

  if (!serviceId) {
    return NextResponse.json(
      { error: 'serviceId is required' },
      { status: 400 }
    )
  }

  try {
    if (calendar) {
      // Return 30-day availability calendar
      const calendarData = await getAvailabilityCalendar(serviceId)
      return NextResponse.json({ calendar: calendarData })
    }

    if (!dateStr) {
      return NextResponse.json(
        { error: 'date is required for availability check' },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    const availability = await checkServiceAvailability(serviceId, date, quantity)
    
    return NextResponse.json({
      serviceId,
      date: dateStr,
      requestedQuantity: quantity,
      available: availability.available,
      maxAvailable: availability.maxAvailable,
      message: availability.available 
        ? `${availability.maxAvailable} units available`
        : `Only ${availability.maxAvailable} units available, requested ${quantity}`
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}