'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

interface Props {
  resultCount: number
  params: Record<string, string | number | boolean | null | undefined>
}

export default function SearchResultsAnalytics({ resultCount, params }: Props) {
  useEffect(() => {
    track('search_results', {
      resultCount,
      city: params.city || '',
      hotelQuery: params.hotelQuery || '',
      budget: params.budget || '',
      stayType: params.stayType || 'any',
      adults: Number(params.adults || 0),
      children: Number(params.children || 0),
      rooms: Number(params.rooms || 0),
      hasDates: Boolean(params.checkIn && params.checkOut),
    })
    // fire once on mount/update when count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultCount])

  return null
}
