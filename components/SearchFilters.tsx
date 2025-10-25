'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const apply = (updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams(sp.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) p.delete(k)
      else p.set(k, v)
    })
    const qs = p.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const budget = sp.get('budget') || ''
  const minStars = Number(sp.get('minStars') || '0')
  const negotiating = sp.get('negotiating') === '1'
  const stayType = sp.get('stayType') || 'any'

  return (
    <div className="space-y-5 text-sm">
      {/* Budget (radio) */}
      <div>
        <div className="text-gray-800 font-medium mb-2">Your Budget (per night)</div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="budget" className="accent-brand-green" checked={budget==='u80'} onChange={() => apply({ budget: 'u80' })} />
            <span>Under ₦80k</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="budget" className="accent-brand-green" checked={budget==='80_130'} onChange={() => apply({ budget: '80_130' })} />
            <span>₦80k–₦130k</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="budget" className="accent-brand-green" checked={budget==='130_200'} onChange={() => apply({ budget: '130_200' })} />
            <span>₦130k–₦200k</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="budget" className="accent-brand-green" checked={budget==='200p'} onChange={() => apply({ budget: '200p' })} />
            <span>₦200k+</span>
          </label>
        </div>
      </div>

      {/* Popular filters */}
      <div>
        <div className="text-gray-800 font-medium mb-2">Popular Filters</div>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-brand-green" checked={negotiating} onChange={(e) => apply({ negotiating: e.currentTarget.checked ? '1' : undefined })} />
            <span>Deals</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-brand-green" checked={minStars>=4} onChange={(e) => apply({ minStars: e.currentTarget.checked ? '4' : undefined })} />
            <span>Very Good: 8+ (4+ stars)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-brand-green" checked={stayType==='apartment'} onChange={(e) => apply({ stayType: e.currentTarget.checked ? 'apartment' : 'any' })} />
            <span>Apartments</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-brand-green" checked={stayType==='hotel'} onChange={(e) => apply({ stayType: e.currentTarget.checked ? 'hotel' : 'any' })} />
            <span>Hotels</span>
          </label>
        </div>
      </div>
    </div>
  )
}
