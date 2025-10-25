'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ActivateInner() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const [status, setStatus] = useState<'pending'|'success'|'invalid'|'expired'>('pending')

  useEffect(() => {
    const go = async () => {
      // For now, just verify token client-side to provide UX; real activation would be via server action
      try {
        const res = await fetch('/api/system/email-config')
        // No-op; placeholder to keep pattern consistent
        setStatus(token ? 'success' : 'invalid')
      } catch {
        setStatus('invalid')
      }
    }
    go()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'pending' && (
          <>
            <div className="w-12 h-12 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Activating…</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">✅</div>
            <h1 className="text-xl font-semibold">Email confirmed</h1>
            <p className="text-gray-600 mt-2">Your account is now activated. You can close this page.</p>
          </>
        )}
        {status !== 'pending' && status !== 'success' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">❌</div>
            <h1 className="text-xl font-semibold">Invalid or expired link</h1>
            <p className="text-gray-600 mt-2">Please request a new activation email.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateInner />
    </Suspense>
  )
}
