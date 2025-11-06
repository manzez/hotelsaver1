'use client'

import { useEffect, useState } from 'react'

type ConsentState = 'granted' | 'denied' | 'unset'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>('unset')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const v = localStorage.getItem('hs_ga_consent') as ConsentState | null
      setConsent(v || 'unset')
    } catch {}
  }, [])

  const setAndStore = (v: ConsentState) => {
    try { localStorage.setItem('hs_ga_consent', v) } catch {}
    setConsent(v)
    // Notify interested components and update Consent Mode if GA is present
    try {
      window.dispatchEvent(new CustomEvent('hs_ga_consent_changed', { detail: v }))
      const gtag = (window as any).gtag
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          analytics_storage: v === 'granted' ? 'granted' : 'denied'
        })
      }
    } catch {}
  }

  // Only show when GA is configured and no choice recorded
  if (!mounted || !GA_ID || consent !== 'unset') return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[10000]">
      <div className="container">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-700">
              We use analytics cookies to understand usage and improve Hotelsaver.ng. Do you consent to anonymous usage tracking?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAndStore('denied')} className="btn-ghost h-10 px-4 text-sm">Decline</button>
              <button onClick={() => setAndStore('granted')} className="btn-primary h-10 px-4 text-sm">Allow analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
