"use client";

import Link from 'next/link'

export default function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl leading-none">🏨</span>
          <span className="font-extrabold text-base tracking-tight">Hotelsaver</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/search" className="px-3 py-1.5 rounded-full border border-gray-200">Search</Link>
          <Link href="/services" className="px-3 py-1.5 rounded-full border border-gray-200">Services</Link>
        </nav>
      </div>
    </header>
  )
}
