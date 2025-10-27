import { listHotels } from '@/lib/hotels-source'
import { getDiscountFor, getDiscountInfo, DiscountTier } from '@/lib/discounts'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import HotelCardSkeleton from '@/components/HotelCardSkeleton'
import SearchBar from '@/components/SearchBar'
import ResultsSearchHeader from '@/components/ResultsSearchHeader'
import SortControl from '@/components/SortControl'
import SearchFilters from '@/components/SearchFilters'
import InfoNotice from '@/components/InfoNotice'
import SecurityBadge from '@/components/SecurityBadge'
import { Suspense } from 'react'
import CategoryTabs from '@/components/CategoryTabs'
// MobileAutoScrollToResults removed to avoid auto scrolling on load
import MobileToolbar from '@/components/MobileToolbar'

const TAX_RATE = 0.075 // 7.5% VAT (adjust if you need)

function priceRange(key:string){
  if(key==='u80') return [0,80000]
  if(key==='80_130') return [80000,130000]
  if(key==='130_200') return [130000,200000]
  return [200000,99999999]
}

function nightsBetween(checkIn?:string|null, checkOut?:string|null){
  if(!checkIn || !checkOut) return 0
  
  // Parse dates as local dates (YYYY-MM-DD format)
  const checkInDate = new Date(checkIn + 'T00:00:00')
  const checkOutDate = new Date(checkOut + 'T00:00:00')
  
  if(isNaN(+checkInDate) || isNaN(+checkOutDate)) return 0
  
  // Calculate difference in days
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
  const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24))
  
  return Math.max(0, daysDiff)
}

// Build a simple Google Maps embed URL for a city (no API key required)
function mapEmbedSrcForCity(city?: string | null) {
  const c = (city || '').trim()
  const q = c ? `${c}, Nigeria` : 'Nigeria'
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
}

async function fetchHotels(params:URLSearchParams){
  const city=params.get('city')||''
  const hotelQuery=params.get('hotelQuery')||''
  const budget=params.get('budget')||''
  const stayType=(params.get('stayType') as 'any'|'hotel'|'apartment')||'any'
  const negotiating = params.get('negotiating') === '1'
  const minStars = Number(params.get('minStars') || '0')

  // Base list from source (DB or JSON)
  let list = await listHotels({ city, budgetKey: budget || undefined, stayType })

  // Filter by hotel name if specified (client-side match to preserve behavior)
  if (hotelQuery) {
    const q = hotelQuery.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(q))
  }

  // Extra filters based on chips
  if (minStars > 0) {
    list = list.filter(h => (h.stars || 0) >= minStars)
  }
  if (negotiating) {
    list = list.filter(h => getDiscountFor(h.id) > 0)
  }

  return list
}

