'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startOfDay, addDays, addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, isPast } from 'date-fns'

import ClientDatepicker from './ClientDatepicker'

// Simple Calendar Component
interface SimpleCalendarProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
}

function SimpleCalendar({ startDate, endDate, onStartDateChange, onEndDateChange }: SimpleCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today))
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handleDateClick = (date: Date) => {
    // Don't allow selection of past dates or dates from other months
    if (isPast(date) || !isSameMonth(date, currentMonth)) return
    
    if (selecting === 'start' || !startDate) {
      onStartDateChange(date)
      if (endDate && isAfter(date, endDate)) {
        onEndDateChange(null)
      }
      setSelecting('end')
      
      // Auto-advance calendar to show next 28 days after check-in selection
      const nextMonth = addDays(date, 28)
      setCurrentMonth(startOfMonth(nextMonth))
    } else {
      if (isBefore(date, startDate)) {
        onStartDateChange(date)
        onEndDateChange(startDate)
      } else {
        onEndDateChange(date)
        // Both dates selected - could auto-close here if needed
      }
      setSelecting('start')
    }
  }

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    return (isAfter(date, startDate) || isSameDay(date, startDate)) && 
           (isBefore(date, endDate) || isSameDay(date, endDate))
  }

  const isToday = (date: Date) => isSameDay(date, today)
  const isPast = (date: Date) => isBefore(date, startOfDay(today))
  
  // Check if we can navigate to previous month
  const canGoPrevious = () => {
    const prevMonth = subMonths(currentMonth, 1)
    return !isBefore(endOfMonth(prevMonth), startOfDay(today))
  }

  // Navigate to next/previous month
  const goToPreviousMonth = () => {
    if (canGoPrevious()) {
      setCurrentMonth(subMonths(currentMonth, 1))
    }
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious()}
          className={`p-2 rounded-lg ${
            canGoPrevious() 
              ? 'hover:bg-gray-100 cursor-pointer text-gray-700' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const isStart = startDate && isSameDay(date, startDate)
          const isEnd = endDate && isSameDay(date, endDate)
          const inRange = isInRange(date) && !isStart && !isEnd
          const isPastDate = isPast(date)
          const isTodayDate = isToday(date) && !isStart && !isEnd && !inRange
          const isCurrentMonth = isSameMonth(date, currentMonth)
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isPastDate}
              className={`
                relative h-10 text-sm rounded-lg transition-all duration-200 font-medium
                ${!isCurrentMonth 
                  ? 'text-gray-300 cursor-default' 
                  : isPastDate 
                  ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                  : 'hover:bg-emerald-50 cursor-pointer hover:scale-105 text-gray-900'
                }
                ${isStart || isEnd
                  ? 'bg-brand-green text-white hover:bg-brand-dark shadow-md'
                  : ''
                }
                ${inRange
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : ''
                }
                ${isTodayDate
                  ? 'bg-blue-50 font-semibold ring-2 ring-blue-200 text-blue-700'
                  : ''
                }
              `}
            >
              {format(date, 'd')}
              {/* Add connecting lines for range */}
              {inRange && (
                <div className="absolute inset-y-0 left-0 w-full bg-brand-green/10 -z-10 rounded-none" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
  const [searchQuery, setSearchQuery] = useState(defaultHotelQuery || defaultCity || '')
  const [city, setCity] = useState(defaultCity)
  const [startDate, setStartDate] = useState<Date | null>(
    defaultCheckIn ? new Date(defaultCheckIn) : null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    defaultCheckOut ? new Date(defaultCheckOut) : null
  )
  
  // Initialize search query on component mount but don't show dropdown
  useEffect(() => {
    const initialQuery = defaultHotelQuery || defaultCity
    if (initialQuery && initialQuery.trim()) {
      setSearchQuery(initialQuery)
      setCity(defaultCity || '')
      // Don't call handleSearchInput to avoid showing dropdown
    }
  }, []) // Run once on mount
  

  const [adults, setAdults] = useState(defaultAdults)
  const [children, setChildren] = useState(defaultChildren)
  const [rooms, setRooms] = useState(defaultRooms)
  const [budgetKey, setBudgetKey] = useState(defaultBudget)
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment' | 'high-security'>(defaultStayType as any || 'any')

  // UI state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Refs
  const searchInputRef = useRef<HTMLDivElement>(null)
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (searchInputRef.current && !searchInputRef.current.contains(target)) {
        setShowSearchResults(false)
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(target)) {
        setShowGuestPicker(false)
      }
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // Cleanup debounce timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
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

  // Search functionality - simplified for debugging
  const debounceRef = useRef<NodeJS.Timeout>()
  
  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    
    // Protect against empty values for search results
    if (!value || value.trim() === '') {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Only search if there's actual input
    if (value.length < 1) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    
    // Always show city results immediately
    const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
    const cityResults = cities
      .filter(city => city.toLowerCase().includes(value.toLowerCase()))
      .map(city => ({ type: 'city', value: city, city }))
    
    // Set results immediately
    setSearchResults(cityResults)
    setShowSearchResults(cityResults.length > 0)
    
    // Also fetch hotels from API (async)
    if (value.length >= 1) {
      fetch('/api/hotels-index')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          return response.json()
        })
        .then(data => {
          const hotelResults = (data.hotels || [])
            .filter((hotel: any) => 
              hotel.name.toLowerCase().includes(value.toLowerCase()) ||
              hotel.city.toLowerCase().includes(value.toLowerCase())
            )
            .slice(0, 5)
            .map((hotel: any) => ({ type: 'hotel', value: hotel.name, city: hotel.city }))
          
          const allResults = [...cityResults, ...hotelResults]
          setSearchResults(allResults)
          setShowSearchResults(allResults.length > 0)
        })
        .catch(error => {
          console.error('Search API error:', error)
        })
    }
  }

  const handleSearchSelect = (result: any) => {
    setSearchQuery(result.value)
    setCity(result.city || result.value)
    setShowSearchResults(false)
    
    // Auto-open date picker after destination selection
    setTimeout(() => {
      setShowDatePicker(true)
    }, 300)
  }

  // Submit handler - optimized for performance
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Clear any pending search debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    try { onBeforeSubmit && onBeforeSubmit() } catch {}
    
    // Determine search parameters efficiently
    const searchCity = city || (searchResults.length > 0 && searchResults[0].type === 'city' ? searchResults[0].city : searchQuery) || 'Lagos'
    const hotelQuery = searchResults.find(r => r.type === 'hotel') ? searchQuery : ''

    // Build search query
    const searchParams = new URLSearchParams()
    searchParams.set('city', searchCity)
    if (hotelQuery) searchParams.set('hotelQuery', hotelQuery)
    if (startDate) searchParams.set('checkIn', startDate.toISOString().split('T')[0])
    if (endDate) searchParams.set('checkOut', endDate.toISOString().split('T')[0])
    searchParams.set('adults', String(adults))
    searchParams.set('children', String(children))
    searchParams.set('rooms', String(rooms))
    searchParams.set('budget', budgetKey)
    searchParams.set('stayType', stayType)

    // Navigate immediately for better UX
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">


      {/* Desktop Search Form - Two Row Layout */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Top Row - Input Fields */}
          <div className="flex items-stretch h-16">
            
            {/* Location Input */}
            <div className="relative w-64" ref={searchInputRef}>
              <div className="h-16 flex items-center px-4 bg-white border-r border-gray-200 rounded-tl-lg">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder="Where are you going?"
                  className="flex-1 text-sm font-medium text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none focus:outline-none"
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
                    className="ml-2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1 -6 0 3 3 0 0 1 6 0z" />
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

            {/* Date Range Picker */}
            <div className="relative flex-1 min-w-72" ref={datePickerRef}>
              <div className="h-16 flex items-center px-4 bg-white border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowDatePicker(!showDatePicker);
                   }}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : "Check-in date — Check-out date"
                    }
                  </span>
                </div>
              </div>

              {/* Date Picker Modal */}
              {showDatePicker && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                    onClick={() => setShowDatePicker(false)}
                  />
                  
                  {/* Modal */}
                  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] p-6 w-[90vw] max-w-lg max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Select your dates</h3>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Date Selection Summary */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-base font-semibold text-gray-900">
                          {startDate ? format(startDate, 'MMM dd, yyyy') : '—'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-base font-semibold text-gray-900">
                          {endDate ? format(endDate, 'MMM dd, yyyy') : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Calendar Component */}
                    <div className="mb-6">
                      <SimpleCalendar
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate(null)
                          setEndDate(null)
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear dates
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="bg-brand-green hover:bg-brand-dark text-white py-2 px-6 rounded-lg font-medium transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Guests */}
            {/* Guest Picker */}
            <div className="relative w-48" ref={guestPickerRef}>
              <div className="h-16 flex items-center px-4 bg-white border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowGuestPicker(!showGuestPicker);
                   }}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0 -9-5.197m13.5-9a2.5 2.5 0 1 1 -5 0 2.5 2.5 0 0 1 5 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 truncate">{guestSummary}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

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

            {/* Budget Selector */}
            <div className="relative w-64">
              <div className="h-16 flex items-center px-3 bg-white border-r border-gray-200">
                <div className="flex items-center gap-2 w-full">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <select
                    value={budgetKey}
                    onChange={(e) => setBudgetKey(e.target.value)}
                    className="text-sm font-medium text-gray-900 bg-transparent border-0 focus:outline-none cursor-pointer flex-1 appearance-none min-w-0"
                  >
                    {budgets.map(budget => (
                      <option key={budget.key} value={budget.key}>
                        {budget.label}
                      </option>
                    ))}
                  </select>
                  <svg className="w-3 h-3 text-gray-400 pointer-events-none flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stay Type Selector */}
            <div className="relative w-64">
              <div className="h-16 flex items-center px-3 bg-white rounded-tr-lg">
                <div className="flex items-center gap-2 w-full">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <select
                    value={stayType}
                    onChange={(e) => setStayType(e.target.value as any)}
                    className="text-sm font-medium text-gray-900 bg-transparent border-0 focus:outline-none cursor-pointer flex-1 appearance-none min-w-0"
                  >
                    <option value="any">Any type</option>
                    <option value="hotel">Hotels</option>
                    <option value="apartment">Apartments</option>
                    <option value="high-security">High Security</option>
                  </select>
                  <svg className="w-3 h-3 text-gray-400 pointer-events-none flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
          
          {/* Search Button - Full Width Connected */}
          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold transition-colors flex items-center justify-center gap-2 rounded-b-lg text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}