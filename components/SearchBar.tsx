'use client'

import { useState, useEffect, useRef, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
// Lazy-load the DatePicker to avoid heavy JS on initial paint
const DatePicker = dynamic<any>(() => import('react-datepicker'), { ssr: false })
import "react-datepicker/dist/react-datepicker.css"
// Scoped custom styles for themed range link and mobile popover behavior
import "./datepicker.css"

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
  submitLabel?: string
  onBeforeSubmit?: () => void
  showBrandSplashOnSubmit?: boolean
  // Mobile-only date picker mode: 'native' uses <input type="date">, 'custom' uses our calendar UI
  mobileDatePicker?: 'native' | 'custom'
}

interface SearchResult {
  type: 'city' | 'hotel'
  value: string
  label: string
  hotelId?: string
  city?: string
}

// Minimal Hotel type for client-side search index
interface HotelIdx {
  id: string
  name: string
  city: string
}

// Date utilities for cross-browser compatibility
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toLocalInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalInput(input: string): Date | null {
  if (!input) return null
  const [year, month, day] = input.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
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
  defaultStayType = 'any',
  submitLabel = 'Search',
  onBeforeSubmit,
  showBrandSplashOnSubmit = false,
  mobileDatePicker = 'custom'
}: SearchBarProps) {
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
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>(defaultStayType)

  // UI state
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [datePrompted, setDatePrompted] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [destinationSelected, setDestinationSelected] = useState(false)
  const [hotelsIndex, setHotelsIndex] = useState<HotelIdx[] | null>(null)
  const [loadingHotels, setLoadingHotels] = useState(false)
  
  // Android date picker handling
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [useNativeDatePicker, setUseNativeDatePicker] = useState(false)
  const [datePickerFailCount, setDatePickerFailCount] = useState(0)
  
  // Refs
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const nativeStartRef = useRef<HTMLInputElement | null>(null)
  const nativeEndRef = useRef<HTMLInputElement | null>(null)
  const hasPrefetchedHotelsRef = useRef(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Device detection and initialization
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isAndroidDevice = /android/i.test(userAgent)
      
      setIsMobile(isMobileDevice)
      setIsAndroid(isAndroidDevice)
      
      setUseNativeDatePicker(isMobileDevice && mobileDatePicker !== 'custom')
      
      if (isAndroidDevice && isMobileDevice) {
        document.body.classList.add('is-android-mobile')
      }
      
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
      
      if (!defaultCheckIn && !defaultCheckOut) {
        if (!startDate || !endDate) {
          const today = startOfDay(new Date())
          const tomorrow = addDays(today, 1)
          setStartDate(today)
          setEndDate(tomorrow)
        }
      }

      setIsInitialized(true)
    }

    detectDevice()
  }, [mobileDatePicker])

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

  // Close date picker when clicking outside
  useEffect(() => {
    function handleDatePickerOutside(event: MouseEvent) {
      const target = event.target as Element
      if (isDatePickerOpen && !target.closest('.react-datepicker') && !target.closest('[data-date-picker-trigger]')) {
        setIsDatePickerOpen(false)
      }
    }

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleDatePickerOutside)
      return () => document.removeEventListener('mousedown', handleDatePickerOutside)
    }
  }, [isDatePickerOpen])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (datePickerTimeoutRef.current) {
        clearTimeout(datePickerTimeoutRef.current)
        datePickerTimeoutRef.current = null
      }
    }
  }, [])

  // Lazy-load hotels data
  const loadHotels = async () => {
    if (hasPrefetchedHotelsRef.current || hotelsIndex || loadingHotels) return
    try {
      setLoadingHotels(true)
      const mod: any = await import('../lib.hotels.json')
      const list: any[] = (mod && mod.default) ? (mod.default as any[]) : Array.isArray(mod) ? (mod as any[]) : []
      const idx: HotelIdx[] = list.map((h: any) => ({ id: String(h.id), name: String(h.name), city: String(h.city) }))
      setHotelsIndex(idx)
      hasPrefetchedHotelsRef.current = true
    } catch (e) {
      console.warn('Could not prefetch hotels index:', e)
    } finally {
      setLoadingHotels(false)
    }
  }

  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  // Search functionality
  const handleSearchInput = (query: string) => {
    setSearchQuery(query)
    setDestinationSelected(false)
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      setDatePrompted(false)
      if (query.length === 1) {
        if (typeof (window as any).requestIdleCallback === 'function') {
          ;(window as any).requestIdleCallback(() => { loadHotels() })
        } else {
          setTimeout(() => { loadHotels() }, 0)
        }
      }
      return
    }

    searchDebounceRef.current = setTimeout(() => {
      const results: SearchResult[] = []
      const qLower = query.toLowerCase()
      for (const cityName of cities) {
        if (cityName.toLowerCase().includes(qLower)) {
          results.push({ type: 'city', value: cityName, label: `${cityName} (City)`, city: cityName })
        }
      }
      if (hotelsIndex && hotelsIndex.length) {
        let count = 0
        for (let i = 0; i < hotelsIndex.length && count < 5; i++) {
          const h = hotelsIndex[i]
          if (h.name.toLowerCase().includes(qLower)) {
            results.push({ type: 'hotel', value: h.name, label: `${h.name} - ${h.city}`, hotelId: h.id, city: h.city })
            count++
          }
        }
      }
      setSearchResults(results)
      setShowSearchResults(results.length > 0)
    }, 300)
  }

  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === 'city') {
      setCity(result.value)
      setSearchQuery(result.value)
      setDestinationSelected(true)
    } else if (result.type === 'hotel' && result.hotelId) {
      setSelectedHotelId(result.hotelId)
      setSearchQuery(result.value)
      setCity(result.city || '')
      setDestinationSelected(true)
    }
    setShowSearchResults(false)
  }

  const navigateToResults = () => {
    let searchCity = city
    let hotelQuery = ''

    if (searchQuery && !cities.some(c => c.toLowerCase() === searchQuery.toLowerCase())) {
      hotelQuery = searchQuery
      searchCity = ''
    } else if (searchQuery && cities.some(c => c.toLowerCase() === searchQuery.toLowerCase())) {
      searchCity = cities.find(c => c.toLowerCase() === searchQuery.toLowerCase()) || searchCity
    }

    if (!searchQuery && !city) {
      searchCity = 'Lagos'
      setSearchQuery('Lagos')
    }

    const searchData = {
      city: searchCity || 'Lagos',
      searchQuery: searchQuery || searchCity || 'Lagos',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try { onBeforeSubmit && onBeforeSubmit() } catch {}
    
    // Immediate navigation for best performance
    navigateToResults()
  }

  const formatRangeLabel = () => {
    if (startDate && endDate) {
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return `${startDate.toLocaleDateString('en-GB', opts)} - ${endDate.toLocaleDateString('en-GB', opts)}`
    }
    if (startDate) {
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return `${startDate.toLocaleDateString('en-GB', opts)} - Add checkout`
    }
    return 'Add dates'
  }

  return (
    <div className="w-full">
      {/* Mobile-First Modern Search Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-brand-green/10 p-4 md:p-3">
        {/* Mobile: Vertical Stack, Desktop: Horizontal Flex */}
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-0 md:rounded-lg md:border md:border-brand-green/30">
          {/* Destination Search */}
          <div className="relative md:flex-1" ref={searchInputRef}>
            <div className="mb-2 md:mb-0">
              <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">Where to?</label>
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
                className="w-full h-12 md:h-10 pl-4 md:pl-3 pr-2 bg-gray-50 md:bg-gray-50 text-gray-900 text-base md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 rounded-xl md:rounded-none md:border-r md:border-gray-200 transition-all"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[60] max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
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
                        <div className="text-xs font-medium text-gray-900">
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
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
              Check-in & Check-out
            </label>
            <button
              type="button"
              data-date-picker-trigger
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                if (!startDate || !endDate) {
                  const today = startOfDay(new Date())
                  const tomorrow = addDays(today, 1)
                  setStartDate(today)
                  setEndDate(tomorrow)
                }
                setIsDatePickerOpen(!isDatePickerOpen)
                setShowGuestPicker(false)
              }}
              className="w-full h-12 md:h-10 px-4 md:px-2 pr-10 md:pr-6 bg-white md:bg-gray-50 border border-gray-300 md:border-0 rounded-xl md:rounded-none text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-50 md:hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 md:focus:ring-0 focus:border-brand-green md:focus:border-0 transition-all shadow-sm md:shadow-none"
            >
              <span>{formatRangeLabel()}</span>
              <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Date Picker Portal */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[70] p-4">
                <DatePicker
                  selected={startDate}
                  onChange={(dates: [Date | null, Date | null] | null) => {
                    const [start, end] = (dates || [null, null]) as [Date | null, Date | null]
                    setStartDate(start)
                    setEndDate(end)
                  }}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  monthsShown={1}
                  minDate={startOfDay(new Date())}
                />
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="w-full mt-3 bg-brand-green hover:bg-brand-dark text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Guests */}
          <div className="w-full" ref={guestPickerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
              Guests
            </label>
            <button
              type="button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="w-full h-12 md:h-10 px-4 md:px-2 pr-10 md:pr-2 bg-white md:bg-gray-50 border border-gray-300 md:border-0 rounded-xl md:rounded-none text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-50 md:hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 md:focus:ring-0 focus:border-brand-green md:focus:border-0 transition-all shadow-sm md:shadow-none"
            >
              <span>{guestSummary}</span>
              <svg className={`w-4 h-4 md:w-2 md:h-2 text-gray-400 transition-transform flex-shrink-0 ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showGuestPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] p-6 min-w-[320px]">
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
                      <div className="text-sm text-gray-500">Age 2-12</div>
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

          {/* Property Type & Budget - Mobile First */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-1 w-full">
            {/* Property Type */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
                Property Type
              </label>
              <div className="relative">
                <select 
                  className="w-full h-12 md:h-8 px-4 md:px-2 pr-10 md:pr-6 bg-white md:bg-gray-50 border border-gray-300 md:border-0 rounded-xl md:rounded-none text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 md:focus:ring-0 focus:border-brand-green md:focus:border-0 cursor-pointer transition-all shadow-sm md:shadow-none" 
                  value={stayType} 
                  onChange={e => setStayType(e.target.value as 'any' | 'hotel' | 'apartment')}
                  aria-label="Property type"
                >
                <option value="any">Any Type</option>
                <option value="hotel">Hotels</option>
                <option value="apartment">Apartments</option>
              </select>
                <div className="absolute right-3 md:right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">
                Budget Range
              </label>
              <div className="relative">
                <select 
                  className="w-full h-12 md:h-6 px-4 md:px-2 pr-10 md:pr-6 bg-white md:bg-gray-50 border border-gray-300 md:border-0 rounded-xl md:rounded-none text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/20 md:focus:ring-0 focus:border-brand-green md:focus:border-0 cursor-pointer transition-all shadow-sm md:shadow-none" 
                  value={budgetKey} 
                  onChange={e => setBudgetKey(e.target.value)}
                  aria-label="Budget"
                >
                  {budgets.map(b => (
                    <option key={b.key} value={b.key}>{b.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 md:right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 md:w-2 md:h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Button - Full width on mobile, compact on desktop */}
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit(e)
        }}
        className="w-full md:w-auto h-14 md:h-10 px-6 md:px-4 bg-brand-green hover:bg-brand-dark text-white rounded-xl font-semibold md:font-medium text-base md:text-sm shadow-lg md:shadow-md hover:shadow-xl md:hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-1 flex-shrink-0"
      >
        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {submitLabel}
      </button>
    </div>
  )
}