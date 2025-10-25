'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function SortControl() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sort = searchParams.get('sort') || 'top'

  const onChange = (value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set('sort', value)
    else p.delete('sort')
    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-600">Sort:</span>
      <select
        className="border border-gray-300 rounded-md h-9 px-2 bg-white"
        defaultValue={sort}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="top">Our top picks</option>
        <option value="price_low">Lowest price first</option>
        <option value="price_high">Highest price first</option>
        <option value="negotiating">Negotiating deals first</option>
        <option value="stars">Star rating</option>
        <option value="reviews">Top reviewed</option>
      </select>
    </div>
  )
}
