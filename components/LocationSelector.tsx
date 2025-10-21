'use client'
import { useState, useEffect } from 'react'
import { 
  geocodeNigerianAddress, 
  findProvidersForLocation, 
  formatDistance, 
  formatTravelCost,
  type Location,
  type ServiceProvider,
  type LocationPricing
} from '@/lib/location-pricing'

interface LocationSelectorProps {
  onLocationChange: (location: Location | null, providers: Array<ServiceProvider & { pricing: LocationPricing }>) => void
  serviceType?: string
  currentCity?: string
}

export default function LocationSelector({ 
  onLocationChange, 
  serviceType = 'general',
  currentCity = 'Lagos'
}: LocationSelectorProps) {
  
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState<Location | null>(null)
  const [providers, setProviders] = useState<Array<ServiceProvider & { pricing: LocationPricing }>>([])
  const [loading, setLoading] = useState(false)
  const [showProviders, setShowProviders] = useState(false)

  // Handle address change and geocoding
  const handleAddressChange = async (newAddress: string) => {
    setAddress(newAddress)
    
    if (newAddress.length < 10) {
      setLocation(null)
      setProviders([])
      onLocationChange(null, [])
      return
    }

    setLoading(true)
    
    try {
      const geocoded = await geocodeNigerianAddress(newAddress)
      if (geocoded) {
        setLocation(geocoded)
        const availableProviders = findProvidersForLocation(geocoded, serviceType)
        setProviders(availableProviders)
        onLocationChange(geocoded, availableProviders)
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Event Location Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter your event venue address..."
            className="input pr-10"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Common Areas Quick Select */}
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Popular areas in {currentCity}:</div>
          <div className="flex flex-wrap gap-1">
            {currentCity === 'Lagos' && (
              <>
                <button 
                  onClick={() => handleAddressChange('Victoria Island, Lagos')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Victoria Island
                </button>
                <button 
                  onClick={() => handleAddressChange('Lekki Phase 1, Lagos')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Lekki
                </button>
                <button 
                  onClick={() => handleAddressChange('Ikeja GRA, Lagos')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Ikeja
                </button>
                <button 
                  onClick={() => handleAddressChange('Surulere, Lagos')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Surulere
                </button>
              </>
            )}
            {currentCity === 'Abuja' && (
              <>
                <button 
                  onClick={() => handleAddressChange('Wuse 2, Abuja')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Wuse 2
                </button>
                <button 
                  onClick={() => handleAddressChange('Maitama, Abuja')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Maitama
                </button>
                <button 
                  onClick={() => handleAddressChange('Garki Area 11, Abuja')}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  Garki
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Location Summary */}
      {location && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              📍
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-900">{location.address}</div>
              <div className="text-sm text-blue-700">{location.city}, {location.state}</div>
              
              {providers.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowProviders(!showProviders)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    {providers.length} provider{providers.length > 1 ? 's' : ''} available
                    {showProviders ? ' ▲' : ' ▼'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Available Providers */}
      {location && showProviders && providers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Available Service Providers:</h4>
          {providers.map(provider => (
            <div key={provider.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-600">
                    Based in {provider.baseLocation.city}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Distance: {formatDistance(provider.pricing.distance)} • 
                    Travel time: {provider.pricing.travelTime}
                  </div>
                  
                  {/* Coverage Areas */}
                  <div className="text-xs text-gray-500 mt-1">
                    Covers: {provider.coverageAreas.slice(0, 3).join(', ')}
                    {provider.coverageAreas.length > 3 && ` +${provider.coverageAreas.length - 3} more`}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₦{provider.pricing.basePrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatTravelCost(provider.pricing.travelCost)}
                  </div>
                  {provider.pricing.travelCost > 0 && (
                    <div className="text-sm font-bold text-brand-green">
                      ₦{provider.pricing.totalPrice.toLocaleString()} total
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="mt-1">
                    {provider.pricing.withinRadius ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        ✓ Free delivery
                      </span>
                    ) : provider.pricing.travelCost > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        + Travel charge
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        ✗ Not available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Surcharge Notice */}
              {provider.pricing.surchargeReason && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ {provider.pricing.surchargeReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Providers Available */}
      {location && providers.length === 0 && !loading && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Service not available in this area</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            This location is outside our current service coverage. Please contact us for special arrangements.
          </p>
          <a 
            href="https://wa.me/2347077775545" 
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 underline mt-2"
          >
            Contact Support
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}