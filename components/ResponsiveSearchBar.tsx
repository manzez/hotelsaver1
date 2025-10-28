'use client'

import { useState, useEffect } from 'react'
import SearchBarMobile from './SearchBarMobile'
import SearchBarDesktop from './SearchBarDesktop'

interface ResponsiveSearchBarProps {
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
  compact?: boolean // For header usage
}

export default function ResponsiveSearchBar(props: ResponsiveSearchBarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // For compact mode (header), always show mobile version
  if (props.compact) {
    return <SearchBarMobile {...props} />
  }

  // Show mobile/desktop based on screen size
  return isMobile ? (
    <SearchBarMobile {...props} />
  ) : (
    <SearchBarDesktop {...props} />
  )
}