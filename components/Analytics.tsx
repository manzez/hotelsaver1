'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function Analytics() {
  const [consent, setConsent] = useState<'granted' | 'denied' | 'unset'>('unset')
  const pathname = usePathname()

  useEffect(() => {
    try {
      const v = localStorage.getItem('hs_ga_consent') as 'granted' | 'denied' | null
      setConsent(v || 'unset')
    } catch {}
  }, [])

  if (!GA_ID) return null
  if (consent !== 'granted') return null

  // Track client-side navigations (App Router)
  useEffect(() => {
    if (!GA_ID) return
    if (typeof window === 'undefined') return
    // @ts-expect-error dataLayer present after GA script loads
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      // @ts-ignore
      window.dataLayer.push(args)
    }
    // Fire a pageview on route change
    gtag('config', GA_ID, { page_path: pathname })
  }, [pathname])

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  )
}
