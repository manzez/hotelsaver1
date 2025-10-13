import { HOTELS } from '@/lib/data' // or import HOTELS from '@/lib/hotels.json'
import Link from 'next/link'

const TAX_RATE = 0.075 // 7.5% VAT (adjust if you need)

function priceRange(key:string){
  if(key==='u80') return [0,80000]
  if(key==='80_130') return [80000,130000]
  if(key==='130_200') return [130000,200000]
  return [200000,99999999]
}

function nightsBetween(checkIn?:string|null, checkOut?:string|null){
  if(!checkIn || !checkOut) return 0
  const ci = new Date(checkIn)
  const co = new Date(checkOut)
  if(isNaN(+ci) || isNaN(+co)) return 0
  const ms = co.getTime() - ci.getTime()
  const n = Math.max(0, Math.round(ms / (1000*60*60*24)))
  return n
}

function filterHotels(params:URLSearchParams){
  const city=params.get('city')||''
  const rooms=params.get('rooms')||''
  const budget=params.get('budget')||'u80'
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
          <p className="text-sm text-gray-600 mt-1">
            {checkIn && checkOut
              ? <>Dates: <b>{checkIn}</b> → <b>{checkOut}</b> • {nights} {nights===1?'night':'nights'}</>
              : <>Choose dates for totals</>
            }
          </p>
        </div>
      </div>

      {hotels.length===0 ? (
        <div className="card p-8 mt-6 text-center">
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-gray-600 mt-1">Try a different city or budget mode.</p>
          <Link href="/" className="btn-ghost mt-4">Back to Home</Link>
        </div>
      ) : (
        <div className="grid-cards mt-6">
          {hotels.map(h=>{
            const base = h.basePriceNGN
            const subtotal = nights>0 ? base * nights : base
            const tax = nights>0 ? Math.round(subtotal * TAX_RATE) : 0
            const total = nights>0 ? subtotal + tax : base
            return (
              <div key={h.id} className="card overflow-hidden">
                <img src={h.images[0]} alt={h.name} className="h-48 w-full object-cover"/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{h.name}</h3>
                      <p className="text-sm text-gray-600">{h.city} • {h.type}</p>
                      <div className="mt-1 text-amber-400 text-sm">{"★".repeat(h.stars)}{"☆".repeat(5-h.stars)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₦{h.basePriceNGN.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>
                  </div>

                  {/* Nights + totals */}
                  {nights>0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      For <b>{nights}</b> {nights===1?'night':'nights'} your total is <b>₦{total.toLocaleString()}</b> incl. tax (₦{tax.toLocaleString()}).
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Link href={`/hotel/${h.id}`} className="btn-ghost text-sm">View</Link>
                    {/* Preserve dates & guests if present */}
                    <Link
                      href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn||''}&checkOut=${checkOut||''}&adults=${params.get('adults')||''}&children=${params.get('children')||''}&rooms=${params.get('rooms')||''}`}
                      className="btn-primary text-sm"
                    >
                      Negotiate
                    </Link>
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
