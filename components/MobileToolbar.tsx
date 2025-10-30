'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import SortControl from './SortControl'
import SearchFilters from './SearchFilters'

export default function MobileToolbar() {
  const [open, setOpen] = useState<null | 'sort' | 'filter'>(null)
  const sp = useSearchParams()
  const pathname = usePathname()

  const mapHref = (() => {
    const p = new URLSearchParams(sp.toString())
    p.set('view', 'map')
    return `${pathname}?${p.toString()}`
  })()

  // Lock body scroll while a sheet is open (prevents background page scroll)
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      const prevPosition = document.body.style.position
      const prevTop = document.body.style.top
      const scrollTop = window.pageYOffset
      
      // Prevent scrolling by fixing the body position
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollTop}px`
      document.body.style.width = '100%'
      
      return () => { 
        document.body.style.overflow = prev
        document.body.style.position = prevPosition
        document.body.style.top = prevTop
        document.body.style.width = ''
        // Restore scroll position
        window.scrollTo(0, scrollTop)
      }
    }
  }, [open])

  return (
    <>
      {/* Top action bar */}
      <div className="md:hidden sticky top-0 z-30 -mx-4 px-4 py-2 bg-white/95 backdrop-blur border-y border-gray-100">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setOpen('sort')}
            className={`h-10 rounded-md text-sm font-medium border ${open==='sort' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-900'}`}
          >
            Sort
          </button>
          <button
            onClick={() => setOpen('filter')}
            className={`h-10 rounded-md text-sm font-medium border ${open==='filter' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-900'}`}
          >
            Filter
          </button>
          <Link
            href={mapHref}
            className={`h-10 rounded-md text-sm font-medium flex items-center justify-center hover:bg-emerald-100 border ${sp.get('view')==='map' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-900'}`}
          >
            Map
          </Link>
        </div>
      </div>

      {/* Overlay sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 overscroll-contain" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-900 text-base capitalize">{open}</div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            {open === 'sort' ? (
              <div className="pt-2">
                <SortControl />
              </div>
            ) : (
              <SearchFilters />
            )}
          </div>
        </div>
      )}
    </>
  )
}
