'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

function ResetInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const token = sp.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) { setMessage('Missing token'); setStatus('error'); return }
    if (password.length < 8) { setMessage('Password must be at least 8 characters'); setStatus('error'); return }
    if (password !== confirm) { setMessage('Passwords do not match'); setStatus('error'); return }
    setStatus('submitting')
    try {
      const res = await fetch('/api/auth/password/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, newPassword: password }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed')
      setStatus('success')
      setTimeout(() => router.push('/auth/signin'), 1500)
    } catch (e: any) {
      setMessage(e?.message || 'Failed to reset password')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-xl font-semibold mb-2 text-center">Reset your password</h1>
        {status === 'success' ? (
          <div className="text-center text-green-700">Password updated. Redirecting…</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">New password</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm password</label>
              <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required />
            </div>
            {status === 'error' && (
              <div className="text-sm text-red-600">{message}</div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={status==='submitting'}>
              {status==='submitting' ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  )
}
