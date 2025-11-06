'use client'

import { useMemo, useState } from 'react'
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
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Driver offers shown when pick-up is an airport
  const [showOffers, setShowOffers] = useState(false)
  const [selectedDriverIdx, setSelectedDriverIdx] = useState(0)
  const [offerDrivers, setOfferDrivers] = useState<Array<{name:string; company:string; vehicle:string; color:string}>>([])
  
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

  const isAirportPickup = () => /airport/i.test(pickupLocation)

  // Randomized driver pool (ensures Corolla, Camry, Sienna appear in results)
  const DRIVER_POOL = useMemo(() => ([
    { name: 'Ikenna O',  company: 'Lagos City Cabs',     vehicle: 'Toyota Corolla',             color: 'Silver' },
    { name: 'Frank H',   company: 'Owerri Prime Taxis',  vehicle: 'Toyota Corolla',             color: 'White'  },
    { name: 'James O',   company: 'Mainland Shuttle',    vehicle: 'Toyota Corolla',             color: 'Red'    },

    { name: 'David J',   company: 'Abuja Express Rides', vehicle: 'Toyota Camry',               color: 'Black'  },
    { name: 'Sochi O',   company: 'Green Route Taxis',   vehicle: 'Toyota Camry',               color: 'Grey'   },

    { name: 'Chibueke O',company: 'PHC Transit',         vehicle: 'Toyota Sienna (7 seater)',   color: 'Blue'   },
    { name: 'Chinedu U', company: 'Capital City Cabs',   vehicle: 'Toyota Sienna (7 seater)',   color: 'Gold'   },
  ]), [])

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function pickDrivers(): Array<{name:string; company:string; vehicle:string; color:string}> {
    const corollas = DRIVER_POOL.filter(d => /Corolla/i.test(d.vehicle))
    const camrys   = DRIVER_POOL.filter(d => /Camry/i.test(d.vehicle))
    const siennas  = DRIVER_POOL.filter(d => /Sienna/i.test(d.vehicle))

    const selected: typeof DRIVER_POOL = []
    // Ensure one from each category
    selected.push(shuffle(corollas)[0])
    selected.push(shuffle(camrys)[0])
    selected.push(shuffle(siennas)[0])

    // Pick one extra from remaining pool (avoid duplicates)
    const remaining = DRIVER_POOL.filter(d => !selected.includes(d))
    if (remaining.length > 0) selected.push(shuffle(remaining)[0])

    return shuffle(selected)
  }

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
    // If pickup is an airport, destination is free text (no suggestions)
    if (isAirportPickup()) {
      setShowDestinationSuggestions(false)
      setDestinationSuggestions([])
      return
    }
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
    // If pick-up is an airport, show curated drivers and collect phone to confirm
    if (isAirportPickup()) {
      setOfferDrivers(pickDrivers())
      setSelectedDriverIdx(0)
      setShowOffers(true)
      return
    }

    // Otherwise keep the existing flow → book page
    const bookingData = {
      tripType,
      pickupLocation,
      destination,
      flightNumber,
      pickupDate,
      pickupTime,
      returnDate: tripType === 'return' ? returnDate : null,
      returnTime: tripType === 'return' ? returnTime : null,
      passengers,
    }
    const params = new URLSearchParams({ service: 'airport-taxi', data: JSON.stringify(bookingData) })
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
                  Destination * {isAirportPickup() && <span className="text-xs text-gray-500">(free text)</span>}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  onFocus={() => !isAirportPickup() && destination.length > 2 && setShowDestinationSuggestions(true)}
                  placeholder={isAirportPickup() ? 'Enter your hotel or exact address' : 'Enter destination'}
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
              {isAirportPickup() ? '� See Available Drivers' : '�🔍 Search Available Rides'}
            </button>
          </form>

          {showOffers && (
            <div className="mt-8 card p-6">
              <h3 className="text-xl font-bold mb-2">Available drivers</h3>
              <p className="text-sm text-gray-600 mb-4">These drivers are ready for airport pick-up. Choose your driver and add your phone number to confirm.</p>

              {/* Curated driver list with required vehicles and colors */}
              {offerDrivers.map((d, idx) => (
                <label key={idx} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer">
                  <input type="radio" name="driver" className="mt-1" checked={selectedDriverIdx===idx} onChange={() => setSelectedDriverIdx(idx)} />
                  <div>
                    <div className="font-semibold text-gray-900">{d.name} <span className="text-gray-500 font-normal">· {d.company}</span></div>
                    <div className="text-sm text-gray-600">{d.vehicle} · {d.color}</div>
                  </div>
                </label>
              ))}

              {/* Phone number and name */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your full name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Chinedu Okafor"
                    className="input"
                    value={customerName}
                    onChange={(e)=>setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your phone number *</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g., 0807 777 5545"
                    className="input"
                    value={customerPhone}
                    onChange={(e)=>setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  className="btn-primary px-5"
                  onClick={async () => {
                    if (!customerName.trim() || !customerPhone.trim()) {
                      alert('Please enter your name and phone number')
                      return
                    }

                    // Prepare booking request payload
                    const chosen = offerDrivers[selectedDriverIdx]
                    const payload = {
                      tripType,
                      pickupLocation,
                      destination,
                      flightNumber,
                      pickupDate,
                      pickupTime,
                      returnDate: tripType === 'return' ? returnDate : null,
                      returnTime: tripType === 'return' ? returnTime : null,
                      passengers,
                      name: customerName.trim(),
                      phone: customerPhone.trim(),
                      selectedDriver: chosen,
                    }
                    try {
                      const res = await fetch('/api/airport-taxi/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                      const data = await res.json()
                      if (res.ok) {
                        // Redirect to confirmation page
                        const confirmParams = new URLSearchParams({
                          service: 'airport-taxi',
                          bookingId: data.bookingId,
                          name: customerName.trim(),
                          driver: chosen.name,
                          vehicle: chosen.vehicle,
                          pickup: pickupLocation,
                          destination: destination,
                          date: pickupDate,
                          time: pickupTime
                        })
                        router.push(`/confirmation?${confirmParams.toString()}`)
                      } else {
                        alert(data?.message || 'Failed to confirm booking. Please try again.')
                      }
                    } catch {
                      alert('Network error. Please try again.')
                    }
                  }}
                >
                  Confirm Booking
                </button>
                <button className="btn-ghost px-5" onClick={()=>setShowOffers(false)}>Back</button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                We’ll send you a confirmation SMS. Our taxi will be ready for you on your arrival. We track your flight in real time so no need to call us. Our taxi agent will have your name on a board at the arrival door.
              </p>
            </div>
          )}

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