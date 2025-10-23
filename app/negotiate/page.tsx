
'use client'

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const NEG_STATUS = {
  PENDING: 'pending',
  NEGOTIATING: 'negotiating', 
  SUCCESS: 'success',
  NO_DEALS: 'no-deals',
  NO_OFFER: 'no-offer',
  EXPIRED: 'expired',
} as const

type NegStatus = typeof NEG_STATUS[keyof typeof NEG_STATUS]

function NegotiatePageContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const propertyId = sp.get('propertyId') || ''

  const [negStatus, setNegStatus] = useState<NegStatus>(NEG_STATUS.PENDING)
  const [base, setBase] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [message, setMessage] = useState<string>('')
  const [property, setProperty] = useState<any>(null)
  const [negotiationToken, setNegotiationToken] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(0)
  const [negotiationProgress, setNegotiationProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startAtRef = useRef<number>(Date.now())
  const excellentNewsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const specialDealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusRef = useRef<NegStatus>(NEG_STATUS.PENDING)

  const isExpired = (status: NegStatus) => status === NEG_STATUS.EXPIRED

  // Keep a live ref of status for timeout guards
  useEffect(() => { statusRef.current = negStatus }, [negStatus])

  useEffect(() => {
    let cancelled = false
    
    // Mark start time and start negotiation process
    startAtRef.current = Date.now()
    setNegStatus(NEG_STATUS.NEGOTIATING)
    const phaseMessages = [
      '📞 Contacting hotel representative... We appreciate your patience!',
      '💬 Negotiating the best possible price for you... Almost there!',
      '🤝 Working hard to finalize your exclusive deal... Just a moment more!',
      '✨ Securing your special discount... Thank you for waiting!'
    ]
    let msgIdx = 0
    setMessage(phaseMessages[msgIdx])

    // Simulate negotiation progress/messages, advancing every 1 second
    progressRef.current = setInterval(() => {
      msgIdx = Math.min(phaseMessages.length - 1, msgIdx + 1)
      setMessage(phaseMessages[msgIdx])
      setNegotiationProgress(prev => Math.min(99, prev + Math.ceil(100 / phaseMessages.length)))
    }, 1000)

    // Schedule the early neutral success message at 4.5s and the "Excellent news" at 6s from start
    if (excellentNewsTimeoutRef.current) {
      clearTimeout(excellentNewsTimeoutRef.current)
      excellentNewsTimeoutRef.current = null
    }
    if (specialDealTimeoutRef.current) {
      clearTimeout(specialDealTimeoutRef.current)
      specialDealTimeoutRef.current = null
    }
    const fourHalfSecFromStart = startAtRef.current + 4.5 * 1000
    const sixSecFromStart = startAtRef.current + 6 * 1000
    const delayForSpecialDeal = Math.max(0, fourHalfSecFromStart - Date.now())
    const delayForExcellent = Math.max(0, sixSecFromStart - Date.now())

    // Show neutral "secured a special deal" at 4.5s (but never before)
    specialDealTimeoutRef.current = setTimeout(() => {
      // Only show during negotiation/success (avoid after expiry/no-offer)
      if (statusRef.current === NEG_STATUS.NEGOTIATING || statusRef.current === NEG_STATUS.SUCCESS) {
        setMessage('✅ We\'ve secured a special deal. Confirming your price...')
      }
    }, delayForSpecialDeal)

    // Do NOT say "Excellent news" before the 6th second
    excellentNewsTimeoutRef.current = setTimeout(() => {
      // Only show if still negotiating or already successful (avoid showing after expiry/no-offer)
      if (statusRef.current === NEG_STATUS.NEGOTIATING || statusRef.current === NEG_STATUS.SUCCESS) {
        setMessage('🎉 Excellent news! We\'ve secured an amazing deal for you! Confirming your price...')
      }
    }, delayForExcellent)

    ;(async () => {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (cancelled) return

      // Clear progress interval
      if (progressRef.current) {
        clearInterval(progressRef.current)
        progressRef.current = null
      }

  if (data.status === 'discount' || data.status === 'success') {
        // Respect the timing rules:
        // - Show neutral "secured a special deal" at 4.5s
        // - Show "Excellent news" at/after 6s
        const now = Date.now()
        const sixSecPassed = now - startAtRef.current >= 6000
        if (sixSecPassed) {
          // If we've already passed 6s, reflect "Excellent news" immediately
          setMessage('🎉 Excellent news! We\'ve secured an amazing deal for you! Confirming your price...')
        }
        setNegotiationProgress(100)
        setTimeout(() => {
          setBase(Number(data.baseTotal))
          setPrice(Number(data.discountedTotal))
          // If 6 seconds already passed, keep/display "Excellent news"; otherwise keep a neutral success message
          const passed = Date.now() - startAtRef.current >= 6000
          if (!passed) {
            setMessage('Your exclusive price is ready. Proceed to secure it now.')
          }
          setProperty(data.property)
          if (data.expiresAt) {
            const t = new Date(data.expiresAt).getTime()
            setExpiresAt(isNaN(t) ? Date.now() + 5 * 60 * 1000 : t)
          } else {
            setExpiresAt(Date.now() + 5 * 60 * 1000)
          }
          setNegotiationToken(String(data.negotiationToken || ''))
          setNegStatus(NEG_STATUS.SUCCESS)
        }, 7000)
      } else if (data.status === 'no-deals') {
        setMessage(data.message)
        setProperty(data.property)
        setNegStatus(NEG_STATUS.NO_DEALS)
      } else {
        setNegStatus(NEG_STATUS.NO_OFFER)
        setMessage('Sorry, no discount available for this hotel today. Please try again tomorrow or explore other properties.')
      }
    })()
    
    return () => { 
      cancelled = true
      if (progressRef.current) {
        clearInterval(progressRef.current)
        progressRef.current = null
      }
      if (excellentNewsTimeoutRef.current) {
        clearTimeout(excellentNewsTimeoutRef.current)
        excellentNewsTimeoutRef.current = null
      }
      if (specialDealTimeoutRef.current) {
        clearTimeout(specialDealTimeoutRef.current)
        specialDealTimeoutRef.current = null
      }
    }
  }, [propertyId])

  useEffect(() => {
    if (!expiresAt) return
    if (timerRef.current) clearInterval(timerRef.current)

    const tick = () => {
      const left = expiresAt - Date.now()
      setRemaining(Math.max(0, left))
      if (left <= 0) {
        setNegStatus(NEG_STATUS.EXPIRED)
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      }
    }

    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  }, [expiresAt])

  const mmss = useMemo(() => {
    const s = Math.floor(remaining / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }, [remaining])

  return (
    <div className="container py-10 pt-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Live Negotiation</h1>
          <p className="text-gray-600 mt-2">We're working directly with the hotel to get you the best deal</p>
        </div>

        {/* Negotiation in progress */}
        {negStatus === NEG_STATUS.NEGOTIATING && (
          <div className="space-y-6" data-testid="negotiation-loading">
            <div className="card p-6 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-xl font-semibold text-gray-900 mb-2">{message}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-brand-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${negotiationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Hang tight! This may take up to 7 seconds...</p>
            </div>

            {/* Promotional content while waiting */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-4 border-l-4 border-orange-500">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🍽️</span>
                  <h3 className="font-semibold text-gray-900">Great Restaurants</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  While we negotiate, explore amazing local restaurants with discounted rates!
                </p>
                <Link href="/food" className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Browse Restaurants →
                </Link>
              </div>

              <div className="card p-4 border-l-4 border-pink-500">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">💅</span>
                  <h3 className="font-semibold text-gray-900">Beauty Treatments</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Book spa services, hair styling, and nail treatments at special prices!
                </p>
                <Link href="/services" className="text-pink-600 text-sm font-medium hover:text-pink-700">
                  View Services →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success - Deal secured */}
        {negStatus === NEG_STATUS.SUCCESS && (
          <div className="card p-6" data-testid="negotiation-result">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-brand-green mb-2">Negotiation Successful!</h2>
              <p className="text-gray-600">{message}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-700">
                  {property?.name && `Hotel: ${property.name}`}
                </div>
                <div className="text-xs text-gray-500">
                  {property?.city && `Location: ${property.city}`}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Original Price:</span>
                <span className="line-through text-gray-500" data-testid="original-price">₦{base?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Your Negotiated Price:</span>
                <span className="text-2xl font-bold text-brand-green" data-testid="discounted-price">₦{price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">You Save:</span>
                <span className="text-xl font-bold text-red-600" data-testid="savings-amount">₦{(((base ?? 0) - (price ?? 0)) as number).toLocaleString()}</span>
              </div>
              
              <div className="border-t border-green-200 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2">🎁 Bonus Inclusions:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    FREE Car Wash
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Complimentary Gifts
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-center text-sm text-gray-600">
                ⏰ This exclusive offer expires in <span className="font-bold text-red-600" data-testid="countdown-timer">{mmss}</span>
              </div>
              <button
                disabled={isExpired(negStatus)}
                onClick={() => {
                  // Scroll to top before navigation
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setTimeout(() => {
                    // Redirect to payment page with all booking details
                    const paymentParams = new URLSearchParams({
                      propertyId,
                      price: String(price),
                      originalPrice: String(base),
                      checkIn: sp.get('checkIn') || '',
                      checkOut: sp.get('checkOut') || '',
                      adults: sp.get('adults') || '2',
                      children: sp.get('children') || '0',
                      rooms: sp.get('rooms') || '1',
                      negotiationToken
                    })
                    router.push(`/payment?${paymentParams.toString()}`)
                  }, 100)
                }}
                className={`btn-primary w-full ${isExpired(negStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid="book-now-button"
              >
                {isExpired(negStatus) ? 'Offer Expired' : '💳 Proceed to Payment'}
              </button>
              {isExpired(negStatus) && (
                <div className="text-center text-red-600 text-sm" data-testid="expired-message">
                  This offer has expired. Please try negotiating again.
                </div>
              )}
            </div>
          </div>
        )}

        {/* No deals available (Abuja) */}
        {negStatus === NEG_STATUS.NO_DEALS && (
          <div className="card p-6 text-center" data-testid="no-offer-message">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😔</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Deals Available</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setTimeout(() => router.push('/search'), 100)
              }}
              className="btn-ghost"
            >
              Search Other Cities
            </button>
          </div>
        )}

        {/* No offer available */}
        {negStatus === NEG_STATUS.NO_OFFER && (
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤷‍♂️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sorry, No Discount Available for this Hotel Today</h2>
            <p className="text-gray-600 mb-4" data-testid="no-offer-message">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setTimeout(() => window.location.reload(), 100)
                }}
                className="btn-ghost"
                data-testid="retry-negotiation"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setTimeout(() => router.push('/search'), 100)
                }}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading negotiation...</div>}>
      <NegotiatePageContent />
    </Suspense>
  );
}
