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
  submitLabel = 'Update Results',
  onBeforeSubmit,
  showBrandSplashOnSubmit = false,
  mobileDatePicker = 'native'
}: SearchBarProps = {}) {
  const router = useRouter()
  
  // Date helpers (local timezone safe)
  const startOfDay = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }
  const addDays = (d: Date, days: number) => {
    const x = new Date(d)
    x.setDate(x.getDate() + days)
    return x
  }
  const toLocalInput = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const parseLocalInput = (val: string): Date | null => {
    if (!val) return null
    const [y, m, d] = val.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, (m - 1), d)
  }
  
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
  const [datePrompted, setDatePrompted] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [destinationSelected, setDestinationSelected] = useState(false)
  // Lazy client-side hotel index (loaded on first focus/type)
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
      
  // Choose mobile date picker mode based on prop
  // Desktop keeps the custom calendar by default
  setUseNativeDatePicker(isMobileDevice && mobileDatePicker !== 'custom')
      
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
      
      // Initialize default dates: today -> tomorrow if not provided
      if (!defaultCheckIn && !defaultCheckOut) {
        if (!startDate || !endDate) {
          const today = startOfDay(new Date())
          const tomorrow = addDays(today, 1)
          setStartDate(today)
          setEndDate(tomorrow)
        }
      }

      // Short delay to ensure proper rendering
      setTimeout(() => {
        setIsInitialized(true)
      }, 100)
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (datePickerTimeoutRef.current) {
        clearTimeout(datePickerTimeoutRef.current)
        datePickerTimeoutRef.current = null
      }
    }
  }, [])

  // Lazy-load hotels data on first need to reduce initial JS bundle
  const loadHotels = async () => {
    if (hasPrefetchedHotelsRef.current || hotelsIndex || loadingHotels) return
    try {
      setLoadingHotels(true)
      // Import only the hotels JSON to avoid pulling extra data/code
      const mod: any = await import('../lib.hotels.json')
      const list: any[] = (mod && mod.default) ? (mod.default as any[]) : Array.isArray(mod) ? (mod as any[]) : []
      const idx: HotelIdx[] = list.map((h: any) => ({ id: String(h.id), name: String(h.name), city: String(h.city) }))
      setHotelsIndex(idx)
      hasPrefetchedHotelsRef.current = true
    } catch (e) {
      // fail silently; city search will still work
      console.warn('Could not prefetch hotels index:', e)
    } finally {
      setLoadingHotels(false)
    }
  }

  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}, ${rooms} room${rooms !== 1 ? 's' : ''}`

  // Helper: ensure default dates and open date picker UI
  const ensureDefaultDatesAndOpen = () => {
    // Always make sure we have today -> tomorrow defaults
    if (!startDate || !endDate) {
      const today = startOfDay(new Date())
      const tomorrow = addDays(today, 1)
      setStartDate(today)
      setEndDate(tomorrow)
    }

    // Open appropriate date UI
    if (useNativeDatePicker && isMobile) {
      // Try to focus the native start input (may be ignored by some browsers)
      requestAnimationFrame(() => {
        nativeStartRef.current?.focus()
        nativeStartRef.current?.showPicker?.()
      })
    } else {
      setIsDatePickerOpen(true)
      setShowGuestPicker(false)
      // On some Android Chrome builds, opening the portal can silently fail.
      // After a short delay, detect failure and fall back to native.
      if (datePickerTimeoutRef.current) {
        clearTimeout(datePickerTimeoutRef.current)
      }
      datePickerTimeoutRef.current = setTimeout(() => {
        try {
          const portal = document.querySelector('#date-picker-portal')
          const calendar = document.querySelector('.react-datepicker, .react-datepicker-popper')
          const isOpen = !!calendar || !!(portal && portal.childNodes.length > 0)
          if (!isOpen && isAndroid && isMobile) {
            setUseNativeDatePicker(true)
            requestAnimationFrame(() => {
              nativeStartRef.current?.focus()
              nativeStartRef.current?.showPicker?.()
            })
          }
        } catch {}
      }, 250)
    }
  }

  // Search functionality
  const handleSearchInput = (query: string) => {
    setSearchQuery(query)
    setDestinationSelected(false)
    // Clear previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }
    // For very short queries, clear results and optionally prefetch
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

    // Debounce actual search work
    searchDebounceRef.current = setTimeout(() => {
      const results: SearchResult[] = []
      // Add matching cities
      const qLower = query.toLowerCase()
      for (const cityName of cities) {
        if (cityName.toLowerCase().includes(qLower)) {
          results.push({ type: 'city', value: cityName, label: `${cityName} (City)`, city: cityName })
        }
      }
      // Add matching hotels (limit 8) if index available
      if (hotelsIndex && hotelsIndex.length) {
        let count = 0
        for (let i = 0; i < hotelsIndex.length && count < 8; i++) {
          const h = hotelsIndex[i]
          if (h.name.toLowerCase().includes(qLower)) {
            results.push({ type: 'hotel', value: h.name, label: `${h.name} - ${h.city}`, hotelId: h.id, city: h.city })
            count++
          }
        }
      } else {
        // Trigger background load so next keystroke has data
        loadHotels()
      }
      setSearchResults(results)
      setShowSearchResults(results.length > 0)
    }, 150)
  }

  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === 'city') {
      setCity(result.value)
      setSearchQuery(result.value)
      setDestinationSelected(true)
      // Prompt dates upon selecting a city
      ensureDefaultDatesAndOpen()
    } else if (result.type === 'hotel' && result.hotelId) {
      // For hotel selection, open the date picker instead of navigating immediately
      setSelectedHotelId(result.hotelId)
      setSearchQuery(result.value)
      setCity(result.city || '')
      setDestinationSelected(true)
      ensureDefaultDatesAndOpen()
    }
    setShowSearchResults(false)
  }

  // Build URL and navigate with current form state
  const navigateToResults = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try { onBeforeSubmit && onBeforeSubmit() } catch {}
    try {
      if (showBrandSplashOnSubmit) {
      // Show big green H overlay with sweeping light for ~1 second
      const overlay = document.createElement('div')
      overlay.setAttribute('id', 'search-overlay-h')
      overlay.setAttribute('aria-hidden', 'true')
      overlay.style.position = 'fixed'
      overlay.style.inset = '0'
      overlay.style.background = 'rgba(255,255,255,0.9)'
      overlay.style.display = 'flex'
      overlay.style.alignItems = 'center'
      overlay.style.justifyContent = 'center'
      overlay.style.zIndex = '99999'
      overlay.style.backdropFilter = 'blur(1px)'

      const style = document.createElement('style')
      style.textContent = `
        @keyframes hSweep {
          0% { transform: translateX(-120%); opacity: 0.4; }
          10% { opacity: 0.8; }
          100% { transform: translateX(120%); opacity: 0.4; }
        }
      `

      const container = document.createElement('div')
      container.style.position = 'relative'
      container.style.display = 'inline-block'

  const letter = document.createElement('div')
      letter.textContent = 'H'
      letter.style.fontSize = '22rem'
      letter.style.fontWeight = '900'
      letter.style.lineHeight = '1'
  letter.style.color = '#009739' // brand green
      letter.style.textShadow = '0 8px 24px rgba(0,0,0,0.06)'

      const sweep = document.createElement('div')
      sweep.style.position = 'absolute'
      sweep.style.top = '0'
      sweep.style.left = '0'
      sweep.style.height = '100%'
      sweep.style.width = '45%'
      sweep.style.background = 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 100%)'
      sweep.style.filter = 'blur(1px)'
      sweep.style.mixBlendMode = 'screen'
      sweep.style.animation = 'hSweep 1s ease-out forwards'

      container.appendChild(letter)
      container.appendChild(sweep)
      overlay.appendChild(container)
      document.body.appendChild(style)
      document.body.appendChild(overlay)

      setTimeout(() => {
        overlay.remove()
        style.remove()
      }, 1000)
      }
    } catch {}
    navigateToResults()
  }

  const renderDatePicker = () => {
    if (!isInitialized) {
      // Render a clickable placeholder so users can still open the calendar immediately
      return (
        <button
          type="button"
          className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-100"
          onClick={() => {
            ensureDefaultDatesAndOpen()
          }}
        >
          <span className="text-gray-500">Select dates</span>
          <span className="sr-only">Open date picker</span>
        </button>
      )
    }

    if (useNativeDatePicker && isMobile) {
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-0 sm:gap-2 w-full items-stretch">
            <input
              type="date"
              ref={nativeStartRef}
              value={startDate ? toLocalInput(startDate) : ''}
              onChange={(e) => {
                const date = parseLocalInput(e.target.value)
                setStartDate(date)
                if (!endDate && date) {
                  const nextDay = addDays(startOfDay(date), 1)
                  setEndDate(nextDay)
                }
              }}
              min={toLocalInput(startOfDay(new Date()))}
              className="w-full min-w-0 box-border h-12 px-3 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none"
              placeholder="Check-in"
            />
            <input
              type="date"
              ref={nativeEndRef}
              value={endDate ? toLocalInput(endDate) : ''}
              onChange={(e) => {
                const date = parseLocalInput(e.target.value)
                setEndDate(date)
              }}
              min={startDate ? toLocalInput(addDays(startOfDay(startDate), 1)) : toLocalInput(startOfDay(new Date()))}
              className="w-full min-w-0 box-border h-12 px-3 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none"
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
    // Add a footer "Done" button via custom CalendarContainer
    const CalendarContainer = ({ className, children }: { className?: string, children: React.ReactNode }) => {
      return (
        <div className={className}>
          {children}
        </div>
      )
    }
    // Build a mobile-friendly custom input that always opens the calendar reliably
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

    const DateButtonInput = forwardRef<HTMLButtonElement, any>(({ onClick }: any, ref) => (
      <button
        type="button"
        ref={ref}
        onClick={(e) => {
          // Trigger react-datepicker internal handler if present
          onClick?.(e)
          // Force open under our control
          setIsDatePickerOpen(true)
          setShowGuestPicker(false)
          // Android fallback if portal fails to render
          if (datePickerTimeoutRef.current) {
            clearTimeout(datePickerTimeoutRef.current)
          }
          datePickerTimeoutRef.current = setTimeout(() => {
            try {
              const portal = document.querySelector('#date-picker-portal')
              const calendar = document.querySelector('.react-datepicker, .react-datepicker-popper')
              const isOpen = !!calendar || !!(portal && portal.childNodes.length > 0)
              if (!isOpen && isAndroid && isMobile) {
                setUseNativeDatePicker(true)
                requestAnimationFrame(() => {
                  nativeStartRef.current?.focus()
                  nativeStartRef.current?.showPicker?.()
                })
              }
            } catch {}
          }, 250)
        }}
        className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium flex items-center justify-between text-left hover:bg-gray-100"
      >
        <span>{formatRangeLabel()}</span>
      </button>
    ))

    return (
      <div className="relative w-full overflow-visible rounded-xl">
        {/* Mobile: open calendar on input click; no separate overlay to avoid dual behaviors */}

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
          shouldCloseOnSelect={true}
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
          className="w-full h-12 pl-4 pr-10 bg-gray-50 border-2 border-brand-green/30 rounded-xl text-gray-900 text-sm font-medium cursor-pointer focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-none transition-all touch-manipulation overflow-hidden"
          autoComplete="off"
          dateFormat="MMM dd"
          monthsShown={1}
          showPopperArrow={false}
          popperClassName="date-picker-popper android-date-picker"
          calendarClassName="range-calendar"
          minDate={startOfDay(new Date())}
          filterDate={(date: Date) => startOfDay(date) >= startOfDay(new Date())}
          portalId="date-picker-portal"
          withPortal={isMobile}
          popperPlacement={isMobile ? 'bottom' : 'bottom-start'}
          preventOpenOnFocus={true}
          readOnly={isMobile}
          disabledKeyboardNavigation={isMobile}
          calendarContainer={CalendarContainer as any}
          customInput={<DateButtonInput /> as any}
          onInputClick={() => {
            // Open for both desktop and mobile to unify behavior
            setIsDatePickerOpen(true)
            setShowGuestPicker(false)
          }}
          onCalendarOpen={() => {
            if (isMobile) {
              try { document.body.style.overflow = 'hidden' } catch {}
            }
          }}
          onCalendarClose={() => {
            if (isMobile) {
              try { document.body.style.overflow = '' } catch {}
            }
          }}
        />

        {/* Spacer to prevent overlapping content on desktop when calendar is open */}
        {!isMobile && isDatePickerOpen && (
          <div className="hidden md:block h-[340px]" aria-hidden="true"></div>
        )}

        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Note: we still auto-fallback to native on Android if the popup fails, but no visible toggle to avoid confusion */}
      </div>
    )
  }

  return (
    <>
    <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-brand-green/20 p-4 md:p-6 mb-2 md:mb-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 sm:gap-4">
          {/* Destination Search */}
          <div className="relative" ref={searchInputRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                // Prefetch hotels list on first focus to improve perceived speed
                if (!hasPrefetchedHotelsRef.current) {
                  if (typeof (window as any).requestIdleCallback === 'function') {
                    ;(window as any).requestIdleCallback(() => { loadHotels() })
                  } else {
                    setTimeout(() => { loadHotels() }, 0)
                  }
                }
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
                aria-label="Budget"
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
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
    </>
  )
}