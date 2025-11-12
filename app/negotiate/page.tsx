'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function NegotiatePageContent() {
  const sp = useSearchParams()
  const propertyId = sp.get('propertyId') || ''

  return (
    <div className="min-h-screen">
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Hotel Negotiation</h1>
          <p className="text-gray-600 mb-8">Property: {propertyId}</p>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Negotiating...</h2>
            <p>Please wait while we get the best price for you.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
      <NegotiatePageContent />
    </Suspense>
  )
}