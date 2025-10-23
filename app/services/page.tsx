'use client'
import { Suspense } from 'react'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CategoryTabs from '@/components/CategoryTabs'
import SafeImage from '@/components/SafeImage'
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceSubcategory, mapLegacyCategory } from '@/lib/service-categories'
import { useCart } from '@/lib/cart-context'

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

function ServicesInner() {
  const sp = useSearchParams()
  const { addToCart, isInCart } = useCart()
  const [city, setCity] = useState('Lagos')
  const [q, setQ] = useState('')
  const [list, setList] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'browse' | 'search'>('browse')
  const [quickAddService, setQuickAddService] = useState<string>('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function run(targetCity = city, query = q, categoryFilter = '') {
    // Try API first with a short timeout; if it fails or times out, fall back to local JSON
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/services/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: targetCity, query: categoryFilter || query }),
        signal: controller.signal
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setList((data?.results as ServiceCard[]) || [])
    } catch (e) {
      // Offline/dev fallback: use bundled JSON and filter client-side
      try {
        const mod: any = await import('../../lib.services.json')
        const arr: any[] = (mod && mod.default) ? (mod.default as any[]) : Array.isArray(mod) ? (mod as any[]) : []
        const qLower = String(categoryFilter || query || '').toLowerCase()
        const filtered = arr
          .filter(s => !targetCity || String(s.city) === targetCity)
          .filter(s => !qLower || (String(s.title || '').toLowerCase().includes(qLower) || String(s.category || '').toLowerCase().includes(qLower)))
          .slice(0, 60)
        setList(filtered as ServiceCard[])
        setError(null)
      } catch (fallbackErr) {
        setError('Could not load services. Please try again.')
        setList([])
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  // Quick add to cart function
  function handleQuickAdd(service: ServiceCard) {
    const categoryMapping = mapLegacyCategory(service.category)
    const isHire = categoryMapping?.categoryId === 'hire' || 
      ['Canopy Hire', 'Chair Hire', 'MC Services', 'Cooler Hire', 'Sound Equipment'].includes(service.category)
    
    addToCart({
      serviceId: service.id,
      title: service.title,
      category: service.category,
      provider: 'Provider', // Default since not in search results
      city: service.city,
      quantity: 1,
      unitPrice: service.prices?.[0]?.amountNGN || 0,
      eventDate: '', // Will be set in cart
      isHireService: isHire,
      image: service.images?.[0]
    })
    
    setQuickAddService(service.id)
    setTimeout(() => setQuickAddService(''), 2000)
  }

  // Handle category selection
  function handleCategorySelect(categoryId: string) {
    setSelectedCategory(categoryId)
    setSelectedSubcategory('')
    setViewMode('search')
    // Don't auto-search yet, wait for subcategory selection
  }

  // Handle subcategory selection
  function handleSubcategorySelect(subcategoryId: string) {
    setSelectedSubcategory(subcategoryId)
    // Auto-search based on subcategory
    const subcategory = SERVICE_CATEGORIES
      .find(cat => cat.id === selectedCategory)
      ?.subcategories.find(sub => sub.id === subcategoryId)
    
    if (subcategory) {
      run(city, '', subcategory.name)
    }
  }

  // Handle search mode
  function handleSearchMode() {
    setViewMode('search')
    setSelectedCategory('')
    setSelectedSubcategory('')
  }

  // Initial load
  useEffect(() => {
    const urlCity = sp.get('city')
    if (urlCity && cities.includes(urlCity)) {
      setCity(urlCity)
    }
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

      

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <div>
          <h1 className="text-2xl font-bold">Services in Nigeria</h1>
          <div className="text-sm text-gray-600">
            Browse by category or search for specific services
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('browse')}
            className={`btn text-sm ${viewMode === 'browse' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Browse Categories
          </button>
          <button 
            onClick={handleSearchMode}
            className={`btn text-sm ${viewMode === 'search' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Category Browser */}
      {viewMode === 'browse' && (
        <div className="mt-6">
          {!selectedCategory ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Choose a Service Category</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SERVICE_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`card p-4 hover:shadow-md transition-all text-left ${category.color}`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-xs mt-1 opacity-80">
                      {category.subcategories.length} services
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <button 
                  onClick={() => setSelectedCategory('')}
                  className="btn btn-ghost text-sm"
                >
                  ← Back to Categories
                </button>
                <h2 className="text-lg font-semibold">
                  {SERVICE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICE_CATEGORIES
                  .find(cat => cat.id === selectedCategory)
                  ?.subcategories.map(subcategory => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategorySelect(subcategory.id)}
                      className={`card p-4 hover:shadow-md transition-all text-left ${
                        selectedSubcategory === subcategory.id 
                          ? 'ring-2 ring-brand-green bg-green-50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{subcategory.icon}</div>
                        <div>
                          <h4 className="font-semibold text-sm">{subcategory.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{subcategory.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Interface */}
      {viewMode === 'search' && (
        <div className="mt-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="select md:w-48 h-12"
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
              className="input flex-1 h-12"
              aria-label="Service query"
            />

            <button onClick={() => run(city, q)} className="btn-primary h-12">
              Search
            </button>
          </div>

          {/* Active Filters */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategory && (
                <span className="badge">
                  {SERVICE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 text-xs hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="badge">
                  {SERVICE_CATEGORIES
                    .find(cat => cat.id === selectedCategory)
                    ?.subcategories.find(sub => sub.id === selectedSubcategory)?.name}
                  <button 
                    onClick={() => setSelectedSubcategory('')}
                    className="ml-2 text-xs hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* States */}
      {error && <div className="card p-4 mt-4 text-red-600">{error}</div>}
      {loading && !list.length && <div className="card p-4 mt-4">Loading services…</div>}

      {/* Results */}
      {viewMode === 'search' && (
        <div className="grid-cards mt-6">
          {list.map(s => {
            // Map legacy category to new structure for enhanced display
            const categoryMapping = mapLegacyCategory(s.category)
            const categoryInfo = categoryMapping ? 
              SERVICE_CATEGORIES.find(cat => cat.id === categoryMapping.categoryId) : null
            const subcategoryInfo = categoryMapping && categoryInfo ?
              categoryInfo.subcategories.find(sub => sub.id === categoryMapping.subcategoryId) : null

            return (
              <div key={s.id} className="card overflow-hidden">
                <SafeImage
                  src={s.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80'}
                  alt={s.title}
                  className="h-48 w-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1560472354-b43ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {s.city} • {subcategoryInfo?.name || s.category}
                        {subcategoryInfo && (
                          <span className="ml-1">{subcategoryInfo.icon}</span>
                        )}
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
                    <div className="text-left md:text-right">
                      <div className="text-lg font-bold">
                        ₦{((s.prices?.[0]?.amountNGN || 0) as number).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">from</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.summary}</p>

                  {/* Category badge */}
                  {categoryInfo && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${categoryInfo.color}`}>
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button 
                      onClick={() => handleQuickAdd(s)}
                      className="btn btn-ghost text-sm flex-1 flex items-center justify-center gap-1"
                      disabled={quickAddService === s.id}
                    >
                      {quickAddService === s.id ? (
                        <>✓ Added</>
                      ) : isInCart(s.id) ? (
                        <>📦 In Cart</>
                      ) : (
                        <>🛒 Add</>
                      )}
                    </button>
                    <Link href={`/services/${s.id}`} className="btn-primary text-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          {!loading && !error && list.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-gray-600">No services found for your search.</p>
              <button 
                onClick={() => setViewMode('browse')}
                className="btn btn-ghost text-sm mt-2"
              >
                Browse Categories Instead
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Services() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading…</div>}>
      <ServicesInner />
    </Suspense>
  )
}
