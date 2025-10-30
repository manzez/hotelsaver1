'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: '📊',
    description: 'System overview and key metrics'
  },
  { 
    name: 'Hotels', 
    href: '/admin/hotels', 
    icon: '🏨',
    badge: '156',
    description: 'Manage hotel listings and details',
    submenu: [
      { name: 'All Hotels', href: '/admin/hotels', icon: '📋' },
      { name: 'Add Hotel', href: '/admin/hotels/create', icon: '➕' },
      { name: 'Advanced Search', href: '/admin/hotels/advanced', icon: '🔍' },
      { name: 'Analytics', href: '/admin/hotels/analytics', icon: '📈' }
    ]
  },
  { 
    name: 'Room Management', 
    href: '/admin/rooms', 
    icon: '🚪',
    description: 'Manage room types, availability, and bookings',
    submenu: [
      { name: 'Room Overview', href: '/admin/rooms', icon: '🏨' },
      { name: 'Room Types', href: '/admin/rooms/types', icon: '🏷️' },
      { name: 'Availability Calendar', href: '/admin/rooms/availability', icon: '📅' }
    ]
  },
  { 
    name: 'Bookings', 
    href: '/admin/bookings', 
    icon: '📋',
    badge: '23',
    description: 'Manage reservations and customer bookings',
    submenu: [
      { name: 'All Bookings', href: '/admin/bookings', icon: '📋' },
      { name: 'Pending Review', href: '/admin/bookings?status=pending', icon: '⏳' },
      { name: 'Confirmed', href: '/admin/bookings?status=confirmed', icon: '✅' },
      { name: 'Calendar View', href: '/admin/bookings/calendar', icon: '📅' }
    ]
  },
  { 
    name: 'Notifications', 
    href: '/admin/notifications', 
    icon: '📧',
    description: 'Send and manage customer communications',
    submenu: [
      { name: 'Send Notifications', href: '/admin/notifications/send', icon: '📤' },
      { name: 'Email Templates', href: '/admin/notifications/templates', icon: '📝' },
      { name: 'Notification History', href: '/admin/notifications/history', icon: '📜' }
    ]
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: '📈',
    description: 'Performance metrics and business insights',
    submenu: [
      { name: 'Revenue Reports', href: '/admin/analytics/revenue', icon: '💰' },
      { name: 'Occupancy Trends', href: '/admin/analytics/occupancy', icon: '📊' },
      { name: 'Customer Analytics', href: '/admin/analytics/customers', icon: '👥' }
    ]
  },
  { 
    name: 'Import/Export', 
    href: '/admin/import-export', 
    icon: '📁',
    description: 'Data management and bulk operations'
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: '⚙️',
    description: 'System configuration and preferences',
    submenu: [
      { name: 'General Settings', href: '/admin/settings/general', icon: '🔧' },
      { name: 'User Management', href: '/admin/settings/users', icon: '👥' },
      { name: 'API Configuration', href: '/admin/settings/api', icon: '🔌' },
      { name: 'Backup & Security', href: '/admin/settings/security', icon: '🔒' }
    ]
  }
]

const cities = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Owerri', 'Kano', 'Ibadan', 
  'Benin City', 'Jos', 'Calabar', 'Kaduna'
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Hotels']))
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuName)) {
        newSet.delete(menuName)
      } else {
        newSet.add(menuName)
      }
      return newSet
    })
  }

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-brand-green">HotelSaver Admin</h1>
          </div>
          
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const itemActive = isActive(item.href)
              const hasSubmenu = item.submenu && item.submenu.length > 0
              const isExpanded = expandedMenus.has(item.name)
              
              return (
                <div key={item.name}>
                  <div
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      itemActive
                        ? 'bg-brand-green text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => hasSubmenu ? toggleMenu(item.name) : null}
                  >
                    <Link href={item.href} className="flex items-center flex-1" onClick={(e) => hasSubmenu && e.preventDefault()}>
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          itemActive 
                            ? 'bg-white text-brand-green' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    {hasSubmenu && (
                      <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive(subitem.href)
                              ? 'bg-brand-green text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-2 text-sm">{subitem.icon}</span>
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Quick City Access */}
          <div className="px-4 mt-6 border-t pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick City Access
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-1">
              {cities.slice(0, 6).map((city) => (
                <Link
                  key={city}
                  href={`/admin/hotels?city=${city}`}
                  className="text-xs px-2 py-1 rounded text-center text-gray-600 hover:bg-gray-100 border"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <span className="text-white">✕</span>
              </button>
            </div>
            {/* Mobile navigation content - same as desktop */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-brand-green">HotelSaver Admin</h1>
              </div>
              <nav className="mt-8 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-brand-green text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 pl-1 pr-4 sm:pl-3 sm:pr-6 lg:pr-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green lg:hidden"
              >
                <span className="sr-only">Open sidebar</span>
                <span className="text-xl">☰</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString('en-GB', { 
                  timeZone: 'GMT', 
                  hour12: false,
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} GMT
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}