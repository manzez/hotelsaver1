import { listHotels } from '@/lib/hotels-source'
import { getDiscountFor, getDiscountInfo, DiscountTier } from '@/lib/discounts'
import { format } from 'date-fns'
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
import AvailabilityStatus from '@/components/AvailabilityStatus'
import { BulkAvailabilityProvider, OptimizedAvailabilityStatus } from '@/components/BulkAvailabilityProvider'
import { getBudgetRange, getHotelsWithRoomPricing, type SearchCriteria, type RoomPriceInfo } from '@/lib/room-based-pricing'
import SearchResultsAnalytics from '@/components/SearchResultsAnalytics'

const TAX_RATE = 0.075 // 7.5% VAT (adjust if you need)

function priceRange(key: string) {
  if(key==='u40') return [0,40000]
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
  // Remove budget filtering at hotel level - let room-based pricing handle it
  const stayType=(params.get('stayType') as 'any'|'hotel'|'apartment'|'high-security')||'any'
  const negotiating = params.get('negotiating') === '1'
  const minStars = Number(params.get('minStars') || '0')

  // Base list from source (DB or JSON) - NO budget filtering here
  let list = await listHotels({ city, stayType })

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

async function fetchHotelsWithRoomPricing(params: URLSearchParams) {
  // Get base hotels
  const hotels = await fetchHotels(params)
  
  // Build search criteria from URL params
  const adults = Number(params.get('adults') || '2')
  const children = Number(params.get('children') || '0')
  const rooms = Number(params.get('rooms') || '1')
  const budgetKey = params.get('budget') || 'u40'
  const [budgetMin, budgetMax] = getBudgetRange(budgetKey)

  console.log(`🔍 [SEARCH] City: ${params.get('city')}, Budget: ${budgetKey} [₦${budgetMin.toLocaleString()} - ₦${budgetMax.toLocaleString()}]`)
  console.log(`🔍 [SEARCH] Found ${hotels.length} hotels before filtering`)

  const criteria: SearchCriteria = {
    adults,
    children,
    rooms,
    budgetMin,
    budgetMax
  }

  // Get room-based pricing for all hotels
  const hotelIds = hotels.map(h => h.id)
  const roomPricingMap = await getHotelsWithRoomPricing(hotelIds, criteria)
  
  console.log(`🔍 [SEARCH] Room pricing map size: ${roomPricingMap.size}`)

  // Enhance hotels with room pricing info and filter out those without valid room data
  const hotelsWithRoomPricing = hotels
    .map(hotel => {
      const roomInfo = roomPricingMap.get(hotel.id)
      return {
        ...hotel,
        roomPriceInfo: roomInfo || null
      }
    })
    .filter(hotel => {
      // CRITICAL: Only show hotels with valid room pricing data
      if (!hotel.roomPriceInfo) {
        console.log(`Excluding hotel ${hotel.id}: No room pricing info`)
        return false // Skip hotels without room types
      }
      
      // Skip hotels with zero price (error or no rooms)
      if (hotel.roomPriceInfo.cheapestRoomPrice === 0) {
        console.log(`Excluding hotel ${hotel.id}: Zero price (no suitable rooms)`)
        return false
      }
      
      // Only show hotels that have at least ONE room within budget
      const { hasRoomInBudget, hasAvailableRooms } = hotel.roomPriceInfo
      
      // If we have room pricing data, only show hotels with rooms in budget
      if (hasAvailableRooms && hasRoomInBudget !== undefined) {
        if (!hasRoomInBudget) {
          console.log(`Excluding hotel ${hotel.id}: No rooms in budget range`)
        }
        return hasRoomInBudget
      }
      
      // No valid room data - exclude
      console.log(`Excluding hotel ${hotel.id}: Invalid room data`)
      return false
    })

  console.log(`🔍 [SEARCH] Final result: ${hotelsWithRoomPricing.length} hotels after room filtering`)

  return hotelsWithRoomPricing
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
  // Other cities use curated images for budget "u40" and "u80" to keep a consistent look.
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
    // Use consistent date-fns formatting to avoid hydration issues
    return `${nights} ${nights === 1 ? 'night' : 'nights'}, ${format(s, 'dd MMM')}–${format(e, 'dd MMM')}`
  }

  // Note: mapEmbedSrcForCity defined at module scope and used outside this component

  if (hotels.length === 0) {
    const hotelQuery = params.get('hotelQuery')
    const city = params.get('city')
    const budget = params.get('budget')
    
    return (
      <div className="card p-8 mt-6 text-center">
        <h3 className="text-lg font-semibold">No results found</h3>
        <p className="text-gray-600 mt-1">
          {hotelQuery 
            ? `No hotels found matching "${hotelQuery}". Try a different hotel name or search by city.`
            : budget && budget !== 'u40'
            ? `No properties with rooms in this price range. Try expanding your budget or selecting a different city.`
            : 'Try a different city or budget range.'
          }
        </p>
        <Link href="/" className="btn-ghost mt-4">Back to Home</Link>
      </div>
    )
  }

  // Default to 'negotiating' sort when Deals filter is active and no explicit sort chosen
  const sortKey = params.get('sort') || (params.get('negotiating') === '1' ? 'negotiating' : 'top')
  const sorted = [...hotels].sort((a, b) => {
    const ra = ratingFor(a.id), rb = ratingFor(b.id)
    
    // Use room prices for sorting (cheapest available room)
    const pa = (a as any).roomPriceInfo?.cheapestRoomPrice || 0
    const pb = (b as any).roomPriceInfo?.cheapestRoomPrice || 0
    
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

  // Extract hotel IDs for bulk availability checking
  const hotelIds = sorted.map(h => h.id)
  const rooms = Number(params.get('rooms')) || 1

  const resultsContent = (
    <div id="results-start" data-testid="results-start" className="grid grid-cols-1 gap-4 mt-4 md:mt-6">
      {sorted.map((h, index) => {
        // ONLY use room-based pricing - no more base price fallback
        const roomPriceInfo = (h as any).roomPriceInfo as RoomPriceInfo | null
        
        // Get price from room pricing system (cheapest suitable room)
        const displayPrice = roomPriceInfo?.cheapestRoomPrice || 0
        
        // Skip rendering if no valid price (safety check)
        if (displayPrice === 0) {
          console.warn(`Skipping render for hotel ${h.id}: Zero display price`)
          return null
        }
        
        // Calculate totals based on room price
        const subtotal = nights > 0 ? displayPrice * nights : displayPrice
        const tax = nights > 0 ? Math.round(subtotal * TAX_RATE) : 0
        const totalWithTax = nights > 0 ? subtotal + tax : displayPrice
        
        // Rating and review calculations
        const rating = ratingFor(h.id)
        const reviews = reviewCountFor(h.id)
        const label = rating >= 4.6 ? 'Excellent' : rating >= 4.2 ? 'Very good' : 'Good'
        const showTopPick = rating >= 4.5
        
        // Discount calculations based on room price
        const hasDeal = getDiscountFor(h.id) > 0
        const discountRate = hasDeal ? getDiscountFor(h.id) : 0
        const discountedNight = hasDeal ? Math.max(1, Math.round(displayPrice * (1 - discountRate))) : displayPrice
        
        // High security based on room price (not base price)
        const showHighSecurity = displayPrice > 78000
  const badgeColor = rating >= 4.6 ? 'bg-emerald-700' : rating >= 4.2 ? 'bg-sky-700' : 'bg-gray-600'
        const budgetKey = params.get('budget') || ''
        const cityName = h.city
        const curatedList = curatedByCity[cityName]
        const useCurated = cityName === 'Owerri' || ((budgetKey === 'u40' || budgetKey === 'u80') && Array.isArray(curatedList))
        const FALLBACK_MAIN = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&q=80'
        const FALLBACK_THUMB1 = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&auto=format&q=80'
        const FALLBACK_THUMB2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&q=80'
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
        
        const hotelCard = (
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
                  mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
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

              {/* Booking.com Style Layout: Middle Info + Right Price */}
              <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-3">
                
                {/* Middle Section: Hotel Info (like Booking.com) */}
                <div className="flex-1 min-w-0 space-y-2">
                  
                  {/* Hotel Name (Blue Link) + Location */}
                  <div>
                    <Link href={`/hotel/${h.id}?checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} className="no-underline">
                      <h3 className="font-semibold text-blue-600 hover:text-blue-800 text-lg leading-snug line-clamp-2">{h.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Link href={(() => { const p=new URLSearchParams(params); p.set('view','map'); return `/search?${p.toString()}` })()} className="text-blue-600 hover:underline text-sm">
                        {h.city}, Nigeria
                      </Link>
                      <span className="mx-1">•</span>
                      <span className="text-sm">Show on map</span>
                    </div>
                  </div>

                  {/* Limited-time Deal Badge (if negotiable) */}
                  {hasDeal && (
                    <div className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                      Limited-time Deal
                    </div>
                  )}

                  {/* Room Type Info */}
                  <div className="space-y-1">
                    {roomPriceInfo?.hasAvailableRooms && roomPriceInfo?.matchesCapacity && (
                      <div className="text-sm font-medium text-gray-900">
                        {roomPriceInfo.cheapestRoomName}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">1 room for {Number(params.get('adults')||'2')} adult{Number(params.get('adults')||'2')>1?'s':''}</div>
                  </div>

                  {/* Free Cancellation + Security Badge */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">✓ Free cancellation</span>
                    {roomPriceInfo?.hasAvailableRooms && roomPriceInfo?.matchesCapacity ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">Room match</span>
                    ) : showHighSecurity ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                    )}
                  </div>

                  {/* Availability Status */}
                  {checkIn && checkOut && (
                    <OptimizedAvailabilityStatus
                      hotelId={h.id}
                      className="text-sm text-red-600 font-medium"
                      showDetails={false}
                    />
                  )}

                  {/* Features */}
                  <div className="text-sm text-gray-600">
                    {nights > 0 ? (
                      <>{datesSummary(checkIn, checkOut)}</>
                    ) : (
                      <>Free Wi‑Fi • 24/7 support • Flexible cancellation</>
                    )}
                  </div>
                </div>

                {/* Right Section: Reviews + Price (like Booking.com) */}
                <div className="flex flex-col justify-between items-start md:items-end text-left md:text-right md:min-w-[200px]">
                  
                  {/* Rating Badge + Reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{label}</div>
                      <div className="text-xs text-gray-500">52 reviews</div>
                    </div>
                    <div className={`inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded ${badgeColor} text-white text-sm font-bold`}>
                      {rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">{nights>0? `${nights} night${nights>1?'s':''}, ${Number(params.get('adults')||'2')} adult${Number(params.get('adults')||'2')>1?'s':''}` : '1 room'}</div>
                    
                    {/* Main Price */}
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ₦{displayPrice.toLocaleString()}
                    </div>
                    
                    {/* Includes taxes text */}
                    <div className="text-xs text-gray-500 mb-3">
                      {nights>0? 'Includes taxes and charges' : 'Taxes may apply at checkout'}
                    </div>

                    {/* Book Button */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <Link href={`/book?propertyId=${h.id}&price=${displayPrice}&roomId=${roomPriceInfo?.roomId || ''}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} 
                        className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 no-underline whitespace-nowrap">
                        Book
                      </Link>
                      {hasDeal && (
                        <Link href={`/negotiate?propertyId=${h.id}&roomId=${roomPriceInfo?.roomId || ''}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`} 
                          className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 no-underline whitespace-nowrap">
                          Negotiate price
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

        // Insert beauty treatment banner after 3rd result
        if (index === 2) {
          return (
            <>
              {hotelCard}
              {/* Beauty Treatment Promotional Banner */}
              <div 
                key="beauty-banner"
                className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)'
                }}
              >
                {/* Shimmer overlay using CSS class */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 beauty-banner-shimmer"
                  style={{
                    width: '50%'
                  }}
                />
                
                <div className="relative p-6 md:p-8 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      Save more by ordering your beauty treatments here
                    </h3>
                    <p className="text-green-100 text-sm md:text-base">
                      Unlock exclusive discounts on hair, nails, massage and wellness services
                    </p>
                    
                    <div className="flex gap-3 mt-4">
                      <Link
                        href="/services?category=Hair"
                        className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors no-underline"
                      >
                        Hair Services
                      </Link>
                      <Link
                        href="/services?category=Massage"
                        className="bg-green-500/20 border border-green-300 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-500/30 transition-colors no-underline"
                      >
                        Massage
                      </Link>
                    </div>
                  </div>
                  
                  {/* Decorative icon */}
                  <div className="hidden md:block ml-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-3xl">💆‍♀️</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        }

        return hotelCard
      })}
    </div>
  )

  // Only use bulk availability if we have valid search dates
  if (checkIn && checkOut) {
    return (
      <BulkAvailabilityProvider
        hotelIds={hotelIds}
        checkIn={checkIn}
        checkOut={checkOut}
        rooms={rooms}
      >
        {resultsContent}
      </BulkAvailabilityProvider>
    )
  }

  return resultsContent
}

export default async function SearchPage({searchParams}:{searchParams:Record<string,string>}){
  const params=new URLSearchParams(searchParams as any)
  const hotels=await fetchHotelsWithRoomPricing(params)

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
  const highSecurityCount = hotels.filter(h => {
    // Use room-based pricing for high-security calculation
    const roomPrice = (h as any).roomPriceInfo?.cheapestRoomPrice || 0
    return roomPrice > 78000
  }).length

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
  const highSecurityActive = (params.get('stayType') || '') === 'high-security'
  const view = params.get('view') || 'list'

  return (
    <div className="container mx-auto px-4 py-2 md:py-6 pb-24 min-h-screen">
      {/* Analytics: emit a results event on mount/update (consent-gated) */}
      <SearchResultsAnalytics
        resultCount={hotels.length}
        params={{
          city: params.get('city') || '',
          hotelQuery: params.get('hotelQuery') || '',
          budget: params.get('budget') || 'u40',
          stayType: (params.get('stayType') || 'any'),
          adults: Number(params.get('adults') || '2'),
          children: Number(params.get('children') || '0'),
          rooms: Number(params.get('rooms') || '1'),
          checkIn: params.get('checkIn') || '',
          checkOut: params.get('checkOut') || ''
        }}
      />
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
            budget={params.get('budget') || 'u40'}
            stayType={(params.get('stayType') as 'any' | 'hotel' | 'apartment' | 'high-security') || 'any'}
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
            defaultBudget={params.get('budget') || 'u40'}
            defaultStayType={(params.get('stayType') as 'any' | 'hotel' | 'apartment' | 'high-security') || 'any'}
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
          <Link href={buildHref({ stayType: highSecurityActive ? 'any' : 'high-security' })} className={`no-underline chip whitespace-nowrap ${highSecurityActive ? 'active' : ''}`}>🔒 High Security {highSecurityCount}</Link>
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
