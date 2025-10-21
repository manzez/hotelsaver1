'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackContent() {
  const sp = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const doVerify = async () => {
      const reference = sp.get('reference') || sp.get('trxref') // Paystack may use trxref
      const q = new URLSearchParams(Array.from(sp.entries())).toString()
      if (!reference) {
        // No reference; just bounce to confirmation with what we have
        router.replace(`/confirmation?${q}`)
        return
      }
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const data = await res.json().catch(() => ({}))
        // Build bookingId from paystack reference or server data
        const bookingId = data?.data?.data?.reference || `BK${Date.now()}`
        const qp = new URLSearchParams(Array.from(sp.entries()))
        qp.set('bookingId', bookingId)
        qp.set('paymentMethod', 'paystack')
        router.replace(`/confirmation?${qp.toString()}`)
      } catch {
        const qp = new URLSearchParams(Array.from(sp.entries()))
        qp.set('paymentMethod', 'paystack')
        router.replace(`/confirmation?${qp.toString()}`)
      }
    }
    doVerify()
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
