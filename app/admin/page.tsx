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
        <p className="text-gray-600">Welcome to HotelSaver.ng Admin Panel</p>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/hotels/create"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">🏨</span>
            <span className="text-sm font-medium text-gray-900">Add Hotel</span>
          </Link>
          <Link 
            href="/admin/bookings"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">📋</span>
            <span className="text-sm font-medium text-gray-900">View Bookings</span>
          </Link>
          <Link 
            href="/admin/hotels"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">🔍</span>
            <span className="text-sm font-medium text-gray-900">Manage Hotels</span>
          </Link>
          <Link 
            href="/admin/analytics"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mb-2">📈</span>
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}