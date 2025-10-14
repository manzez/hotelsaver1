'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { key: 'hotels', label: 'Hotels', href: '/' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'food', label: 'Food', href: '/food' }
]

export default function CategoryTabs({ active }: { active: string }) {
  const pathname = usePathname()
  
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {tabs.map(tab => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active === tab.key || pathname === tab.href
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}