'use client'

import Link from 'next/link'

// Mock data - replace with real data from your database
const mockStats = {
  totalBookings: 1248,
  todaysBookings: 23,
  cancellations: 45,
  revenue: 45670000, // in Naira
  avgBookingValue: 125000,
  topPerformingCity: 'Lagos',
  totalHotels: 89
}

const cityStats = [
  { name: 'Lagos', hotels: 28, bookings: 456, revenue: 15200000 },
  { name: 'Abuja', hotels: 22, bookings: 342, revenue: 12800000 },
  { name: 'Port Harcourt', hotels: 18, bookings: 234, revenue: 8900000 },
  { name: 'Owerri', hotels: 12, bookings: 156, revenue: 5200000 },
  { name: 'Kano', hotels: 9, bookings: 60, revenue: 3570000 }
]

const recentBookings = [
  { id: 'BK001', hotel: 'Eko Hotels Lagos', customer: 'John Adebayo', amount: 185000, status: 'Confirmed', date: '2025-10-30' },
  { id: 'BK002', hotel: 'Transcorp Hilton Abuja', customer: 'Mary Okafor', amount: 220000, status: 'Pending', date: '2025-10-30' },
  { id: 'BK003', hotel: 'Golden Tulip PH', customer: 'David Chukwu', amount: 145000, status: 'Confirmed', date: '2025-10-29' },
  { id: 'BK004', hotel: 'Protea Hotel Owerri', customer: 'Sarah Bello', amount: 95000, status: 'Cancelled', date: '2025-10-29' }
]

function StatCard({ title, value, change, icon }: { title: string; value: string; change?: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-gray-600'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Hotelsaver.ng Admin Panel</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={mockStats.totalBookings.toLocaleString()}
          change="+12%"
          icon="📋"
        />
        <StatCard
          title="Today's Bookings"
          value={mockStats.todaysBookings.toString()}
          change="+8%"
          icon="🆕"
        />
        <StatCard
          title="Revenue (₦)"
          value={mockStats.revenue.toLocaleString()}
          change="+15%"
          icon="💰"
        />
        <StatCard
          title="Total Hotels"
          value={mockStats.totalHotels.toString()}
          change="+3%"
          icon="🏨"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* City Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by City</h3>
          <div className="space-y-4">
            {cityStats.map((city) => (
              <div key={city.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-brand-green rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">{city.name}</p>
                    <p className="text-sm text-gray-600">{city.hotels} hotels • {city.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦{city.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{booking.customer}</p>
                  <p className="text-sm text-gray-600">{booking.hotel}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦{booking.amount.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/bookings" className="text-sm text-brand-green hover:text-brand-dark font-medium">
              View all bookings →
            </Link>
          </div>
        </div>
      </div>

      {/* Advanced Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hotel Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏨 Hotel Management</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/admin/hotels/create"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">➕</span>
              <span className="text-sm font-medium">Add Hotel</span>
            </Link>
            <Link 
              href="/admin/hotels/manage"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">⚙️</span>
              <span className="text-sm font-medium">Manage Hotels</span>
            </Link>
            <Link 
              href="/admin/hotels/bulk"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-brand-green/10 border-brand-green/30 transition-colors"
            >
              <span className="text-lg mr-2">⚡</span>
              <span className="text-sm font-medium text-brand-green">Bulk Operations</span>
            </Link>
            <Link 
              href="/admin/hotels/analytics"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">📊</span>
              <span className="text-sm font-medium">Hotel Analytics</span>
            </Link>
          </div>
        </div>

        {/* Discount & Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Pricing & Discounts</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/admin/discounts"
              className="flex items-center p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-lg mr-2">💳</span>
              <span className="text-sm font-medium text-green-700">Hotel Discounts</span>
            </Link>
            <Link 
              href="/admin/discounts/super-admin"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-orange-50 border-orange-200 transition-colors"
            >
              <span className="text-lg mr-2">🎯</span>
              <span className="text-sm font-medium text-orange-700">Super Discounts</span>
            </Link>
            <Link 
              href="/admin/pricing/dynamic"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">📈</span>
              <span className="text-sm font-medium">Dynamic Pricing</span>
            </Link>
            <Link 
              href="/admin/campaigns"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-purple-50 border-purple-200 transition-colors"
            >
              <span className="text-lg mr-2">🎪</span>
              <span className="text-sm font-medium text-purple-700">Campaigns</span>
            </Link>
            <Link 
              href="/admin/promotions"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">🏷️</span>
              <span className="text-sm font-medium">Promotions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Live Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Real-Time Monitoring</h3>
          <div className="space-y-3">
            <Link 
              href="/admin/dashboard/live"
              className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">📡</span>
                <span className="text-sm font-medium text-green-700">Live Dashboard</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-green-600">LIVE</span>
              </div>
            </Link>
            <Link 
              href="/admin/bookings"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">📋</span>
              <span className="text-sm font-medium">Booking Analytics</span>
            </Link>
          </div>
        </div>

        {/* Business Intelligence */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 Business Intelligence</h3>
          <div className="space-y-3">
            <Link 
              href="/admin/analytics"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 border-blue-200 transition-colors"
            >
              <span className="text-lg mr-2">📈</span>
              <span className="text-sm font-medium text-blue-700">Revenue Analytics</span>
            </Link>
            <Link 
              href="/admin/reports"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">📊</span>
              <span className="text-sm font-medium">Reports</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-700">All Systems Operational</span>
              </div>
            </div>
            <Link 
              href="/admin/system/health"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg mr-2">🔍</span>
              <span className="text-sm font-medium">System Health</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h3>
          <Link 
            href="/admin/help" 
            className="text-sm text-brand-green hover:text-brand-dark font-medium"
          >
            Need help? →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link 
            href="/admin/hotels/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">🏨</span>
            <span className="text-sm font-medium text-gray-900 text-center">Add Hotel</span>
          </Link>
          <Link 
            href="/admin/discounts/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 border-orange-200 transition-colors"
          >
            <span className="text-2xl mb-2">🎯</span>
            <span className="text-sm font-medium text-orange-700 text-center">New Discount</span>
          </Link>
          <Link 
            href="/admin/hotels/bulk"
            className="flex flex-col items-center p-4 border border-brand-green/30 bg-brand-green/5 rounded-lg hover:bg-brand-green/10 transition-colors"
          >
            <span className="text-2xl mb-2">⚡</span>
            <span className="text-sm font-medium text-brand-green text-center">Bulk Update</span>
          </Link>
          <Link 
            href="/admin/bookings"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">�</span>
            <span className="text-sm font-medium text-gray-900 text-center">View Bookings</span>
          </Link>
          <Link 
            href="/admin/dashboard/live"
            className="flex flex-col items-center p-4 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mb-2">📡</span>
            <span className="text-sm font-medium text-green-700 text-center">Live Monitor</span>
          </Link>
          <Link 
            href="/admin/analytics"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 border-blue-200 transition-colors"
          >
            <span className="text-2xl mb-2">📈</span>
            <span className="text-sm font-medium text-blue-700 text-center">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}