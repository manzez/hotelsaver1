'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Business Logic Types
interface SearchFormData {
  city: string
  hotelQuery: string
  startDate: Date | null
  endDate: Date | null
  adults: number
  children: number
  rooms: number
  budgetKey: string
  stayType: 'any' | 'hotel' | 'apartment'
}

interface SearchResult {
  type: 'city' | 'hotel'
  value: string
  label: string
  hotelId?: string
  city?: string
}

interface HotelIdx {
  id: string
  name: string
  city: string
}

interface UseSearchFormProps {
  defaultCity?: string
  defaultHotelQuery?: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultAdults?: number
  defaultChildren?: number
  defaultRooms?: number
  defaultBudget?: string
  defaultStayType?: 'any' | 'hotel' | 'apartment'
  onBeforeSubmit?: () => void
}

// Cities and budgets data
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']
const budgets = [
  { key: 'u80', label: 'Under ₦80k' },
  { key: '80_130', label: '₦80k–₦130k' },
  { key: '130_200', label: '₦130k–₦200k' },
  { key: '200p', label: '₦200k+' }
]

/**
 * Custom hook for search form business logic
 * Completely independent of UI implementation
 */
export function useSearchForm(props: UseSearchFormProps = {}) {
  const router = useRouter()
  
  // Default values
  const {
    defaultCity = '',
    defaultHotelQuery = '',
    defaultCheckIn,
    defaultCheckOut,
    defaultAdults = 2,
    defaultChildren = 0,
    defaultRooms = 1,
    defaultBudget = 'u80',
    defaultStayType = 'any' as const,
    onBeforeSubmit
  } = props

  // Core form state
  const [formData, setFormData] = useState<SearchFormData>({
    city: defaultCity,
    hotelQuery: defaultHotelQuery,
    startDate: defaultCheckIn ? new Date(defaultCheckIn) : null,
    endDate: defaultCheckOut ? new Date(defaultCheckOut) : null,
    adults: defaultAdults,
    children: defaultChildren,
    rooms: defaultRooms,
    budgetKey: defaultBudget,
    stayType: defaultStayType
  })

  // Search functionality state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [hotelsIndex, setHotelsIndex] = useState<HotelIdx[] | null>(null)
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [destinationSelected, setDestinationSelected] = useState(false)

  // Refs for cleanup and debouncing
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPrefetchedHotelsRef = useRef(false)

  // Load hotels index for search
  const loadHotelsIndex = async () => {
    if (hotelsIndex !== null || loadingHotels || hasPrefetchedHotelsRef.current) return
    
    setLoadingHotels(true)
    hasPrefetchedHotelsRef.current = true
    
    try {
      const response = await fetch('/api/hotels-index')
      if (response.ok) {
        const data = await response.json()
        setHotelsIndex(data.hotels || [])
      }
    } catch (error) {
      console.error('Failed to load hotels index:', error)
      setHotelsIndex([]) // Set empty array to prevent retry loops
    } finally {
      setLoadingHotels(false)
    }
  }

  // Search logic
  const performSearch = (query: string): SearchResult[] => {
    if (!query.trim()) return []
    
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase().trim()
    
    // Search cities
    cities.forEach(city => {
      if (city.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'city',
          value: city,
          label: city
        })
      }
    })
    
    // Search hotels (if index is loaded)
    if (hotelsIndex) {
      hotelsIndex.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'hotel',
            value: hotel.name,
            label: hotel.name,
            hotelId: hotel.id,
            city: hotel.city
          })
        }
      })
    }
    
    return results.slice(0, 8) // Limit results
  }

  // Handle search input with debouncing
  const handleSearchInput = (query: string) => {
    // Update form data immediately for UI responsiveness
    setFormData(prev => ({ ...prev, hotelQuery: query }))
    
    // Clear selected hotel if user is typing
    if (selectedHotelId) {
      setSelectedHotelId(null)
      setDestinationSelected(false)
    }
    
    // Debounce search
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
    
    searchDebounceRef.current = setTimeout(() => {
      const results = performSearch(query)
      setSearchResults(results)
    }, 150)
    
    // Load hotels index if needed
    if (!hotelsIndex && !loadingHotels) {
      loadHotelsIndex()
    }
  }

  // Handle search selection
  const handleSearchSelect = (result: SearchResult) => {
    setFormData(prev => ({
      ...prev,
      city: result.type === 'city' ? result.value : result.city || '',
      hotelQuery: result.value
    }))
    
    if (result.type === 'hotel' && result.hotelId) {
      setSelectedHotelId(result.hotelId)
      setDestinationSelected(true)
    }
    
    setSearchResults([])
  }

  // Form field updates
  const updateField = <K extends keyof SearchFormData>(
    field: K,
    value: SearchFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Guest summary for display
  const getGuestSummary = () => {
    if (formData.adults === 1 && formData.children === 0 && formData.rooms === 1) {
      return '1 adult'
    }
    if (formData.adults === 2 && formData.children === 0 && formData.rooms === 1) {
      return '2 adults'
    }
    
    const parts = []
    if (formData.adults > 0) parts.push(`${formData.adults} adult${formData.adults > 1 ? 's' : ''}`)
    if (formData.children > 0) parts.push(`${formData.children} child${formData.children > 1 ? 'ren' : ''}`)
    if (formData.rooms > 1) parts.push(`${formData.rooms} rooms`)
    
    return parts.join(', ') || '0 guests'
  }

  // Date range formatting
  const formatDateRange = () => {
    if (formData.startDate && formData.endDate) {
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return `${formData.startDate.toLocaleDateString('en-GB', opts)} - ${formData.endDate.toLocaleDateString('en-GB', opts)}`
    }
    if (formData.startDate) {
      const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
      return `${formData.startDate.toLocaleDateString('en-GB', opts)} - Add checkout`
    }
    return 'Select dates'
  }

  // Navigation to results
  const navigateToResults = () => {
    const q = new URLSearchParams({
      city: formData.city,
      hotelQuery: formData.hotelQuery,
      checkIn: formData.startDate ? formData.startDate.toISOString().split('T')[0] : '',
      checkOut: formData.endDate ? formData.endDate.toISOString().split('T')[0] : '',
      adults: String(formData.adults),
      children: String(formData.children),
      rooms: String(formData.rooms),
      budget: formData.budgetKey,
      stayType: formData.stayType
    })

    router.push(`/search?${q.toString()}`)
  }

  // Form submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    try {
      onBeforeSubmit?.()
    } catch (error) {
      console.error('onBeforeSubmit error:', error)
    }
    
    // Navigate to results
    navigateToResults()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  // Return all form logic and data
  return {
    // Form data
    formData,
    updateField,
    
    // Search functionality  
    searchResults,
    handleSearchInput,
    handleSearchSelect,
    loadingHotels,
    
    // Display helpers
    getGuestSummary,
    formatDateRange,
    
    // Form submission
    handleSubmit,
    navigateToResults,
    
    // Constants
    cities,
    budgets,
    
    // State flags
    selectedHotelId,
    destinationSelected
  }
}