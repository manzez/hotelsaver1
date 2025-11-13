'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const NEG_STATUS = {
  PENDING: 'pending',
  OFFER: 'offer',
  NO_OFFER: 'no-offer',
  EXPIRED: 'expired'
}

function NegotiatePageContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const propertyId = sp.get('propertyId') || ''
  const checkIn = sp.get('checkIn') || ''
  const checkOut = sp.get('checkOut') || ''
  const adults = sp.get('adults') || '2'
  const children = sp.get('children') || '0'
  const rooms = sp.get('rooms') || '1'
  const roomId = sp.get('roomId') || ''

  const [negStatus, setNegStatus] = useState(NEG_STATUS.PENDING)
  const [baseTotal, setBaseTotal] = useState(0)
  const [discountedTotal, setDiscountedTotal] = useState(0)
  const [savings, setSavings] = useState(0)
  const [expiresAt, setExpiresAt] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [propertyName, setPropertyName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!propertyId) {
      setError('Property ID is required')
      setNegStatus(NEG_STATUS.NO_OFFER)
      return
    }

    async function negotiate() {
      try {
        const payload: any = { propertyId }
        if (roomId) payload.roomId = roomId

        const res = await fetch('/api/negotiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await res.json()
        
        // Debug logging
        console.log('=== NEGOTIATE API DEBUG ===');
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        console.log('Data Status:', data.status);
        console.log('Data Reason:', data.reason);
        console.log('=========================');

        if (data.status === 'discount') {
          setNegStatus(NEG_STATUS.OFFER)
          setBaseTotal(data.baseTotal || 0)
          setDiscountedTotal(data.discountedTotal || 0)
          setSavings(data.savings || 0)
          setExpiresAt(new Date(data.expiresAt).getTime())
          setPropertyName(data.property?.name || propertyId)
          setMessage(data.message || '')
        } else {
          setNegStatus(NEG_STATUS.NO_OFFER)
          setError(data.message || data.reason || 'No discount available at this time')
          console.log('No discount reason:', data.reason)
        }
      } catch (err) {
        console.error('Negotiate error:', err)
        setError('Failed to negotiate. Please try again.')
        setNegStatus(NEG_STATUS.NO_OFFER)
      }
    }

    negotiate()
  }, [propertyId, roomId])

  // Timer countdown
  useEffect(() => {
    if (negStatus !== NEG_STATUS.OFFER || expiresAt <= 0) return

    const tick = () => {
      const left = expiresAt - Date.now()
      setRemaining(Math.max(0, left))
      if (left <= 0) {
        setNegStatus(NEG_STATUS.EXPIRED)
      }
    }

    tick()
    timerRef.current = setInterval(tick, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [expiresAt, negStatus])

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = () => {
    const params = new URLSearchParams({
      propertyId,
      price: String(discountedTotal),
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    })
    if (roomId) params.set('roomId', roomId)
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Hotel Negotiation
          </h1>

          {negStatus === NEG_STATUS.PENDING && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
              <p className="text-gray-600">Negotiating the best price for you...</p>
              <p className="text-sm text-gray-500 mt-2">{propertyName || propertyId}</p>
            </div>
          )}

          {negStatus === NEG_STATUS.OFFER && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-brand-green mb-2">
                  Great News! We Got You a Discount!
                </h2>
                <p className="text-gray-600">{propertyName}</p>
                {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="text-lg line-through text-gray-400">
                    ₦{baseTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">Discounted Price:</span>
                  <span className="text-2xl font-bold text-brand-green">
                    ₦{discountedTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">You Save:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ₦{savings.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 font-medium">Offer expires in:</span>
                  <span className="text-2xl font-bold text-amber-900">
                    {formatTime(remaining)}
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  Accept this offer before the timer runs out!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-brand-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                >
                  Accept & Book
                </button>
                <Link
                  href={`/hotel/${propertyId}`}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  Decline
                </Link>
              </div>
            </div>
          )}

          {negStatus === NEG_STATUS.NO_OFFER && (
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Discount Available
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'Unfortunately, we could not secure a discount for this property at this time.'}
              </p>
              <Link
                href={`/hotel/${propertyId}`}
                className="inline-block bg-brand-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
              >
                View Property Details
              </Link>
            </div>
          )}

          {negStatus === NEG_STATUS.EXPIRED && (
            <div className="text-center">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Offer Expired
              </h2>
              <p className="text-gray-600 mb-6">
                The negotiated price has expired. You can try negotiating again or book at the regular price.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-brand-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                >
                  Negotiate Again
                </button>
                <Link
                  href={`/hotel/${propertyId}`}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back to Property
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <NegotiatePageContent />
    </Suspense>
  )
}