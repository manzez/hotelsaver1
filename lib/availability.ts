// Service Availability Management
// Handles inventory tracking for hire services (chairs, canopies, etc.)

export type ServiceType = 'HIRE' | 'SERVICE'

export interface Service {
  id: string
  title: string
  category: string
  type: ServiceType
  city: string
  provider: string
  description?: string
  amountNGN: number
  rating: number
  images: string[]
  active: boolean
  quantityTotal?: number
  quantityUnit?: string
  hireDurationHrs?: number
  createdAt: Date
  updatedAt: Date
}

export interface ServiceAvailability {
  id: string
  serviceId: string
  date: Date
  quantityAvailable: number
}

export interface ServiceBooking {
  id: string
  serviceId: string
  eventDate: Date
  quantity: number
  priceNGN: number
}

// Default quantities for hire services
export const DEFAULT_HIRE_QUANTITIES = {
  'canopy-tent-hire': 25,
  'plastic-chair-hire': 500,
  'sound-system-hire': 15,
  'cooler-hire': 30,
  'bus-hire': 8,
  'dj-services': 12, // Multiple DJs available
  'mc-services': 20, // Multiple MCs available  
  'live-band': 6
} as const

export interface AvailabilityCheck {
  serviceId: string
  date: Date
  quantity: number
  available: boolean
  maxAvailable: number
}

export interface ServiceWithAvailability extends Service {
  availability?: ServiceAvailability[]
  _availabilityStatus?: {
    [date: string]: number // available quantity for date
  }
}

/**
 * Check if a service has enough availability for booking
 */
export async function checkServiceAvailability(
  serviceId: string, 
  date: Date, 
  requestedQuantity: number = 1
): Promise<AvailabilityCheck> {
  
  // For demo purposes, using static data
  // In production, this would query the database
  const service = await getServiceById(serviceId)
  
  if (!service) {
    return {
      serviceId,
      date,
      quantity: requestedQuantity,
      available: false,
      maxAvailable: 0
    }
  }

  // SERVICE type items have unlimited availability
  if (service.type === 'SERVICE') {
    return {
      serviceId,
      date,
      quantity: requestedQuantity,
      available: true,
      maxAvailable: 999
    }
  }

  // HIRE type items have limited quantities
  const totalQuantity = service.quantityTotal || getDefaultQuantity(serviceId)
  const bookedQuantity = await getBookedQuantity(serviceId, date)
  const availableQuantity = totalQuantity - bookedQuantity

  return {
    serviceId,
    date,
    quantity: requestedQuantity,
    available: availableQuantity >= requestedQuantity,
    maxAvailable: availableQuantity
  }
}

/**
 * Get total booked quantity for a service on a specific date
 */
async function getBookedQuantity(serviceId: string, date: Date): Promise<number> {
  // In production, this would query ServiceBooking table
  // For demo, return simulated bookings
  const dateStr = date.toISOString().split('T')[0]
  
  // Simulate some bookings for popular items
  const mockBookings: Record<string, Record<string, number>> = {
    'plastic-chair-hire': {
      '2024-01-20': 150, // 150 chairs already booked
      '2024-01-21': 200,
      '2024-01-27': 300, // Weekend event
      '2024-01-28': 250
    },
    'canopy-tent-hire': {
      '2024-01-20': 5,
      '2024-01-21': 8,
      '2024-01-27': 15, // Busy weekend
      '2024-01-28': 12
    },
    'sound-system-hire': {
      '2024-01-27': 8, // Most sound systems booked for weekend
      '2024-01-28': 6
    }
  }
  
  return mockBookings[serviceId]?.[dateStr] || 0
}

/**
 * Get default quantity for a hire service
 */
function getDefaultQuantity(serviceId: string): number {
  return DEFAULT_HIRE_QUANTITIES[serviceId as keyof typeof DEFAULT_HIRE_QUANTITIES] || 10
}

/**
 * Get service by ID (placeholder for database query)
 */
