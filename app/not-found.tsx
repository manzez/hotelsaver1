export default function NotFound() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-brand-green mb-6">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12h4" strokeLinecap="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" />
        </svg>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-600 mb-8">We couldn't find what you're looking for. Try going back or explore our hotels.</p>
      <div className="flex items-center gap-3 justify-center">
        <a href="/" className="btn-ghost border px-5 h-11 rounded-lg">Go Home</a>
        <a href="/search" className="btn-primary px-5 h-11 rounded-lg">Browse Hotels</a>
      </div>
    </div>
  )
}
