'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function NegotiateBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('neg_banner_dismissed')
      setVisible(!dismissed)
    } catch {}
  }, [])

  if (!visible) return null

  return (
    <div className="w-full bg-emerald-600 text-white">
      <div className="container mx-auto px-4 py-2 text-xs md:text-sm flex items-center justify-between gap-3">
        <p className="font-medium">
          You control the price: negotiate hotel rates in minutes and save up to 50%+
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="#destinations" className="hidden md:inline-flex bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded-md font-semibold">
            See negotiable hotels
          </Link>
          <button
            onClick={() => {
              try { localStorage.setItem('neg_banner_dismissed', '1') } catch {}
              setVisible(false)
            }}
            aria-label="Dismiss"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/15 hover:bg-white/25"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
