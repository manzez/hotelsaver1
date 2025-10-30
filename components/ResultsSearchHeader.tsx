"use client";

import { useEffect, useMemo, useState } from 'react'
import SearchBar from '@/components/SearchBar'

export default function ResultsSearchHeader({
  city = '',
  checkIn = '',
  checkOut = '',
  adults = 2,
  children = 0,
  rooms = 1,
  budget = 'u80',
  stayType = 'any'
}: {
  city?: string
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  rooms?: number
  budget?: string
  stayType?: 'any' | 'hotel' | 'apartment' | 'high-security'
}) {
  const [showFull, setShowFull] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Collapse on mobile by default; expand on md+ screens
    try {
      if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(min-width: 768px)')
        setShowFull(mq.matches)
        const handler = (e: MediaQueryListEvent) => setShowFull(e.matches)
        mq.addEventListener?.('change', handler)
        return () => mq.removeEventListener?.('change', handler)
      }
    } catch {}
  }, [])

  // After a search update (params change), collapse on mobile automatically
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    // On mobile, ensure compact mode after updates
    if (!mq.matches) setShowFull(false)
  }, [city, checkIn, checkOut, adults, children, rooms, budget, stayType])

  const summary = useMemo(() => {
    const fmtDM = (d: string) => {
      if (!d) return ''
      const date = new Date(d + (d.includes('T') ? '' : 'T00:00:00'))
      if (isNaN(+date)) return ''
      // 1 Jan format
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }

    const nightsBetween = (ci?: string, co?: string) => {
      if (!ci || !co) return 0
      const a = new Date(ci + (ci.includes('T') ? '' : 'T00:00:00'))
      const b = new Date(co + (co.includes('T') ? '' : 'T00:00:00'))
      if (isNaN(+a) || isNaN(+b)) return 0
      const ms = b.getTime() - a.getTime()
      const days = Math.round(ms / (1000 * 60 * 60 * 24))
      return Math.max(0, days)
    }

    const ci = fmtDM(checkIn)
    const co = fmtDM(checkOut)
    const nights = nightsBetween(checkIn, checkOut)
    const dateBase = ci && co ? `${ci} - ${co}` : ci || co || 'Add dates'
    const datePart = nights > 0 ? `${dateBase} (${nights} night${nights !== 1 ? 's' : ''})` : dateBase

    const guestsPart = `${adults} adult${adults !== 1 ? 's' : ''}` +
      (children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : '') +
      `, ${rooms} room${rooms !== 1 ? 's' : ''}`
    const cityPart = city || 'All Nigeria'
    return `${cityPart} • ${datePart} • ${guestsPart}`
  }, [city, checkIn, checkOut, adults, children, rooms])

  if (!isClient) {
    // Server render a lightweight placeholder to avoid hydration mismatch
    return (
      <div className="md:hidden">
        <div className="h-12 rounded-xl border border-gray-200 bg-white" />
      </div>
    )
  }

  return (
    <div>
      {/* Compact summary box on mobile */}
      {!showFull && (
        <button
          type="button"
          onClick={() => setShowFull(true)}
          className="md:hidden w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 text-left shadow-sm flex items-center hover:bg-gray-50"
          aria-label="Edit search"
        >
          <span className="truncate">{summary}</span>
        </button>
      )}

      {/* Full search UI when expanded (always shown on md+) */}
      {showFull && (
        <div className="mt-3">
          <SearchBar
            defaultCity={city}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
            defaultAdults={adults}
            defaultChildren={children}
            defaultRooms={rooms}
            defaultBudget={budget}
            defaultStayType={stayType}
            onBeforeSubmit={() => setShowFull(false)}
            showBrandSplashOnSubmit={false}
          />
          {/* Collapse control for mobile */}
          <div className="md:hidden flex justify-center mt-2">
            <button
              type="button"
              onClick={() => setShowFull(false)}
              className="text-sm text-brand-green hover:text-brand-dark"
            >
              Collapse search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
