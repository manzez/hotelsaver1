"use client"

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Optional: report to monitoring service
    // console.error('App error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-brand-green mb-6">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8">An unexpected error occurred. You can try again or return to the homepage.</p>
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => reset()} className="btn-ghost border px-5 h-11 rounded-lg">Try again</button>
            <a href="/" className="btn-primary px-5 h-11 rounded-lg">Go Home</a>
          </div>
        </div>
      </body>
    </html>
  )
}
