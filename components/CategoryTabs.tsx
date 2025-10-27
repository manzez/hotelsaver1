"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const defaultTabs = [
  { key: 'hotels', label: 'Hotels', href: '/' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'food', label: 'Food', href: '/food' },
  { key: 'airport-taxi', label: 'Airport Taxi', href: '/airport-taxi' }
]

type Hrefs = Partial<{ hotels: string; services: string; food: string; 'airport-taxi': string }>

export default function CategoryTabs({ active, hrefs }: { active: string; hrefs?: Hrefs }) {
  const pathname = usePathname()
  const tabs = defaultTabs.map(t => ({
    ...t,
    href: hrefs && hrefs[t.key as keyof Hrefs] ? (hrefs[t.key as keyof Hrefs] as string) : t.href
  }))
  
  return (
    <div className="inline-flex items-center rounded-full bg-emerald-50 p-1 border border-emerald-200">
      {tabs.map(tab => {
        const isActive = active === tab.key || pathname === tab.href
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`no-underline px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-brand-green text-white shadow'
                : 'text-emerald-700 hover:text-emerald-900 hover:bg-white'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}