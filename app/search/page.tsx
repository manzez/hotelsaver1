import { listHotels } from '@/lib/hotels-source'
import { getDiscountFor, getDiscountInfo, DiscountTier } from '@/lib/discounts'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import HotelCardSkeleton from '@/components/HotelCardSkeleton'
import SearchBar from '@/components/SearchBar'
import { Suspense } from 'react'

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

  // Base list from source (DB or JSON)
  let list = await listHotels({ city, budgetKey: budget || undefined, stayType })

  // Filter by hotel name if specified (client-side match to preserve behavior)
  if (hotelQuery) {
    const q = hotelQuery.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(q))
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
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
                <p className="text-gray-600 text-xs mb-3 h-4">📍 {h.city} • {h.type}</p>

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
                  href={`/hotel/${h.id}`} 
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Search Bar for filtering */}
      <div className="mb-8">
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

      <div className="flex items-center justify-between mb-6">
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
