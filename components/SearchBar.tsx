'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { HOTELS } from '@/lib/data'

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
const budgets = [
  { key: 'u80', label: 'Under ₦80k' },
  { key: '80_130', label: '₦80k–₦130k' },
  { key: '130_200', label: '₦130k–₦200k' },
  { key: '200p', label: '₦200k+' }
]

interface SearchBarProps {
  defaultCity?: string
  defaultHotelQuery?: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultAdults?: number
  defaultChildren?: number
  defaultRooms?: number
  defaultBudget?: string
  defaultStayType?: 'any' | 'hotel' | 'apartment'
}

interface SearchResult {
  type: 'city' | 'hotel'
  value: string
  label: string
  hotelId?: string
  city?: string
}

export default function SearchBar({
  defaultCity = '',
  defaultHotelQuery = '',
  defaultCheckIn = '',
  defaultCheckOut = '',
  defaultAdults = 2,
  defaultChildren = 0,
  defaultRooms = 1,
  defaultBudget = 'u80',
  defaultStayType = 'any'
}: SearchBarProps = {}) {
  const router = useRouter()
  
  // Form state - initialize with props or defaults
  const [city, setCity] = useState(defaultCity)
  const [searchQuery, setSearchQuery] = useState(defaultHotelQuery || defaultCity)
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
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>(defaultStayType)

  // UI state
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  
  // Android date picker handling
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [useNativeDatePicker, setUseNativeDatePicker] = useState(false)
  const [datePickerFailCount, setDatePickerFailCount] = useState(0)
  
  // Refs
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLDivElement>(null)

  // Device detection and initialization
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isAndroidDevice = /android/i.test(userAgent)
      
      setIsMobile(isMobileDevice)
      setIsAndroid(isAndroidDevice)
      
      // Default to native date picker for ALL mobile devices
      setUseNativeDatePicker(isMobileDevice)
      
      // Add device class to body for CSS targeting
      if (isAndroidDevice && isMobileDevice) {
        document.body.classList.add('is-android-mobile')
      }
      
      // Only restore from localStorage if no default props provided
      if (!defaultCity && !defaultCheckIn && !defaultCheckOut) {
        const savedSearch = localStorage.getItem('hotelSearch')
        if (savedSearch) {
          try {
            const data = JSON.parse(savedSearch)
            if (data.city) setCity(data.city)
            if (data.searchQuery) setSearchQuery(data.searchQuery)
            if (data.startDate) setStartDate(new Date(data.startDate))
            if (data.endDate) setEndDate(new Date(data.endDate))
            if (data.adults) setAdults(data.adults)
            if (data.children) setChildren(data.children)
            if (data.rooms) setRooms(data.rooms)
            if (data.budgetKey) setBudgetKey(data.budgetKey)
            if (data.stayType) setStayType(data.stayType)
          } catch (error) {
            console.log('Could not restore search data:', error)
          }
        }
      }
      
      // Short delay to ensure proper rendering
      setTimeout(() => {
        setIsInitialized(true)
      }, 100)
    }

    detectDevice()
  }, [])

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (datePickerTimeoutRef.current) {
        clearTimeout(datePickerTimeoutRef.current)
        datePickerTimeoutRef.current = null
      }
    }
  }, [])

  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  // Search functionality
  const handleSearchInput = (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 1) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const results: SearchResult[] = []
    
    // Add matching cities
    cities.forEach(cityName => {
      if (cityName.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'city',
          value: cityName,
          label: `${cityName} (City)`,
          city: cityName
        })
      }
    })

    // Add matching hotels (limit to 8 for performance)
    const hotelMatches = HOTELS.filter(hotel => 
      hotel.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
    
    hotelMatches.forEach(hotel => {
      results.push({
        type: 'hotel',
        value: hotel.name,
        label: `${hotel.name} - ${hotel.city}`,
        hotelId: hotel.id,
        city: hotel.city
      })
    })

    setSearchResults(results)
    setShowSearchResults(results.length > 0)
  }

  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === 'city') {
      setCity(result.value)
      setSearchQuery(result.value)
    } else if (result.type === 'hotel' && result.hotelId) {
      // For hotel selection, navigate directly to the hotel
      router.push(`/hotel/${result.hotelId}`)
      return
    }
    setShowSearchResults(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Determine search type and value
    let searchCity = city
    let hotelQuery = ''
    
    // If search query doesn't match any city, treat it as hotel search
    if (searchQuery && !cities.some(c => c.toLowerCase() === searchQuery.toLowerCase())) {
      hotelQuery = searchQuery
      searchCity = '' // Allow searching across all cities for hotel names
    } else if (searchQuery && cities.some(c => c.toLowerCase() === searchQuery.toLowerCase())) {
      searchCity = cities.find(c => c.toLowerCase() === searchQuery.toLowerCase()) || searchCity
    }

    if (!searchQuery && !city) {
      alert('Please enter a destination or hotel name')
      return
    }

    // Save search data to localStorage
    const searchData = {
      city: searchCity,
      searchQuery,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      adults,
      children,
      rooms,
      budgetKey,
      stayType
    }
    localStorage.setItem('hotelSearch', JSON.stringify(searchData))

    const q = new URLSearchParams({
      city: searchCity,
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

  const renderDatePicker = () => {
    if (!isInitialized) {
      return (
        <div className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium flex items-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      )
    }

    if (useNativeDatePicker && isMobile) {
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null
                setStartDate(date)
                if (!endDate && date) {
                  const nextDay = new Date(date)
                  nextDay.setDate(nextDay.getDate() + 1)
                  setEndDate(nextDay)
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 h-12 px-3 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none"
              placeholder="Check-in"
            />
            <input
              type="date"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null
                setEndDate(date)
              }}
              min={startDate ? new Date(startDate.getTime() + 24*60*60*1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              className="flex-1 h-12 px-3 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none"
              placeholder="Check-out"
            />
          </div>
          <button
            type="button"
            onClick={() => setUseNativeDatePicker(false)}
            className="text-xs text-brand-green hover:text-brand-dark transition-colors"
          >
            Switch to calendar picker
          </button>
        </div>
      )
    }

    // Custom DatePicker with mobile overlay
    return (
      <div className="relative w-full overflow-hidden rounded-xl">
        {/* Mobile touch overlay - only when not using native */}
        {isMobile && !useNativeDatePicker && (
          <div
            className="absolute inset-0 z-10 bg-transparent cursor-pointer"
            onTouchStart={(e) => {
              e.preventDefault()
              setIsDatePickerOpen(true)
              setShowGuestPicker(false)
              
              if (isAndroid) {
                datePickerTimeoutRef.current = setTimeout(() => {
                  if (!document.querySelector('.react-datepicker')) {
                    setDatePickerFailCount(prev => prev + 1)
                    if (datePickerFailCount >= 1) {
                      setUseNativeDatePicker(true)
                    }
                  }
                }, 1000)
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              setIsDatePickerOpen(true)
              setShowGuestPicker(false)
            }}
          />
        )}

        <DatePicker
          selected={startDate}
          onChange={(dates) => {
            const [start, end] = dates as [Date | null, Date | null]
            setStartDate(start)
            setEndDate(end)
            
            if (start && end) {
              setTimeout(() => {
                setIsDatePickerOpen(false)
              }, 300)
            }
          }}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline={false}
          open={isDatePickerOpen}
          onClickOutside={() => {
            if (isDatePickerOpen) {
              setIsDatePickerOpen(false)
              if (datePickerTimeoutRef.current) {
                clearTimeout(datePickerTimeoutRef.current)
                datePickerTimeoutRef.current = null
              }
            }
          }}
          onFocus={() => {
            if (!isMobile) {
              setIsDatePickerOpen(true)
              setShowGuestPicker(false)
            }
          }}
          placeholderText="Add dates"
          className="w-full h-12 pl-4 pr-12 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium cursor-pointer focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all touch-manipulation overflow-hidden"
          autoComplete="off"
          dateFormat="MMM dd"
          monthsShown={isMobile ? 1 : 2}
          showPopperArrow={false}
          popperClassName="date-picker-popper android-date-picker"
          calendarClassName="range-calendar"
          minDate={new Date()}
          filterDate={(date) => date >= new Date()}
          portalId="date-picker-portal"
          withPortal={isMobile}
          popperPlacement="bottom"
          preventOpenOnFocus={isMobile}
          readOnly={isMobile}
          disabledKeyboardNavigation={isMobile}
        />

        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Switch to native option for mobile devices */}
        {isMobile && !useNativeDatePicker && (
          <button
            type="button"
            onClick={() => setUseNativeDatePicker(true)}
            className="absolute -bottom-6 left-0 text-xs text-brand-green hover:text-brand-dark transition-colors"
          >
            Having issues? Try simple date picker
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-brand-green/20 p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Destination Search */}
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
              placeholder="City or hotel name..."
              className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {result.type === 'city' ? (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-900">
                          {result.type === 'city' ? result.value : result.value}
                        </div>
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

          {/* Check-in & Check-out */}
          <div className="relative z-10">
            <div className="relative z-10">
              {renderDatePicker()}
            </div>
          </div>

          {/* Guests */}
          <div className="relative" ref={guestPickerRef}>
            <button
              type="button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all"
            >
              <span>{guestSummary}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showGuestPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 p-6 min-w-[320px]">
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
                      <span className="w-8 text-center font-bold text-lg text-gray-900">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Children</div>
                      <div className="text-sm text-gray-500">Ages 0-12</div>
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
                      <span className="w-8 text-center font-bold text-lg text-gray-900">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Rooms</div>
                      <div className="text-sm text-gray-500">Separate rooms</div>
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
                      <span className="w-8 text-center font-bold text-lg text-gray-900">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-10 h-10 rounded-full bg-brand-green hover:bg-brand-dark text-white flex items-center justify-center font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Property Type */}
          <div>
            <div className="relative">
              <select 
                className="w-full h-12 pl-4 pr-4 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all cursor-pointer" 
                value={stayType} 
                onChange={e => setStayType(e.target.value as 'any' | 'hotel' | 'apartment')}
              >
                <option value="any">Any Type</option>
                <option value="hotel">Hotels</option>
                <option value="apartment">Apartments</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="relative">
              <select 
                className="w-full h-12 pl-4 pr-4 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all cursor-pointer" 
                value={budgetKey} 
                onChange={e => setBudgetKey(e.target.value)}
              >
                {budgets.map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            type="submit" 
            className="w-full sm:flex-1 bg-gradient-to-r from-brand-green to-emerald-600 hover:from-brand-dark hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            {defaultCity ? 'Update Search' : 'Negotiate Hotels'}
          </button>
        </div>
      </form>
    </div>
  )
}