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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // For compact mode (header), always show mobile version
  if (props.compact) {
    return <SearchBarMobile {...props} />
  }

  if (!mounted) {
    // Server-side: show desktop version initially to prevent mobile flash
    return <SearchBarDesktop {...props} />
  }

  // Client-side: determine based on window width
  const isMobile = window.innerWidth < 768
  return <SearchBarDesktop {...props} />
}