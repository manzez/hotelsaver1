"use client";

import SearchBar from '@/components/SearchBar'

export default function MobileHero() {
  return (
  <section className="md:hidden bg-gradient-to-b from-emerald-50 to-white pt-6 pb-4">
      <div className="px-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Negotiate Your Price —
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Book hotels across Lagos, Abuja, Port Harcourt, and Owerri. Get instant discounts with a 5‑minute offer window.
        </p>
        <div className="mt-4">
          <SearchBar />
        </div>
        {/* Professional trust band below the form */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs font-medium text-gray-800">5‑min Offers</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs font-medium text-gray-800">Best Price Deals</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs font-medium text-gray-800">₦ Transparent</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs font-medium text-gray-800">WhatsApp Support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
