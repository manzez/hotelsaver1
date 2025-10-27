'use client'

import { useState, useEffect, useRef } from 'react'

interface UseSearchUIProps {
  mobileDatePicker?: 'native' | 'custom'
}

/**
 * Custom hook for SearchBar UI state and behaviors
 * Handles mobile/desktop differences, animations, dropdowns
 * Completely separate from business logic
 */
export function useSearchUI(props: UseSearchUIProps = {}) {
  const { mobileDatePicker = 'native' } = props
  
  // UI state for dropdowns and modals
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Device and platform detection
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [useNativeDatePicker, setUseNativeDatePicker] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Date picker specific UI state
  const [datePrompted, setDatePrompted] = useState(false)
  const [datePickerFailCount, setDatePickerFailCount] = useState(0)
  
  // Refs for UI interactions
  const guestPickerRef = useRef<HTMLDivElement>(null)
  const datePickerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLDivElement>(null)
  const nativeStartRef = useRef<HTMLInputElement | null>(null)
  const nativeEndRef = useRef<HTMLInputElement | null>(null)

  // Device detection and initialization
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isAndroidDevice = /android/i.test(userAgent)
      
      setIsMobile(isMobileDevice)
      setIsAndroid(isAndroidDevice)
      setUseNativeDatePicker(isMobileDevice && mobileDatePicker !== 'custom')
      setIsInitialized(true)
    }

    detectDevice()
  }, [mobileDatePicker])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false)
      }
    }

    if (showGuestPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showGuestPicker])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchResults])

  // Toggle functions for UI elements
  const toggleGuestPicker = () => {
    setShowGuestPicker(!showGuestPicker)
    setIsDatePickerOpen(false) // Close other dropdowns
  }

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen)
    setShowGuestPicker(false) // Close other dropdowns
  }

  const toggleSearchResults = (show?: boolean) => {
    setShowSearchResults(show ?? !showSearchResults)
  }

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowGuestPicker(false)
    setIsDatePickerOpen(false)
    setShowSearchResults(false)
  }

  // Handle search input focus/blur
  const handleSearchFocus = () => {
    toggleSearchResults(true)
    closeOtherDropdowns('search')
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow for result selection
    setTimeout(() => setShowSearchResults(false), 150)
  }

  // Close other dropdowns helper
  const closeOtherDropdowns = (except?: 'guest' | 'date' | 'search') => {
    if (except !== 'guest') setShowGuestPicker(false)
    if (except !== 'date') setIsDatePickerOpen(false)
    if (except !== 'search') setShowSearchResults(false)
  }

  // Animation and transition helpers
  const getDropdownClasses = (isOpen: boolean) => {
    return `transition-all duration-200 ease-out ${
      isOpen 
        ? 'opacity-100 transform translate-y-0 scale-100' 
        : 'opacity-0 transform translate-y-2 scale-95 pointer-events-none'
    }`
  }

  const getBackdropClasses = (isOpen: boolean) => {
    return `fixed inset-0 bg-black transition-opacity duration-200 ${
      isOpen ? 'opacity-30 z-40' : 'opacity-0 pointer-events-none'
    }`
  }

  // Mobile-specific UI helpers
  const getMobileInputClasses = (isFocused?: boolean) => {
    const baseClasses = "w-full h-12 md:h-10 px-4 md:px-3 border border-gray-300 md:border-0 rounded-xl md:rounded-none bg-white md:bg-gray-50 text-gray-900 text-sm font-medium transition-all shadow-sm md:shadow-none"
    
    if (isFocused) {
      return `${baseClasses} focus:ring-2 focus:ring-brand-green/20 md:focus:ring-0 focus:border-brand-green md:focus:border-0 focus:bg-white`
    }
    
    return `${baseClasses} hover:bg-gray-50 md:hover:bg-gray-100`
  }

  const getMobileButtonClasses = (variant: 'primary' | 'secondary' = 'secondary') => {
    if (variant === 'primary') {
      return "w-full md:w-auto h-14 md:h-10 px-6 md:px-4 bg-brand-green hover:bg-brand-dark text-white rounded-xl font-semibold md:font-medium text-base md:text-sm shadow-lg md:shadow-md hover:shadow-xl md:hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-1"
    }
    
    return "w-full h-12 md:h-10 px-4 md:px-2 bg-white md:bg-gray-50 border border-gray-300 md:border-0 rounded-xl md:rounded-none text-gray-900 text-sm font-medium hover:bg-gray-50 md:hover:bg-gray-100 focus:bg-white focus:outline-none transition-all"
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (datePickerTimeoutRef.current) {
        clearTimeout(datePickerTimeoutRef.current)
      }
    }
  }, [])

  return {
    // UI state
    showGuestPicker,
    isDatePickerOpen,
    showSearchResults,
    
    // Device detection
    isAndroid,
    isMobile,
    useNativeDatePicker,
    isInitialized,
    
    // Date picker state
    datePrompted,
    datePickerFailCount,
    setDatePickerFailCount,
    
    // Refs
    guestPickerRef,
    datePickerTimeoutRef,
    searchInputRef,
    nativeStartRef,
    nativeEndRef,
    
    // UI controls
    toggleGuestPicker,
    toggleDatePicker,
    toggleSearchResults,
    closeAllDropdowns,
    handleSearchFocus,
    handleSearchBlur,
    
    // Style helpers
    getDropdownClasses,
    getBackdropClasses,
    getMobileInputClasses,
    getMobileButtonClasses,
    
    // Setters for external control
    setShowGuestPicker,
    setIsDatePickerOpen,
    setShowSearchResults,
    setDatePrompted
  }
}