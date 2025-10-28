'use client'

import ResponsiveSearchBar from './ResponsiveSearchBar'

export interface SearchBarProps {
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
  compact?: boolean
  showBrandSplashOnSubmit?: boolean
  mobileDatePicker?: string
}

export default function SearchBar(props: SearchBarProps) {
  return <ResponsiveSearchBar {...props} />
}