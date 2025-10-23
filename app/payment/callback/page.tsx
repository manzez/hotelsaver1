'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackContent() {
  const sp = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const timerRef = { id: null as any }
    const startedAt = Date.now()
    const maxWaitMs = 60_000
    const pollDelayMs = 3000

    const bookAndGo = async (reference: string) => {
      const negotiationToken = sp.get('negotiationToken') || ''
      const propertyId = sp.get('propertyId') || ''
      const checkIn = sp.get('checkIn') || ''
      const checkOut = sp.get('checkOut') || ''
      const adults = sp.get('adults') || '2'
      const children = sp.get('children') || '0'
      const rooms = sp.get('rooms') || '1'
      const name = sp.get('name') || ''
      const qp = new URLSearchParams(Array.from(sp.entries()))
      qp.set('paymentMethod', 'paystack')
      try {
        const bookingRes = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            negotiationToken,
            paymentMethod: 'paystack',
            checkIn,
            checkOut,
            adults,
            children,
            rooms,
            customerInfo: { name },
          })
        })
        const booking = await bookingRes.json().catch(() => ({}))
        const bookingId = String(booking?.bookingId || reference || `BK${Date.now()}`)
        qp.set('status', 'paid')
        qp.set('bookingId', bookingId)
        qp.set('reference', reference)
        router.replace(`/confirmation?${qp.toString()}`)
      } catch {
        qp.set('status', 'failed')
        qp.set('reference', reference)
        router.replace(`/confirmation?${qp.toString()}`)
      }
    }

    const pollIntent = async (reference: string) => {
      try {
        const res = await fetch(`/api/payments/intent?reference=${encodeURIComponent(reference)}`)
        const data = await res.json().catch(() => ({}))
        const status = data?.status
        if (status === 'PAID') return bookAndGo(reference)
        if (status === 'FAILED') {
          const qp = new URLSearchParams(Array.from(sp.entries()))
          qp.set('paymentMethod', 'paystack')
          qp.set('status', 'failed')
          qp.set('reference', reference)
          return router.replace(`/confirmation?${qp.toString()}`)
        }
      } catch {}
      // keep polling until timeout
      if (Date.now() - startedAt < maxWaitMs) {
        timerRef.id = setTimeout(() => pollIntent(reference), pollDelayMs)
      } else {
        const qp = new URLSearchParams(Array.from(sp.entries()))
        qp.set('paymentMethod', 'paystack')
        qp.set('status', 'failed')
        qp.set('reference', reference)
        router.replace(`/confirmation?${qp.toString()}`)
      }
    }

    const doVerify = async () => {
      const reference = sp.get('reference') || sp.get('trxref') // Paystack may use trxref
      const q = new URLSearchParams(Array.from(sp.entries())).toString()
      if (!reference) {
        router.replace(`/confirmation?${q}`)
        return
      }
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const data = await res.json().catch(() => ({}))
        const status = data?.data?.data?.status
        if (status === 'success') {
          return bookAndGo(reference)
        }
        // Otherwise, poll our intent store for up to 60s
        return pollIntent(reference)
      } catch {
        // If verify throws, still try polling
        return pollIntent(reference)
      }
    }
    doVerify()
    return () => { if (timerRef.id) clearTimeout(timerRef.id) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container py-10 text-center">Verifying payment…</div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-center">Loading…</div>}>
      <CallbackContent />
    </Suspense>
  )
}
