'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { startOfDay, addDays, format } from 'date-fns'

import ClientDatepicker from './ClientDatepicker'
import { track } from '@/lib/analytics'

interface SearchBarMobileProps {
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

export default function SearchBarMobile({
  defaultCity = '',
  defaultHotelQuery = '',
  defaultCheckIn = '',
  defaultCheckOut = '',
  defaultAdults = 2,
  defaultChildren = 0,
  defaultRooms = 1,
  defaultBudget = 'u40',
  defaultStayType = 'any',
  submitLabel = 'Search',
  onBeforeSubmit
}: SearchBarMobileProps) {
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
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment' | 'high-security'>(defaultStayType as any)

  // UI state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)

  // Refs
  const searchInputRef = useRef<HTMLDivElement>(null)
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Budget options
  const budgets = [
    { key: 'u40', label: 'Under ₦40k' },
    { key: 'u80', label: 'Under ₦80k' },
    { key: '80_130', label: '₦80k–₦130k' },
    { key: '130_200', label: '₦130k–₦200k' },
    { key: '200p', label: '₦200k+' }
  ]

  // Guest summary
  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  // Date range label
  const formatRangeLabel = () => {
    if (startDate && endDate) {
      // Use consistent date-fns formatting to avoid hydration issues
      return `${format(startDate, 'EEE d MMM')} - ${format(endDate, 'EEE d MMM')}`
    }
    if (startDate) {
      return `${format(startDate, 'MMM d')} - Add checkout`
    }
    return 'Add dates'
  }

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
    
    // Auto-open date picker after destination selection
    setTimeout(() => {
      if (!startDate || !endDate) {
        const today = startOfDay(new Date())
        const tomorrow = addDays(today, 1)
        setStartDate(today)
        setEndDate(tomorrow)
      }
      setIsDatePickerOpen(true)
    }, 300)
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

    // Track search submission (consent-gated)
    track('search_submit', {
      city: (searchCity || 'Lagos'),
      hotelQuery: hotelQuery || '',
      adults,
      children,
      rooms,
      budget: budgetKey,
      stayType,
      hasDates: Boolean(startDate && endDate),
      device: 'mobile'
    })

    const url = `/search?${q.toString()}`
    // Close any open pickers before navigating
    setIsDatePickerOpen(false)
    setShowGuestPicker(false)
    if (typeof window !== 'undefined') {
      window.location.href = url
    } else {
      router.push(url)
    }
  }

  return (
    <div className="w-full">
      {/* Mobile Search Form */}
      <div className="bg-gradient-to-b from-orange-400 to-yellow-500 rounded-xl shadow-lg p-3">
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative" ref={searchInputRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true)
                }
              }}
              placeholder="Where are you going?"
              className="w-full h-11 pl-3 pr-16 bg-white text-gray-900 text-lg font-bold placeholder:text-gray-500 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-0 rounded-lg transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCity('')
                  setSearchResults([])
                  setShowSearchResults(false)
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 text-gray-400">
                        {result.type === 'city' ? '📍' : '🏨'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">{result.value}</div>
                        <div className="text-xs text-gray-500">
                          {result.type === 'city' ? 'City' : `Hotel in ${result.city}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div ref={datePickerRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dates</label>
            <button
              type="button"
              onClick={() => {
                if (!startDate || !endDate) {
                  const today = startOfDay(new Date())
                  const tomorrow = addDays(today, 1)
                  setStartDate(today)
                  setEndDate(tomorrow)
                }
                setIsDatePickerOpen(!isDatePickerOpen)
                setShowGuestPicker(false)
              }}
              className="w-full h-12 px-3 bg-white rounded-lg text-gray-900 text-left hover:bg-gray-50 focus:bg-white focus:outline-none transition-all shadow-sm flex items-center justify-between"
            >
              <span className="font-bold text-sm">{formatRangeLabel()}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Date Picker Modal */}
            {isDatePickerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/20 z-[9997]" 
                  onClick={() => setIsDatePickerOpen(false)}
                />
                <div className="fixed inset-x-4 top-20 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9998] p-6 min-w-[320px] max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-gray-900 mb-2">Check In</div>
                        <input
                          type="date"
                          value={startDate ? startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null
                            setStartDate(date)
                            if (!endDate && date) {
                              setEndDate(addDays(date, 1))
                            }
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-2">Check Out</div>
                        <input
                          type="date"
                          value={endDate ? endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null
                            setEndDate(date)
                          }}
                          min={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Guests */}
          <div ref={guestPickerRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
            <button
              type="button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="w-full h-12 px-3 bg-white rounded-lg text-gray-900 text-left hover:bg-gray-50 focus:bg-white focus:outline-none transition-all shadow-sm flex items-center justify-between"
            >
              <span className="font-bold text-sm">{guestSummary}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Guest Picker Modal */}
            {showGuestPicker && (
              <>
                <div 
                  className="fixed inset-0 bg-black/20 z-[9997]" 
                  onClick={() => setShowGuestPicker(false)}
                />
                <div className="fixed inset-x-4 top-20 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9998] p-6 min-w-[320px] max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Adults</div>
                        <div className="text-sm text-gray-500">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={adults <= 1}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Children</div>
                        <div className="text-sm text-gray-500">Age 0-12</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={children <= 0}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(10, children + 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Rooms</div>
                        <div className="text-sm text-gray-500">How many rooms?</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          disabled={rooms <= 1}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(Math.min(10, rooms + 1))}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-semibold text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Type and Budget */}
          <div className="grid grid-cols-2 gap-2">
            {/* Type */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select 
                title="Property type"
                className="w-full h-10 px-3 pr-8 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all shadow-sm" 
                value={stayType} 
                onChange={e => setStayType(e.target.value as 'any' | 'hotel' | 'apartment' | 'high-security')}
              >
                <option value="any">Any Type</option>
                <option value="hotel">Hotels</option>
                <option value="apartment">Apartments</option>
                <option value="high-security">High Security</option>
              </select>
              <div className="absolute right-3 top-1/2 transform translate-y-1 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Budget */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
              <select 
                title="Budget range"
                className="w-full h-10 px-3 pr-8 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all shadow-sm" 
                value={budgetKey} 
                onChange={e => setBudgetKey(e.target.value)}
              >
                {budgets.map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform translate-y-1 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button 
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 active:from-green-800 active:to-emerald-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl active:shadow-md transition-all duration-150 flex items-center justify-center gap-2 transform active:scale-[0.98] touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}