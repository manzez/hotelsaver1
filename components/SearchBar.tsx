'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
const budgets = [
  { key: 'u80', label: 'Under ₦80k' },
  { key: '80_130', label: '₦80k–₦130k' },
  { key: '130_200', label: '₦130k–₦200k' },
  { key: '200p', label: '₦200k+' }
]

export default function SearchBar() {
  const router = useRouter()
  
  // Form state
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [budgetKey, setBudgetKey] = useState('u80')
  const [stayType, setStayType] = useState<'any' | 'hotel' | 'apartment'>('any')

  // UI state
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Android date picker handling
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [useNativeDatePicker, setUseNativeDatePicker] = useState(false)
  const [datePickerFailCount, setDatePickerFailCount] = useState(0)
  
  // Refs
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      
      // Short delay to ensure proper rendering
      setTimeout(() => {
        setIsInitialized(true)
      }, 100)
    }

    detectDevice()
  }, [])

  // Click outside handler for guest picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!city) {
      alert('Please select a city')
      return
    }

    const q = new URLSearchParams({
      city,
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
        <div className="w-full h-12 pl-4 pr-10 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium flex items-center">
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
              className="flex-1 h-12 px-3 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none"
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
              className="flex-1 h-12 px-3 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none"
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
      <div className="relative w-full overflow-hidden">
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
          className="w-full h-12 pl-4 pr-10 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium cursor-pointer focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all touch-manipulation"
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
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002 2z" />
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
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Destination */}
          <div>
            <div className="relative">
              <select 
                className="w-full h-12 pl-4 pr-4 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all cursor-pointer" 
                value={city} 
                onChange={e => setCity(e.target.value)}
              >
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
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
              className="w-full h-12 pl-4 pr-10 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all"
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

          {/* Budget */}
          <div>
            <div className="relative">
              <select 
                className="w-full h-12 pl-4 pr-4 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm font-medium appearance-none focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:outline-none transition-all cursor-pointer" 
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
            Negotiate Hotels
          </button>
        </div>
      </form>
    </div>
  )
}