function SearchResults({ params, hotels, nights, checkIn, checkOut }: {
  params: URLSearchParams
  hotels: any[]
  nights: number
  checkIn: string | null
  checkOut: string | null
}) {
  // Curated, realistic photo sets per city to improve authenticity in results
  // without modifying the dataset. Owerri uses curated images across budgets.
  // Other cities use curated images for budget "u80" to keep a consistent look.
  const curatedByCity: Record<string, string[]> = {
    'Owerri': [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1559599189-95f32f16b150?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d56?w=800&h=600&fit=crop&auto=format&q=80'
    ],
    'Lagos': [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&auto=format&q=80'
    ],
    'Abuja': [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1562790351-d273a961e0e4?w=800&h=600&fit=crop&auto=format&q=80'
    ],
    'Port Harcourt': [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5a9?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&auto=format&q=80'
    ]
  }
  // Deterministic, demo-only review count based on id
  const reviewCountFor = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
    return 20 + (hash % 280) // 20 - 299
  }

  // Stable pseudo rating between 3.8 and 4.9
  const ratingFor = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) >>> 0
    const normalized = (hash % 120) / 120 // 0..1
    return Math.round((3.8 + normalized * 1.1) * 10) / 10 // 3.8 - 4.9, 1dp
  }

  const datesSummary = (ci?: string | null, co?: string | null) => {
    if (!ci || !co) return ''
    const s = new Date(ci)
    const e = new Date(co)
    if (isNaN(+s) || isNaN(+e)) return ''
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
    return `${nights} ${nights === 1 ? 'night' : 'nights'}, ${s.toLocaleDateString(undefined, opts)}–${e.toLocaleDateString(undefined, opts)}`
  }

  // Note: mapEmbedSrcForCity defined at module scope and used outside this component

  if (hotels.length === 0) {
    const hotelQuery = params.get('hotelQuery')
    const city = params.get('city')
    
    return (
      <div className="card p-8 mt-6 text-center">
        <h3 className="text-lg font-semibold">No results found</h3>
        <p className="text-gray-600 mt-1">
          {hotelQuery 
            ? `No hotels found matching "${hotelQuery}". Try a different hotel name or search by city.`
            : 'Try a different city or budget range.'
          }
        </p>
        <Link href="/" className="btn-ghost mt-4">Back to Home</Link>
      </div>
    )
  }

  const sortKey = params.get('sort') || 'top'
  const sorted = [...hotels].sort((a, b) => {
    const ra = ratingFor(a.id), rb = ratingFor(b.id)
    const pa = a.basePriceNGN, pb = b.basePriceNGN
    const sa = a.stars || 0, sb = b.stars || 0
    switch (sortKey) {
      case 'price_low': return pa - pb
      case 'price_high': return pb - pa
      case 'negotiating': {
        const da = getDiscountFor(a.id) || 0
        const db = getDiscountFor(b.id) || 0
        if (db !== da) return db - da // higher discount first
        // tie-breaker: then by price ascending
        if (pa !== pb) return pa - pb
        // fallback to rating
        if (rb !== ra) return rb - ra
        return 0
      }
      case 'stars': return sb - sa
      case 'reviews':
        return reviewCountFor(b.id) - reviewCountFor(a.id)
      case 'top':
      default:
        // Combine rating then reviews as tie-breaker
        if (rb !== ra) return rb - ra
        return reviewCountFor(b.id) - reviewCountFor(a.id)
    }
  })

  return (
    <div id="results-start" data-testid="results-start" className="grid grid-cols-1 gap-4 mt-4 md:mt-6">
      {sorted.map(h => {
  // Handle mixed schema: basePriceNGN vs price
  const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0)
    const subtotal = nights > 0 ? base * nights : base
        const tax = nights > 0 ? Math.round(subtotal * TAX_RATE) : 0
        const displayPrice = base
        const totalWithTax = nights > 0 ? subtotal + tax : base
        const rating = ratingFor(h.id)
        const reviews = reviewCountFor(h.id)
  const label = rating >= 4.6 ? 'Excellent' : rating >= 4.2 ? 'Very good' : 'Good'
  const showTopPick = rating >= 4.5
        const hasDeal = getDiscountFor(h.id) > 0
  const discountRate = hasDeal ? getDiscountFor(h.id) : 0
  const discountedNight = hasDeal ? Math.max(1, Math.round(displayPrice * (1 - discountRate))) : displayPrice
  const showHighSecurity = base > 78000
  const badgeColor = rating >= 4.6 ? 'bg-emerald-700' : rating >= 4.2 ? 'bg-sky-700' : 'bg-gray-600'
        const budgetKey = params.get('budget') || ''
        const cityName = h.city
        const curatedList = curatedByCity[cityName]
        const useCurated = cityName === 'Owerri' || (budgetKey === 'u80' && Array.isArray(curatedList))
        const FALLBACK_MAIN = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&q=80'
        const FALLBACK_THUMB1 = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&auto=format&q=80'
        const FALLBACK_THUMB2 = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&q=80'
  const imgs = Array.isArray(h.images) ? (h.images as string[]) : []
  
  // For Places API hotels, use Google Places photos directly
  const isPlacesHotel = h.id && h.id.startsWith('places_')
  
  let heroImg: string
  let thumb1: string
  let thumb2: string
  
  if (isPlacesHotel) {
    // Use Google Places photos for Places API hotels with image proxy
    const placesPhotos = imgs.filter((u: string) => typeof u === 'string' && u.includes('maps.googleapis.com'))
    const proxiedPlacesPhotos = placesPhotos.map(url => `/api/image-proxy?url=${encodeURIComponent(url)}`)
    
    heroImg = proxiedPlacesPhotos[0] || FALLBACK_MAIN
    thumb1 = proxiedPlacesPhotos[1] || proxiedPlacesPhotos[0] || FALLBACK_THUMB1
    thumb2 = proxiedPlacesPhotos[2] || proxiedPlacesPhotos[0] || FALLBACK_THUMB2
  } else {
    // For static hotels, prioritize real hotel photos from Google Maps API
    const googlePhotos = imgs.filter((u: string) => typeof u === 'string' && u.includes('maps.googleapis.com'))
    const unsplashPhotos = imgs.filter((u: string) => typeof u === 'string' && u.includes('unsplash.com'))
    const otherPhotos = imgs.filter((u: string) => typeof u === 'string' && !u.includes('maps.googleapis.com') && !u.includes('unsplash.com'))

    // Priority: Google Maps (real hotel photos) first, then diverse fallbacks
    // Use image proxy for Google Maps photos to handle CORS and authentication
    const proxiedGooglePhotos = googlePhotos.map(url => `/api/image-proxy?url=${encodeURIComponent(url)}`)
    
    heroImg = proxiedGooglePhotos[0] || unsplashPhotos[0] ||
      ((useCurated && curatedList) ? curatedList[0] : (otherPhotos[0] || FALLBACK_MAIN))
    thumb1 = proxiedGooglePhotos[1] || unsplashPhotos[1] || proxiedGooglePhotos[0] ||
      ((useCurated && curatedList) ? (curatedList[1] || curatedList[0]) : (otherPhotos[1] || unsplashPhotos[0] || FALLBACK_THUMB1))
    thumb2 = proxiedGooglePhotos[2] || unsplashPhotos[2] || proxiedGooglePhotos[0] ||
      ((useCurated && curatedList) ? (curatedList[2] || curatedList[0]) : (otherPhotos[2] || unsplashPhotos[0] || FALLBACK_THUMB2))
  }
        
        return (
          <div
            key={h.id}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 min-h-[14rem]">
              {/* Left: Single large photo */}
              <div className="relative w-full sm:w-[320px] sm:min-w-[280px] sm:max-w-[360px] h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                <SafeImage
                  src={heroImg}
                  alt={h.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  fallbackSrc={(imgs.find(img => img.includes('unsplash.com')) || ((useCurated && curatedList) ? curatedList[0] : FALLBACK_MAIN))}
                  loading="lazy"
                />
                {showTopPick && (
                  <span className="absolute top-2 right-2 bg-green-600/90 text-white text-[10px] px-2 py-1 rounded-full shadow">
                    ✓ Top pick
                  </span>
                )}
              </div>

              {/* Right: Info + Price column (mobile stacks, desktop split) */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Middle info (md: 2/3) */}
                <div className="md:col-span-2 min-w-0 flex flex-col justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <Link href={`/hotel/${h.id}?checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} className="no-underline">
                      <h3 className="font-semibold text-sky-700 hover:text-sky-800 text-[15px] leading-snug line-clamp-2">{h.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <Link href={(() => { const p=new URLSearchParams(params); p.set('view','map'); return `/search?${p.toString()}` })()} className="hover:underline">Show on map</Link>
                      <span className="hidden sm:inline">•</span>
                      <span>{h.city}, Nigeria</span>
                      {/* Rating moved to the top-right, replacing the old stars */}
                      <span className="ml-auto inline-flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-6 min-w-[2rem] px-1 rounded ${badgeColor} text-white text-[10px] font-bold`}>{rating.toFixed(1)}</span>
                        <span className="text-gray-700 font-medium">{label}</span>
                      </span>
                    </div>
                    <div className="mt-1 space-y-1.5">
                      <div className="text-green-700 font-medium text-[12px]">Free cancellation</div>
                      <SecurityBadge size="sm" variant="compact" />
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-2">
                    {nights > 0 ? (
                      <>{datesSummary(checkIn, checkOut)}</>
                    ) : (
                      <>Free Wi‑Fi • 24/7 support • Flexible cancellation</>
                    )}
                  </div>
                </div>
                {/* Right price column (md: 1/3) */}
                <div className="md:col-span-1 flex flex-col justify-between items-start md:items-end text-left md:text-right">
                  <div>
                    <div className="text-[11px] text-gray-500">{nights>0? `${nights} night${nights>1?'s':''}, ${Number(params.get('adults')||'2')} adult${Number(params.get('adults')||'2')>1?'s':''}` : '1 room'}</div>
                    <div className="text-base md:text-lg font-bold text-gray-900">
                      ₦{displayPrice.toLocaleString()}
                      {showHighSecurity ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">{nights>0? 'Includes taxes and fees' : 'Taxes may apply at checkout'}</div>
                    <div className="mt-2 flex flex-col sm:flex-row items-stretch gap-2 w-full">
                      <Link href={`/book?propertyId=${h.id}&price=${displayPrice}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} className="inline-flex items-center justify-center h-9 px-4 sm:w-auto w-full rounded-md bg-teal-600 text-white text-sm hover:bg-teal-700 no-underline">Book</Link>
                      {hasDeal && (
                        <Link href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} className="inline-flex items-center justify-center h-9 px-4 sm:w-auto w-full rounded-md bg-brand-green text-white text-sm hover:bg-brand-dark no-underline">Negotiate</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function SearchPage({searchParams}:{searchParams:Record<string,string>}){
  const params=new URLSearchParams(searchParams as any)
  const hotels=await fetchHotels(params)

  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const nights = nightsBetween(checkIn, checkOut)
  const cityParam = params.get('city') || ''
  const hotelsHref = `/search?${params.toString()}`
  const servicesHref = `/services${cityParam ? `?city=${encodeURIComponent(cityParam)}` : ''}`
  const foodHref = `/food${cityParam ? `?city=${encodeURIComponent(cityParam)}` : ''}`

  // Derive simple counts for filter chips
  const negotiatingCount = hotels.filter(h => getDiscountFor(h.id) > 0).length
  const fourPlusStars = hotels.filter(h => (h.stars || 0) >= 4).length
  const apartmentsCount = hotels.filter(h => h.type === 'Apartment').length

  // Helpers to build chip hrefs while preserving other params
  const buildHref = (updates: Record<string,string|undefined>) => {
    const p = new URLSearchParams(params)
    Object.entries(updates).forEach(([k,v]) => {
      if (v === undefined) p.delete(k)
      else p.set(k, v)
    })
    return `/search?${p.toString()}`
  }

  const negotiatingActive = params.get('negotiating') === '1'
  const minStarsActive = Number(params.get('minStars') || '0') >= 4
  const apartmentsActive = (params.get('stayType') || '') === 'apartment'
  const view = params.get('view') || 'list'

  return (
    <div className="container mx-auto px-4 py-2 md:py-6 pb-24 min-h-screen">
      {/* No auto-scroll: keep user at top on first load */}
      {/* Logo removed (already present globally) */}

      {/* Centered toggle: Hotels / Services / Food above search box */}
      <div className="mb-2 md:mb-4 flex justify-center">
        <CategoryTabs active="hotels" hrefs={{ hotels: hotelsHref, services: servicesHref, food: foodHref }} />
      </div>

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-xs text-gray-500 mb-2" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <span>›</span>
        <Link href="/search" className="hover:text-brand-green">Hotels</Link>
        {params.get('city') && (<>
          <span>›</span>
          <span className="text-gray-700">{params.get('city')}</span>
        </>)}
      </nav>

      {/* Compact search summary (mobile) + full search (desktop) */}
      <div className="mb-3 md:mb-6">
        <div className="md:hidden">
          <ResultsSearchHeader
            city={params.get('city') || ''}
            checkIn={checkIn || ''}
            checkOut={checkOut || ''}
            adults={Number(params.get('adults')) || 2}
            children={Number(params.get('children')) || 0}
            rooms={Number(params.get('rooms')) || 1}
            budget={params.get('budget') || 'u80'}
            stayType={(params.get('stayType') as 'any' | 'hotel' | 'apartment') || 'any'}
          />
        </div>
        <div className="hidden md:block">
          <SearchBar 
            defaultCity={params.get('city') || ''}
            defaultHotelQuery={params.get('hotelQuery') || ''}
            defaultCheckIn={checkIn || ''}
            defaultCheckOut={checkOut || ''}
            defaultAdults={Number(params.get('adults')) || 2}
            defaultChildren={Number(params.get('children')) || 0}
            defaultRooms={Number(params.get('rooms')) || 1}
            defaultBudget={params.get('budget') || 'u80'}
            defaultStayType={(params.get('stayType') as 'any' | 'hotel' | 'apartment') || 'any'}
          />
        </div>
      </div>

      {/* Mobile toolbar: Sort / Filter / Map */}
      <MobileToolbar />

      {/* Mobile info notice (dismissible) */}
      <InfoNotice variant="mobile" />

      {/* Horizontal filters (mobile only) */}
      <div className="mb-3 overflow-x-auto -mx-4 px-4 pb-2 bg-transparent no-scrollbar md:hidden">
        <div className="flex gap-2 text-sm">
          <Link href={buildHref({ stayType: 'hotel', negotiating: undefined, minStars: undefined })} className={`no-underline chip whitespace-nowrap ${params.get('stayType')==='hotel' && !negotiatingActive && !minStarsActive ? 'active' : ''}`}>Hotels {hotels.length}</Link>
          <Link href={buildHref({ negotiating: negotiatingActive ? undefined : '1' })} className={`no-underline chip whitespace-nowrap ${negotiatingActive ? 'active' : ''}`}>Deals {negotiatingCount}</Link>
          <Link href={buildHref({ minStars: minStarsActive ? undefined : '4' })} className={`no-underline chip whitespace-nowrap ${minStarsActive ? 'active' : ''}`}>4+ Stars {fourPlusStars}</Link>
          <Link href={buildHref({ stayType: apartmentsActive ? 'any' : 'apartment' })} className={`no-underline chip whitespace-nowrap ${apartmentsActive ? 'active' : ''}`}>Apartments {apartmentsCount}</Link>
        </div>
      </div>

  <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {(() => {
              const city = params.get('city')
              const hotelQuery = params.get('hotelQuery')
              const stayType = params.get('stayType')
              
              if (hotelQuery) {
                return `Hotels matching "${hotelQuery}"`
              } else if (city && stayType === 'apartment') {
                return `Apartments in ${city}`
              } else if (city && stayType === 'hotel') {
                return `Hotels in ${city}`
              } else if (city) {
                return `Stays in ${city}`
              } else if (stayType === 'apartment') {
                return 'All Apartments'
              } else if (stayType === 'hotel') {
                return 'All Hotels'
              }
              return 'All Hotels'
            })()}
          </h1>
          <p className="text-gray-600 mt-1">
            {hotels.length} {hotels.length === 1 ? 'property' : 'properties'} found
            {params.get('hotelQuery') && params.get('city') && (
              <span> in {params.get('city')}</span>
            )}
          </p>
        </div>
      </div>

      {/* Layout: conditional map view */}
      {view === 'map' ? (
        <div className="md:grid md:grid-cols-5 md:gap-4">
          {/* Results list (left) */}
          <main className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500">{hotels.length} results {params.get('city') ? `in ${params.get('city')}` : ''}</div>
              <div className="flex items-center gap-2">
                <SortControl />
                <Link href={(() => { const p=new URLSearchParams(params); p.delete('view'); return `/search?${p.toString()}` })()} className="inline-flex items-center h-9 px-3 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 no-underline">Show list</Link>
              </div>
            </div>
            <Suspense fallback={<HotelCardSkeleton count={8} />}>
              <SearchResults 
                params={params}
                hotels={hotels}
                nights={nights}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </Suspense>
          </main>

          {/* Map (right) */}
          <aside className="md:col-span-3 mt-4 md:mt-0">
            <div className="card p-0 overflow-hidden sticky top-4 h-[70vh] relative">
              <iframe
                title="City map"
                src={mapEmbedSrcForCity(params.get('city'))}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <Link href={(() => { const p=new URLSearchParams(params); p.delete('view'); return `/search?${p.toString()}` })()} className="absolute top-2 right-2 inline-flex items-center h-9 px-3 text-xs rounded-md border border-gray-200 bg-white/90 backdrop-blur hover:bg-white no-underline">Close map</Link>
            </div>
          </aside>
        </div>
      ) : (
        <div className="md:grid md:grid-cols-4 md:gap-4">
          {/* Sidebar with mini map + compare + filters */}
          <aside className="hidden md:block md:col-span-1 space-y-4">
            <div className="card p-3 overflow-hidden">
              <div className="text-xs text-gray-700 mb-2">View in a map</div>
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                <iframe title="Mini map" src={mapEmbedSrcForCity(params.get('city'))} className="w-full h-36 border-0" loading="lazy" />
              </div>
              <Link href={(() => { const p=new URLSearchParams(params); p.set('view','map'); return `/search?${p.toString()}` })()} className="mt-2 inline-flex items-center justify-center w-full h-9 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs hover:bg-emerald-100 no-underline">View in a map</Link>
            </div>
            <div className="card p-3">
              <div className="text-sm font-semibold">Compare properties</div>
              <div className="text-xs text-gray-600 mt-1">Get a side-by-side view of up to 5 properties.</div>
              <button className="mt-2 w-full h-9 rounded-md border border-gray-200 bg-white text-xs text-gray-800 hover:bg-gray-50">Start comparing</button>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-3">Filter by:</h3>
              <SearchFilters />
            </div>
          </aside>

          {/* Results column */}
          <main className="md:col-span-3">
          {/* Sort + Map toggle (desktop only) */}
          <div className="hidden md:flex items-center justify-between mb-3">
            <div className="text-xs text-gray-500">
              {hotels.length} results {params.get('city') ? `in ${params.get('city')}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <SortControl />
              <Link href={(() => { const p=new URLSearchParams(params); p.set('view','map'); return `/search?${p.toString()}` })()} className="inline-flex items-center h-9 px-3 text-xs rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 no-underline">Show on map</Link>
            </div>
          </div>
          {/* Desktop info notice (dismissible) */}
          <InfoNotice variant="desktop" />
          <div className="-mx-4 md:mx-0">
            <Suspense fallback={<HotelCardSkeleton count={8} />}>
              <SearchResults 
                params={params}
                hotels={hotels}
                nights={nights}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </Suspense>
          </div>
          </main>
        </div>
      )}
    </div>
  )
}

// SortControl moved to a dedicated Client Component at components/SortControl.tsx
