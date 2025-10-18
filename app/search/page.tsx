import { HOTELS } from '@/lib/data'
import { getDiscountFor } from '@/lib/discounts'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'

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

function filterHotels(params:URLSearchParams){
  const city=params.get('city')||''
  const rooms=params.get('rooms')||''
  const budget=params.get('budget')||'200p'
  const stayType=params.get('stayType')||'any'
  const [mn,mx]=priceRange(budget)
  let list=HOTELS.filter(h=>!city||h.city===city)
  if(stayType==='hotel') list=list.filter(h=>h.type==='Hotel')
  if(stayType==='apartment') list=list.filter(h=>h.type==='Apartment')
  list=list.filter(h=>h.basePriceNGN>=mn && h.basePriceNGN<=mx)
  return list
}

export default function SearchPage({searchParams}:{searchParams:Record<string,string>}){
  const params=new URLSearchParams(searchParams as any)
  const hotels=filterHotels(params)

  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const nights = nightsBetween(checkIn, checkOut)

  return (
    <div className="py-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stays in {params.get('city')||'Nigeria'}</h2>
        </div>
      </div>

      {hotels.length===0 ? (
        <div className="card p-8 mt-6 text-center">
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-gray-600 mt-1">Try a different city or budget mode.</p>
          <Link href="/" className="btn-ghost mt-4">Back to Home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {hotels.map(h=>{
            const base = h.basePriceNGN
            const subtotal = nights>0 ? base * nights : base
            const tax = nights>0 ? Math.round(subtotal * TAX_RATE) : 0
            const total = nights>0 ? subtotal + tax : base
            const discount = getDiscountFor(h.id)
            const discountedPrice = discount > 0 ? Math.round(base * (1 - discount)) : base
            const savings = base - discountedPrice
            const canNegotiate = discount > 0
            const hasHighDiscount = discount >= 0.20 // 20% or more gets fire emoji
            
            return (
              <div key={h.id} className="card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative">
                  <SafeImage 
                    src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'} 
                    alt={h.name} 
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
                      {'⭐'.repeat(h.stars)} {h.stars}.0
                    </div>
                  </div>
                  {canNegotiate && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save ₦{savings.toLocaleString()}
                    </div>
                  )}
                  {!canNegotiate && (
                    <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Fixed Price
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{h.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1">
                        📍 {h.city} • {h.type}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold ${canNegotiate ? 'text-brand-green' : 'text-gray-900'}`}>
                            ₦{discountedPrice.toLocaleString()}
                          </span>
                          {canNegotiate && (
                            <span className="text-sm text-gray-500 line-through">
                              ₦{base.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {canNegotiate ? `per night • ${Math.round(discount * 100)}% off` : 'per night • Fixed price'}
                        </div>
                      </div>
                      {canNegotiate && (
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">💰 You save</div>
                          <div className="text-sm font-bold text-green-600">₦{savings.toLocaleString()}</div>
                        </div>
                      )}
                    </div>

                    {/* Nights + totals */}
                    {nights > 0 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <strong>{nights} {nights===1?'night':'nights'}</strong> total:
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-lg font-bold text-brand-green">
                            ₦{(discountedPrice * nights + tax).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-600">
                            incl. ₦{tax.toLocaleString()} tax
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link 
                        href={`/hotel/${h.id}`} 
                        className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                      {canNegotiate ? (
                        <Link
                          href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}
                          className="flex-1 text-center py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
                        >
                          {hasHighDiscount ? '🔥 ' : ''}Negotiate Now
                        </Link>
                      ) : (
                        <Link
                          href={`/book?propertyId=${h.id}&price=${discountedPrice}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}
                          className="flex-1 text-center py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Book Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
