
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const NEG_STATUS = {
  PENDING: 'pending',
  OFFER: 'offer',
  NO_OFFER: 'no-offer',
  EXPIRED: 'expired',
} as const

type NegStatus = typeof NEG_STATUS[keyof typeof NEG_STATUS]

export default function NegotiatePage() {
  const sp = useSearchParams()
  const router = useRouter()
  const propertyId = sp.get('propertyId') || ''

  const [negStatus, setNegStatus] = useState<NegStatus>(NEG_STATUS.PENDING)
  const [base, setBase] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isExpired = (status: NegStatus) => status === NEG_STATUS.EXPIRED

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setNegStatus(NEG_STATUS.PENDING)
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (cancelled) return

      if (data.status === 'discount') {
        setBase(Number(data.baseTotal))
        setPrice(Number(data.discountedTotal))
        setExpiresAt(Date.now() + 5 * 60 * 1000)
        setNegStatus(NEG_STATUS.OFFER)
      } else {
        setNegStatus(NEG_STATUS.NO_OFFER)
      }
    })()
    return () => { cancelled = true }
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
    <div className="py-10 grid gap-4 max-w-xl">
      {negStatus === NEG_STATUS.PENDING && (
        <div className="card p-4">
          <b>Waiting for response from hotel, please wait…</b>
          <p className="text-sm text-gray-600 mt-1">Up to 7 seconds.</p>
        </div>
      )}

      {negStatus === NEG_STATUS.OFFER && (
        <div className="card p-5">
          <div className="text-sm text-gray-600">Negotiated offer</div>
          <div className="mt-1 text-2xl font-extrabold text-brand-green">
            ₦{price?.toLocaleString()}
          </div>
          <div className="mt-1 text-sm">
            <span className="line-through text-gray-400">₦{base?.toLocaleString()}</span>
            <span className="ml-2 text-gray-700">
              You save ₦{(((base ?? 0) - (price ?? 0)) as number).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Offer expires in <b>{mmss}</b>
          </div>
          <button
            disabled={isExpired(negStatus)}
            onClick={() => router.push(`/book?propertyId=${propertyId}&price=${price}`)}
            className={`btn-primary mt-4 ${isExpired(negStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Accept & Continue
          </button>
          {isExpired(negStatus) && (
            <div className="mt-2 text-red-600 text-sm">
              Offer expired. Try negotiating again.
            </div>
          )}
        </div>
      )}

      {negStatus === NEG_STATUS.NO_OFFER && (
        <div className="card p-4">
          <p>No offer available right now. Try again or pick another property.</p>
        </div>
      )}
    </div>
  )
}
