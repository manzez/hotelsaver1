import Link from 'next/link'
import SafeImage from './SafeImage'
import { TOURISM_DESTINATIONS, heroPicks } from '@/lib/tourism'

type Props = {
  variant: 'hero' | 'more'
}

export default function TourismScroller({ variant }: Props) {
  const picks = heroPicks()
  const more = TOURISM_DESTINATIONS.filter(d => !picks.find(p => p.slug === d.slug))
  const list = variant === 'hero' ? picks : more

  return (
    <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
      <div className="flex gap-4">
        {list.map(d => (
          <Link key={d.slug} href={`/tourism/${d.slug}`} className="no-underline group flex-shrink-0">
            <div className="w-72 md:w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="relative h-40 md:h-48">
                <SafeImage src={d.heroImage} alt={d.name} className="absolute inset-0 w-full h-full object-cover" fallbackSrc="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-white/80 text-gray-800">{d.category}</span>
              </div>
              <div className="p-3">
                <div className="font-semibold text-gray-900 line-clamp-1">{d.name}</div>
                <div className="text-xs text-gray-600 line-clamp-1">{d.state}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.highlights.slice(0,2).map(h => (
                    <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
