'use client'

import { useEffect, useState } from 'react'

type Readiness = {
  ga: boolean
  baseUrl: boolean
  negotiationSecret: boolean
  resend: boolean
  bookingsFrom: boolean
  bookingsInbox: boolean
  db: boolean
  sentry: boolean
}

export default function ReadinessPage() {
  const [data, setData] = useState<Readiness | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/system/readiness')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const Row = ({label, ok}:{label:string, ok?:boolean}) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      {ok ? (
        <span className="inline-flex items-center text-green-700 text-sm">✓ Ready</span>
      ) : (
        <span className="inline-flex items-center text-red-700 text-sm">• Missing</span>
      )}
    </div>
  )

  return (
    <div className="container py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Launch Readiness</h1>
        <p className="text-sm text-gray-600 mb-4">Checks critical environment and integrations for production launch.</p>
        <div className="card p-4">
          {loading && <div className="text-sm">Checking…</div>}
          {data && (
            <>
              <Row label="NEXT_PUBLIC_BASE_URL" ok={data.baseUrl} />
              <Row label="NEXT_PUBLIC_GA_ID (Analytics)" ok={data.ga} />
              <Row label="NEGOTIATION_SECRET" ok={data.negotiationSecret} />
              <Row label="RESEND_API_KEY" ok={data.resend} />
              <Row label="BOOKINGS_FROM" ok={data.bookingsFrom} />
              <Row label="BOOKINGS_INBOX" ok={data.bookingsInbox} />
              <Row label="DATABASE_URL" ok={data.db} />
              <Row label="SENTRY_DSN (Monitoring)" ok={data.sentry} />
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-3">Note: Update values in Vercel → Environment Variables and redeploy.</div>
      </div>
    </div>
  )
}
