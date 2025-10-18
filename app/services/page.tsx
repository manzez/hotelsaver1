'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import CategoryTabs from '@/components/CategoryTabs'
import SafeImage from '@/components/SafeImage'

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']

type ServiceCard = {
  id: string
  title: string
  city: string
  category: string
  images?: string[]
  rating?: number
  reviews?: number
  summary?: string
  prices?: Array<{ name: string; amountNGN: number; duration?: string }>
}

export default function Services() {
  const [city, setCity] = useState('Lagos')
  const [q, setQ] = useState('')
  const [list, setList] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function run(targetCity = city, query = q) {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/services/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: targetCity, query })
      })
      const data = await res.json()
      setList((data?.results as ServiceCard[]) || [])
    } catch (e) {
      setError('Could not load services. Please try again.')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto update when city changes (no need to press Search)
  useEffect(() => {
    run(city, q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Debounce free-text query changes (optional but nicer UX)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => run(city, q), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <div className="py-8">
      <CategoryTabs active="services" />

      <h1 className="text-2xl font-bold mt-4">Services in Nigeria</h1>
      <div className="text-sm text-gray-600">
        Hint: try <b>“I need my hair braided urgently”</b>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="select md:w-48"
          aria-label="City"
        >
          {cities.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Type of service (e.g. massage, hair, translator)"
          className="input"
          aria-label="Service query"
        />

        {/* Optional manual refresh button (not required anymore) */}
        <button onClick={() => run(city, q)} className="btn-primary">
          Search
        </button>
      </div>

      {/* States */}
      {error && <div className="card p-4 mt-4 text-red-600">{error}</div>}
      {loading && !list.length && <div className="card p-4 mt-4">Loading services…</div>}

      {/* Results */}
      <div className="grid-cards mt-6">
        {list.map(s => (
          <div key={s.id} className="card overflow-hidden">
            <SafeImage
              src={s.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80'}
              alt={s.title}
              className="h-48 w-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80"
              loading="lazy"
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {s.city} • {s.category}
                  </p>
                  <div className="text-sm mt-1">
                    <span className="star">
                      {'★'.repeat(Math.round(s.rating || 5))}
                    </span>
                    <span className="text-gray-400">
                      {'☆'.repeat(5 - Math.round(s.rating || 5))}
                    </span>{' '}
                    <span className="text-gray-500">
                      ({s.reviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ₦{((s.prices?.[0]?.amountNGN || 0) as number).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">from</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.summary}</p>

              <div className="mt-3 text-right">
                <Link href={`/services/${s.id}`} className="btn-primary text-sm">
                  Book
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && !error && list.length === 0 && (
          <div className="card p-6">No services found.</div>
        )}
      </div>
    </div>
  )
}