async function getServiceById(serviceId: string): Promise<ServiceWithAvailability | null> {
  // In production, this would be a Prisma query
  // For demo, simulate service data based on our lib.services.json structure
  
  const hireServices = [
    'canopy-tent-hire',
    'plastic-chair-hire', 
    'sound-system-hire',
    'cooler-hire',
    'bus-hire',
    'dj-services',
    'mc-services',
    'live-band'
  ]
  
  if (hireServices.includes(serviceId)) {
    return {
      id: serviceId,
      title: serviceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: 'FurnitureRentals' as any,
      type: 'HIRE' as ServiceType,
      city: 'Lagos' as any,
      provider: 'Demo Provider',
      amountNGN: 50000,
      rating: 4.5,
      images: [],
      active: true,
      quantityTotal: getDefaultQuantity(serviceId),
      quantityUnit: serviceId.includes('chair') ? 'chairs' : serviceId.includes('canopy') ? 'tents' : 'units',
      hireDurationHrs: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  // Default to SERVICE type for other services
  return {
    id: serviceId,
    title: 'Service',
    category: 'Massage' as any,
    type: 'SERVICE' as ServiceType,
    city: 'Lagos' as any,
    provider: 'Demo Provider',
    amountNGN: 25000,
    rating: 4.5,
    images: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Reserve availability for a booking (decrease available quantity)
 */
export async function reserveAvailability(
  serviceId: string,
  date: Date,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  
  const check = await checkServiceAvailability(serviceId, date, quantity)
  
  if (!check.available) {
    return {
      success: false,
      message: `Only ${check.maxAvailable} units available on ${date.toDateString()}`
    }
  }
  
  // In production, this would create a ServiceBooking record
  // and update ServiceAvailability table
  
  return {
    success: true,
    message: `Reserved ${quantity} units for ${date.toDateString()}`
  }
}

/**
 * Get availability calendar for a service (next 30 days)
 */
export async function getAvailabilityCalendar(serviceId: string): Promise<{
  date: Date
  available: number
  total: number
  bookingRate: number
}[]> {
  
  const calendar = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const check = await checkServiceAvailability(serviceId, date, 1)
    const total = getDefaultQuantity(serviceId)
    const available = check.maxAvailable
    const bookingRate = total > 0 ? ((total - available) / total) * 100 : 0
    
    calendar.push({
      date,
      available,
      total,
      bookingRate
    })
  }
  
  return calendar
}

/**
 * Get popular booking times for services
 */
export function getPopularBookingTimes() {
  return [
    { time: 'Morning (8AM-12PM)', label: 'Morning', popular: false },
    { time: 'Afternoon (12PM-6PM)', label: 'Afternoon', popular: true },
    { time: 'Evening (6PM-12AM)', label: 'Evening', popular: true },
    { time: 'Full Day (8AM-8PM)', label: 'Full Day', popular: false }
  ]
}

/**
 * Calculate pricing based on demand and availability
 */
export function calculateDynamicPricing(
  basePrice: number,
  availabilityRate: number,
  isWeekend: boolean = false
): { price: number; surge: number } {
  
  let surge = 1.0
  
  // High demand pricing (low availability)
  if (availabilityRate < 0.2) {
    surge = 1.5 // 50% increase
  } else if (availabilityRate < 0.4) {
    surge = 1.25 // 25% increase
  }
  
  // Weekend pricing
  if (isWeekend) {
    surge *= 1.2 // Additional 20% for weekends
  }
  
  return {
    price: Math.round(basePrice * surge),
    surge: (surge - 1) * 100 // Percentage increase
  }
}

/**
 * Format availability message for UI
 */
export function formatAvailabilityMessage(check: AvailabilityCheck): string {
  if (check.available) {
    if (check.maxAvailable > 50) {
      return "✅ Available"
    } else if (check.maxAvailable > 10) {
      return `⚠️ ${check.maxAvailable} remaining`
    } else {
      return `🔥 Only ${check.maxAvailable} left!`
    }
  } else {
    return "❌ Fully booked"
  }
}