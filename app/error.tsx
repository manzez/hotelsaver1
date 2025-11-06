'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mb-6">⚠️</div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-8">An unexpected error occurred. You can retry or return to the homepage.</p>
      <div className="flex items-center gap-3 justify-center">
        <button onClick={() => reset()} className="btn-ghost border px-5 h-11 rounded-lg">Try again</button>
        <a href="/" className="btn-primary px-5 h-11 rounded-lg">Go Home</a>
      </div>
      <div className="text-xs text-gray-400 mt-6">{error?.message}</div>
    </div>
  )
}

