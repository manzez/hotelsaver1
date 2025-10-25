"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface InfoNoticeProps {
  variant?: 'mobile' | 'desktop'
  storageKey?: string
  className?: string
}

export default function InfoNotice({ variant = 'mobile', storageKey = 'hs_info_notice_dismissed', className = '' }: InfoNoticeProps) {
  const [dismissed, setDismissed] = useState<boolean>(true)

  // Initialize from sessionStorage on client only
  useEffect(() => {
    try {
      const v = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : '1'
      setDismissed(v === '1')
    } catch {
      // If sessionStorage is unavailable, default to not showing repeatedly
      setDismissed(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setDismissed(true)
    try { window.sessionStorage.setItem(storageKey, '1') } catch {}
  }

  if (dismissed) return null

  const visibility = variant === 'desktop' ? 'hidden md:block' : 'md:hidden'
  const spacing = variant === 'desktop' ? 'mb-4' : 'mt-3'

  return (
    <div className={`${visibility} ${spacing} text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 relative pr-8 ${className}`}>
      Commission paid and other benefits may affect an accommodation’s ranking.
      <Link href="#" className="text-brand-green hover:text-brand-dark ml-1 underline">Learn more</Link>.
      <button
        type="button"
        aria-label="Dismiss notice"
        onClick={handleClose}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded hover:bg-gray-100 text-gray-500"
      >
        ×
      </button>
    </div>
  )
}
