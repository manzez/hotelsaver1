// Location-Based Service Radius & Pricing
// Handles distance calculations, travel costs, and service area management

export interface Location {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
}

export interface ServiceProvider {
  id: string
  name: string
  baseLocation: Location
  serviceRadius: number // in kilometers
  travelRatePerKm: number // in NGN
  minimumTravelCharge: number // in NGN
  maxTravelDistance: number // in kilometers
  coverageAreas: string[] // specific areas covered
}

export interface LocationPricing {
  basePrice: number
  travelCost: number
  totalPrice: number
  distance: number
  travelTime: string
  withinRadius: boolean
  surchargeReason?: string
}

// Nigerian major cities coordinates
export const NIGERIAN_CITIES: Record<string, Location> = {
  'Lagos': {
    latitude: 6.5244,
    longitude: 3.3792,
    address: 'Lagos Island, Lagos',
    city: 'Lagos',
    state: 'Lagos'
  },
  'Abuja': {
    latitude: 9.0579,
    longitude: 7.4951,
    address: 'Central Business District, Abuja',
    city: 'Abuja', 
    state: 'FCT'
  },
  'Port Harcourt': {
    latitude: 4.8156,
    longitude: 7.0498,
    address: 'GRA Phase 2, Port Harcourt',
    city: 'Port Harcourt',
    state: 'Rivers'
  },
  'Owerri': {
    latitude: 5.4840,
    longitude: 7.0351,
    address: 'New Owerri, Owerri',
    city: 'Owerri',
    state: 'Imo'
  }
}

// Sample service providers with location data
export const SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'lagos-events-central',
    name: 'Lagos Events Central',
    baseLocation: NIGERIAN_CITIES['Lagos'],
    serviceRadius: 50,
    travelRatePerKm: 100,
    minimumTravelCharge: 2000,
    maxTravelDistance: 100,
    coverageAreas: ['Victoria Island', 'Ikoyi', 'Lekki', 'Ikeja', 'Surulere', 'Yaba', 'Gbagada']
  },
  {
    id: 'abuja-premium-services',
    name: 'Abuja Premium Services',
    baseLocation: NIGERIAN_CITIES['Abuja'],
    serviceRadius: 30,
    travelRatePerKm: 150,
    minimumTravelCharge: 3000,
    maxTravelDistance: 80,
    coverageAreas: ['Wuse', 'Maitama', 'Asokoro', 'Garki', 'Gwarinpa', 'Kubwa']
  },
  {
    id: 'ph-reliable-rentals',
    name: 'PH Reliable Rentals',
    baseLocation: NIGERIAN_CITIES['Port Harcourt'],
    serviceRadius: 40,
    travelRatePerKm: 120,
    minimumTravelCharge: 2500,
    maxTravelDistance: 90,
    coverageAreas: ['GRA', 'Old GRA', 'D-Line', 'Trans Amadi', 'Rumuola', 'Eliozu']
  },
  {
    id: 'owerri-events-hub',
    name: 'Owerri Events Hub',
    baseLocation: NIGERIAN_CITIES['Owerri'],
    serviceRadius: 25,
    travelRatePerKm: 80,
    minimumTravelCharge: 1500,
    maxTravelDistance: 60,
    coverageAreas: ['New Owerri', 'World Bank', 'Nekede', 'Wetheral', 'Control Post']
  }
]

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Estimate travel time based on distance and traffic conditions
 */
