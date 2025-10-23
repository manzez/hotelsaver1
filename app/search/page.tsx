import { listHotels } from '@/lib/hotels-source'
import { getDiscountFor, getDiscountInfo, DiscountTier } from '@/lib/discounts'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import HotelCardSkeleton from '@/components/HotelCardSkeleton'
import SearchBar from '@/components/SearchBar'
import ResultsSearchHeader from '@/components/ResultsSearchHeader'
import { Suspense } from 'react'
import CategoryTabs from '@/components/CategoryTabs'
import MobileAutoScrollToResults from '@/components/MobileAutoScrollToResults'

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
  // Deterministic, demo-only review count based on id
  const reviewCountFor = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
    return 20 + (hash % 280) // 20 - 299
  }

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

  return (
    <div id="results-start" data-testid="results-start" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 md:mt-6">
      {hotels.map(h => {
        const base = h.basePriceNGN
        const subtotal = nights > 0 ? base * nights : base
        const tax = nights > 0 ? Math.round(subtotal * TAX_RATE) : 0
        const discount = getDiscountFor(h.id)
        const canNegotiate = discount > 0
        const displayPrice = base
        
        return (
          <div key={h.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col">
            {/* Fixed height image container */}
            <div className="relative h-48 flex-shrink-0">
              <SafeImage 
                src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'} 
                alt={h.name} 
                className="w-full h-full object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                  {'⭐'.repeat(h.stars)} {h.stars}.0
                </div>
              </div>
            </div>
            
            {/* Fixed layout content area */}
            <div className="p-4 flex flex-col flex-grow">
              {/* Hotel info - fixed height */}
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight h-10 line-clamp-2">{h.name}</h3>
                <div className="text-xs text-gray-600 mb-3 h-4 flex items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + ' ' + h.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 hover:bg-gray-200"
                  >
                    <svg className="w-3.5 h-3.5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-gray-700">{h.city}</span>
                  </a>
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/>
                    </svg>
                    <span>{reviewCountFor(h.id)} reviews</span>
                  </span>
                </div>

                {/* Pricing Section - fixed layout to prevent jumping */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold text-gray-900">
                      ₦{displayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-600">per night</span>
                  </div>

                  {/* Fixed height for nights calculation to prevent layout shift */}
                  <div className="h-12">
                    {nights > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                        <div className="text-gray-700 font-medium">
                          {nights} {nights===1?'night':'nights'}: ₦{(displayPrice * nights + tax).toLocaleString()}
                        </div>
                        <div className="text-gray-600">incl. ₦{tax.toLocaleString()} tax</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed button area */}
              <div className="flex gap-2 mt-auto">
                <Link 
                  href={`/hotel/${h.id}?checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} 
                  className="flex-1 text-center py-2.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  View Details
                </Link>
                {canNegotiate ? (
                  <Link
                    href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}
                    className="flex-1 text-center py-2.5 bg-brand-green text-white rounded-md text-xs font-medium hover:bg-brand-dark transition-colors duration-200"
                  >
                    Negotiate Price
                  </Link>
                ) : (
                  <Link
                    href={`/book?propertyId=${h.id}&price=${displayPrice}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}
                    className="flex-1 text-center py-2.5 bg-gray-700 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                )}
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

  return (
    <div className="container mx-auto px-4 py-2 md:py-6 min-h-screen">
      <MobileAutoScrollToResults targetId="results-start" />
      {/* Logo removed (already present globally) */}

      {/* Centered toggle: Hotels / Services / Food above search box */}
      <div className="mb-2 md:mb-4 flex justify-center">
        <CategoryTabs active="hotels" hrefs={{ hotels: hotelsHref, services: servicesHref, food: foodHref }} />
      </div>

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

      {/* Horizontal filters strip */}
      <div className="mb-3 overflow-x-auto -mx-4 px-4 pb-2 bg-transparent no-scrollbar">
        <div className="flex gap-2 text-sm">
          <Link href={buildHref({ stayType: 'hotel', negotiating: undefined, minStars: undefined })} className={`no-underline chip whitespace-nowrap ${params.get('stayType')==='hotel' && !negotiatingActive && !minStarsActive ? 'active' : ''}`}>Hotels {hotels.length}</Link>
          <Link href={buildHref({ negotiating: negotiatingActive ? undefined : '1' })} className={`no-underline chip whitespace-nowrap ${negotiatingActive ? 'active' : ''}`}>Negotiating {negotiatingCount}</Link>
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
  )
}
