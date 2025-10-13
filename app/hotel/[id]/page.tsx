
import { HOTELS } from '@/lib/data'
import Link from 'next/link'

export default function HotelDetail({params}:{params:{id:string}}){
  const h=HOTELS.find(x=>x.id===params.id)
  if(!h) return <div className="py-10">Not found</div>
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold">{h.name}</h1>
      <div className="text-amber-400 mt-1">{"★".repeat(h.stars)}{"☆".repeat(5-h.stars)}</div>
      <div className="mt-4 grid md:grid-cols-3 gap-3">
      {h.images.slice(0,5).map((src: string, i: number) => (
  <img
    key={i}
    src={src}
    alt={`${h.name}-${i}`}
    className="h-44 w-full object-cover rounded-md"
  />
))}

      </div>
      <p className="mt-4 text-gray-700">{h.city} • {h.type} • ₦{h.basePriceNGN.toLocaleString()} / night</p>

      <h2 className="mt-6 text-xl font-semibold">Rooms</h2>
      <div className="mt-3 grid md:grid-cols-2 gap-4">
        {h.rooms?.map((r:any,idx:number)=>(
          <div key={idx} className="card overflow-hidden">
            <img src={r.image} alt={r.name} className="h-40 w-full object-cover"/>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{r.features.join(' • ')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₦{r.priceNGN.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Link href={`/negotiate?propertyId=${h.id}`} className="btn-primary text-sm">Negotiate</Link>
                <Link href={`/book?propertyId=${h.id}`} className="btn-ghost text-sm">Book</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
