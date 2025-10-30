'use client'

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
  // Compact mode (used in sticky header on inner pages): always render mobile variant
  if (props.compact) {
    return <SearchBarMobile {...props} />
  }

  // Render both and control with responsive CSS to avoid hydration flicker on mobile
  return (
    <>
      <div className="md:hidden">
        <SearchBarMobile {...props} />
      </div>
      <div className="hidden md:block">
        <SearchBarDesktop {...props} />
      </div>
    </>
  )
}