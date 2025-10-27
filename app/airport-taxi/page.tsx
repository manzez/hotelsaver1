'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'

export default function AirportTaxiPage() {
  const router = useRouter()
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way')
  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('12:00')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('12:00')
  const [passengers, setPassengers] = useState(2)
  
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)

  // Nigerian airports and popular locations
  const locations = [
    'Murtala Muhammed International Airport (LOS) - Lagos',
    'Nnamdi Azikiwe International Airport (ABV) - Abuja', 
    'Port Harcourt International Airport (PHC) - Port Harcourt',
    'Sam Mbakwe International Airport (QOW) - Owerri',
    'Victoria Island - Lagos',
    'Ikeja - Lagos',
    'Lekki - Lagos',
    'Ikoyi - Lagos',
    'Ajah - Lagos',
    'Surulere - Lagos',
    'Wuse 2 - Abuja',
    'Garki - Abuja',
    'Maitama - Abuja',
    'Asokoro - Abuja',
    'GRA - Port Harcourt',
    'Trans Amadi - Port Harcourt',
    'World Bank - Owerri',
    'New Owerri - Owerri'
  ]

  const handlePickupSearch = (value: string) => {
    setPickupLocation(value)
    if (value.length > 2) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      )
      setPickupSuggestions(filtered)
      setShowPickupSuggestions(true)
    } else {
      setShowPickupSuggestions(false)
    }
  }

  const handleDestinationSearch = (value: string) => {
    setDestination(value)
    if (value.length > 2) {
      const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      )
      setDestinationSuggestions(filtered)
      setShowDestinationSuggestions(true)
    } else {
      setShowDestinationSuggestions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare booking data
    const bookingData = {
      tripType,
      pickupLocation,
      destination,
      flightNumber,
      pickupDate,
      pickupTime,
      returnDate: tripType === 'return' ? returnDate : null,
      returnTime: tripType === 'return' ? returnTime : null,
      passengers
    }

    // Navigate to booking confirmation with data
    const params = new URLSearchParams({
      service: 'airport-taxi',
      data: JSON.stringify(bookingData)
    })
    
    router.push(`/book?${params.toString()}`)
  }

  // Set default date to today
  const today = new Date().toISOString().split('T')[0]
  if (!pickupDate) setPickupDate(today)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚖 Airport Taxi</h1>
            <p className="text-lg text-gray-600 mb-1">Find the right ride for your trip</p>
            <p className="text-gray-500">Easy airport transfers to and from your accommodation</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6">
            {/* Trip Type Toggle */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-100">
                <button
                  type="button"
                  onClick={() => setTripType('one-way')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    tripType === 'one-way' 
                      ? 'bg-white text-brand-green border border-gray-200 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  One-way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('return')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    tripType === 'return' 
                      ? 'bg-white text-brand-green border border-gray-200 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Return
                </button>
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Pickup Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick-up location *
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => handlePickupSearch(e.target.value)}
                  onFocus={() => pickupLocation.length > 2 && setShowPickupSuggestions(true)}
                  placeholder="Enter pick-up location"
                  className="input"
                  required
                />
                
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {pickupSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setPickupLocation(suggestion)
                          setShowPickupSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {showPickupSuggestions && pickupSuggestions.length === 0 && pickupLocation.length > 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
                    0 results found
                  </div>
                )}
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  onFocus={() => destination.length > 2 && setShowDestinationSuggestions(true)}
                  placeholder="Enter destination"
                  className="input"
                  required
                />
                
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {destinationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setDestination(suggestion)
                          setShowDestinationSuggestions(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {showDestinationSuggestions && destinationSuggestions.length === 0 && destination.length > 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
                    0 results found
                  </div>
                )}
              </div>
            </div>

            {/* Flight Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Number (Optional)
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="e.g. BA075, AF852"
                className="input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Help us track your flight for pickup timing
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Date *
                </label>
                <input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  className="input"
                  title="Select pickup date"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Time *
                </label>
                <input
                  id="pickup-time"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="input"
                  title="Select pickup time"
                  required
                />
              </div>
            </div>

            {/* Return Date/Time (if return trip) */}
            {tripType === 'return' && (
              <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date *
                  </label>
                  <input
                    id="return-date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={pickupDate || today}
                    className="input"
                    title="Select return date"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="return-time" className="block text-sm font-medium text-gray-700 mb-2">
                    Return Time *  
                  </label>
                  <input
                    id="return-time"
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="input"
                    title="Select return time"
                    required
                  />
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of passengers
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="text-lg font-medium w-8 text-center">{passengers}</span>
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(8, passengers + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">Max 8 passengers</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-primary h-12 text-lg font-semibold"
            >
              🔍 Search Available Rides
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">🚗 What to expect:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Professional drivers with airport experience</li>
              <li>• Flight tracking for pickup timing</li>
              <li>• Meet & greet service at arrivals</li>  
              <li>• Fixed prices with no hidden charges</li>
              <li>• 24/7 customer support</li>
              <li>• Free cancellation up to 24h before</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}