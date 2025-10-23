"use client";

import { useEffect } from 'react'

export default function MobileAutoScrollToResults({ targetId = 'results-start' }: { targetId?: string }) {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 767px)').matches
      if (!isMobile) return
      // Defer a tick to ensure layout is ready
      const t = setTimeout(() => {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
      return () => clearTimeout(t)
    } catch {}
  }, [targetId])

  return null
}
