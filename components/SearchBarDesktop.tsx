'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startOfDay, addDays } from 'date-fns'

import ClientDatepicker from './ClientDatepicker'

interface SearchBarDesktopProps {
  defaultCity?: string
  defaultHotelQuery?: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultAdults?: number
  defaultChildren?: number
  defaultRooms?: number
  defaultBudget?: string
  defaultStayType?: string
  submitLabel?: string
  onBeforeSubmit?: () => void
}

export default function SearchBarDesktop({
  defaultCity = '',
  defaultHotelQuery = '',
  defaultCheckIn = '',
  defaultCheckOut = '',
  defaultAdults = 2,
  defaultChildren = 0,
  defaultRooms = 1,
  defaultBudget = 'u80',
  defaultStayType = 'any',
  submitLabel = 'Search',
  onBeforeSubmit
}: SearchBarDesktopProps) {
  const router = useRouter()

  // Form state
  const [searchQuery, setSearchQuery] = useState(defaultHotelQuery || defaultCity)
  const [city, setCity] = useState(defaultCity)
  const [startDate, setStartDate] = useState<Date | null>(
    defaultCheckIn ? new Date(defaultCheckIn) : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    defaultCheckOut ? new Date(defaultCheckOut) : null
  )
  const [adults, setAdults] = useState(defaultAdults)
  const [children, setChildren] = useState(defaultChildren)
  const [rooms, setRooms] = useState(defaultRooms)
  const [budgetKey, setBudgetKey] = useState(defaultBudget)
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>(defaultStayType as any)

  // UI state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)

  // Refs
  const searchInputRef = useRef<HTMLDivElement>(null)
  const guestPickerRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Budget options
  const budgets = [
    { key: 'u80', label: 'Under ₦80k' },
    { key: '80_130', label: '₦80k–₦130k' },
    { key: '130_200', label: '₦130k–₦200k' },
    { key: '200p', label: '₦200k+' }
  ]

  // Guest summary
  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  // Search functionality
  const handleSearchInput = async (value: string) => {
    setSearchQuery(value)
    
    if (value.length >= 2) {
      try {
        const response = await fetch('/api/hotels-index')
        const data = await response.json()
        
        const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
        const cityResults = cities
          .filter(city => city.toLowerCase().includes(value.toLowerCase()))
          .map(city => ({ type: 'city', value: city, city }))
        
        const hotelResults = (data.hotels || [])
          .filter((hotel: any) => 
            hotel.name.toLowerCase().includes(value.toLowerCase()) ||
            hotel.city.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 5)
          .map((hotel: any) => ({ type: 'hotel', value: hotel.name, city: hotel.city }))
        
        setSearchResults([...cityResults, ...hotelResults])
        setShowSearchResults(true)
      } catch (error) {
        console.error('Search error:', error)
      }
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchSelect = (result: any) => {
    setSearchQuery(result.value)
    setCity(result.city || result.value)
    setShowSearchResults(false)
  }

  // Submit handler
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    try { onBeforeSubmit && onBeforeSubmit() } catch {}
    
    const searchCity = city || (searchResults.length > 0 ? searchResults[0].city : searchQuery)
    const hotelQuery = searchResults.find(r => r.type === 'hotel') ? searchQuery : ''

    const q = new URLSearchParams({
      city: searchCity || 'Lagos',
      hotelQuery: hotelQuery,
      checkIn: startDate ? startDate.toISOString().split('T')[0] : '',
      checkOut: endDate ? endDate.toISOString().split('T')[0] : '',
      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
      budget: budgetKey,
      stayType
    })

    router.push(`/search?${q.toString()}`)
  }

  return (
    <div className="w-full">
      {/* Desktop Search Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-soft p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row - Search Input */}
          <div className="relative" ref={searchInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Where to?</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true)
                }
              }}
              placeholder="Search destinations or hotels"
              className="w-full h-11 pl-3 pr-10 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
            <svg className="absolute right-3 top-1/2 transform translate-y-1 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0z" />
            </svg>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 text-gray-400 flex items-center justify-center">
                        {result.type === 'city' ? (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{result.value}</div>
                        <div className="text-sm text-gray-500">
                          {result.type === 'city' ? 'City' : `Hotel in ${result.city}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Single Row Layout - All on one line */}
          <div className="flex items-end gap-3">
            {/* Check In */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
              <input
                type="date"
                title="Check in date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setStartDate(date)
                  if (!endDate && date) {
                    setEndDate(addDays(date, 1))
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
              />
            </div>

            {/* Check Out */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
              <input
                type="date"
                title="Check out date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setEndDate(date)
                }}
                min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="relative flex-1" ref={guestPickerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
              <button
                type="button"
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full h-11 px-3 bg-white border border-gray-300 rounded-md text-gray-900 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all flex items-center justify-between"
              >
                <span className="truncate text-sm">{guestSummary}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Guest Picker Dropdown */}
              {showGuestPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] p-4 min-w-[280px]">
                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Adults</div>
                        <div className="text-sm text-gray-500">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={adults <= 1}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Children</div>
                        <div className="text-sm text-gray-500">Age 0-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={children <= 0}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(10, children + 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Rooms</div>
                        <div className="text-sm text-gray-500">How many rooms?</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={rooms <= 1}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(Math.min(10, rooms + 1))}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full mt-4 bg-brand-green hover:bg-brand-dark text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <select 
                title="Budget range"
                className="w-full h-11 px-3 pr-8 bg-white border border-gray-300 rounded-md text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green cursor-pointer transition-all" 
                value={budgetKey} 
                onChange={e => setBudgetKey(e.target.value)}
              >
                {budgets.map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform translate-y-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Stay Type */}
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                title="Property type"
                className="w-full h-11 px-3 pr-8 bg-white border border-gray-300 rounded-md text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green cursor-pointer transition-all" 
                value={stayType} 
                onChange={e => setStayType(e.target.value as 'any' | 'hotel' | 'apartment')}
              >
                <option value="any">Any</option>
                <option value="hotel">Hotels</option>
                <option value="apartment">Apartments</option>
              </select>
              <div className="absolute right-3 top-1/2 transform translate-y-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <button 
              type="submit"
              className="h-11 px-6 bg-brand-green hover:bg-brand-dark text-white rounded-md font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0z" />
              </svg>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}