export function estimateTravelTime(distance: number, cityTraffic: 'low' | 'medium' | 'high' = 'medium'): string {
  const baseSpeed = {
    low: 40,    // 40 km/h
    medium: 25, // 25 km/h (typical Lagos traffic)
    high: 15    // 15 km/h (heavy traffic)
  }
  
  const hours = distance / baseSpeed[cityTraffic]
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`
  } else if (hours < 2) {
    const minutes = Math.round((hours - Math.floor(hours)) * 60)
    return `1 hour ${minutes > 0 ? `${minutes} minutes` : ''}`
  } else {
    return `${Math.round(hours)} hours`
  }
}

/**
 * Calculate location-based pricing for a service
 */
export function calculateLocationPricing(
  basePrice: number,
  provider: ServiceProvider,
  eventLocation: Location,
  isWeekend: boolean = false
): LocationPricing {
  
  const distance = calculateDistance(
    provider.baseLocation.latitude,
    provider.baseLocation.longitude,
    eventLocation.latitude,
    eventLocation.longitude
  )
  
  let travelCost = 0
  let surchargeReason = ''
  
  // Calculate travel cost
  if (distance <= provider.serviceRadius) {
    // Within free radius
    travelCost = 0
  } else if (distance <= provider.maxTravelDistance) {
    // Within service area but beyond free radius
    const chargeable_distance = distance - provider.serviceRadius
    travelCost = Math.max(
      chargeable_distance * provider.travelRatePerKm,
      provider.minimumTravelCharge
    )
  } else {
    // Beyond service area
    travelCost = -1 // Indicates not serviceable
  }
  
  // Weekend surcharge
  if (isWeekend && travelCost > 0) {
    travelCost *= 1.5
    surchargeReason = '50% weekend travel surcharge applied'
  }
  
  const withinRadius = distance <= provider.serviceRadius
  const totalPrice = travelCost >= 0 ? basePrice + travelCost : -1
  
  return {
    basePrice,
    travelCost,
    totalPrice,
    distance,
    travelTime: estimateTravelTime(distance, 'medium'),
    withinRadius,
    surchargeReason
  }
}

/**
 * Find available providers for a location
 */
export function findProvidersForLocation(
  eventLocation: Location,
  serviceType: string = 'general'
): Array<ServiceProvider & { pricing: LocationPricing }> {
  
  return SERVICE_PROVIDERS
    .map(provider => {
      const pricing = calculateLocationPricing(50000, provider, eventLocation) // Base price 50k
      return { ...provider, pricing }
    })
    .filter(provider => provider.pricing.totalPrice > 0) // Filter out unavailable
    .sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice) // Sort by total cost
}

/**
 * Check if location is within provider coverage
 */
export function isLocationCovered(
  provider: ServiceProvider,
  eventLocation: Location
): { covered: boolean; reason: string } {
  
  const distance = calculateDistance(
    provider.baseLocation.latitude,
    provider.baseLocation.longitude,
    eventLocation.latitude,
    eventLocation.longitude
  )
  
  if (distance > provider.maxTravelDistance) {
    return {
      covered: false,
      reason: `Location is ${distance.toFixed(1)}km away (max: ${provider.maxTravelDistance}km)`
    }
  }
  
  // Check if specific area is covered
  const isSpecificAreaCovered = provider.coverageAreas.some(area => 
    eventLocation.address.toLowerCase().includes(area.toLowerCase())
  )
  
  if (distance > provider.serviceRadius && !isSpecificAreaCovered) {
    return {
      covered: false,
      reason: `Outside service radius and not in covered areas`
    }
  }
  
  return { covered: true, reason: 'Location is covered' }
}

/**
 * Geocode Nigerian address (simulation for demo)
 */
export async function geocodeNigerianAddress(address: string): Promise<Location | null> {
  // In production, this would use Google Maps API or similar
  // For demo, we'll do basic pattern matching
  
  const lowerAddress = address.toLowerCase()
  
  // Check for known cities
  for (const [cityName, cityData] of Object.entries(NIGERIAN_CITIES)) {
    if (lowerAddress.includes(cityName.toLowerCase())) {
      // Add some random offset to simulate specific location within city
      const latOffset = (Math.random() - 0.5) * 0.1 // ~5km range
      const lonOffset = (Math.random() - 0.5) * 0.1
      
      return {
        latitude: cityData.latitude + latOffset,
        longitude: cityData.longitude + lonOffset,
        address,
        city: cityData.city,
        state: cityData.state
      }
    }
  }
  
  // Default to Lagos if can't determine
  return {
    latitude: 6.5244,
    longitude: 3.3792,
    address,
    city: 'Lagos',
    state: 'Lagos'
  }
}

/**
 * Get coverage map data for visualization
 */
export function getProviderCoverageMap(provider: ServiceProvider) {
  return {
    center: provider.baseLocation,
    freeRadius: provider.serviceRadius,
    maxRadius: provider.maxTravelDistance,
    coverageAreas: provider.coverageAreas,
    travelRate: provider.travelRatePerKm
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`
  } else {
    return `${distance.toFixed(1)}km`
  }
}

/**
 * Format travel cost for display
 */
export function formatTravelCost(cost: number): string {
  if (cost === 0) {
    return 'Free delivery'
  } else if (cost > 0) {
    return `₦${cost.toLocaleString()} travel charge`
  } else {
    return 'Not available'
  }
}