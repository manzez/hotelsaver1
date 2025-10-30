'use client'

import { useState, useEffect } from 'react'

interface BookingAnalytics {
  totalBookings: number
  todaysBookings: number
  yesterdaysBookings: number
  weeklyBookings: number
  monthlyBookings: number
  cancellations: number
  cancelationRate: number
  revenue: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
  }
  topHotels: Array<{
    id: string
    name: string
    city: string
    bookings: number
    revenue: number
  }>
  cityPerformance: Array<{
    city: string
    bookings: number
    revenue: number
    hotels: number
    avgBookingValue: number
  }>
}

// Mock data - replace with real API calls
const mockAnalytics: BookingAnalytics = {
  totalBookings: 1248,
  todaysBookings: 23,
  yesterdaysBookings: 18,
  weeklyBookings: 156,
  monthlyBookings: 678,
  cancellations: 45,
  cancelationRate: 3.6,
  revenue: {
    total: 45670000,
    today: 2850000,
    thisWeek: 19500000,
    thisMonth: 42800000
  },
  topHotels: [
    { id: 'eko-hotels', name: 'Eko Hotels Lagos', city: 'Lagos', bookings: 234, revenue: 8950000 },
    { id: 'transcorp-hilton', name: 'Transcorp Hilton Abuja', city: 'Abuja', bookings: 187, revenue: 7240000 },
    { id: 'golden-tulip-ph', name: 'Golden Tulip Port Harcourt', city: 'Port Harcourt', bookings: 145, revenue: 5680000 },
    { id: 'protea-owerri', name: 'Protea Hotel Owerri', city: 'Owerri', bookings: 98, revenue: 3420000 }
  ],
  cityPerformance: [
    { city: 'Lagos', bookings: 456, revenue: 15200000, hotels: 28, avgBookingValue: 125000 },
    { city: 'Abuja', bookings: 342, revenue: 12800000, hotels: 22, avgBookingValue: 135000 },
    { city: 'Port Harcourt', bookings: 234, revenue: 8900000, hotels: 18, avgBookingValue: 98000 },
    { city: 'Owerri', bookings: 156, revenue: 5200000, hotels: 12, avgBookingValue: 85000 }
  ]
}

function MetricCard({ title, value, change, changeType, icon }: {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
            changeType === 'positive' ? 'text-green-600 bg-green-100' :
            changeType === 'negative' ? 'text-red-600 bg-red-100' :
            'text-gray-600 bg-gray-100'
          }`}>
            {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}{change}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<BookingAnalytics>(mockAnalytics)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    // Auto-refresh data every 15 minutes
    const interval = setInterval(() => {
      // In production, fetch fresh data from API
      setLastUpdated(new Date())
    }, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => `₦${(amount / 1000000).toFixed(1)}M`
  const formatNumber = (num: number) => num.toLocaleString()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleString('en-GB', { 
              timeZone: 'GMT',
              hour12: false,
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} GMT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={() => setLastUpdated(new Date())}
            className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Bookings"
          value={formatNumber(analytics.totalBookings)}
          change="12%"
          changeType="positive"
          icon="📊"
        />
        <MetricCard
          title="Today's Bookings" 
          value={formatNumber(analytics.todaysBookings)}
          change={`${Math.round(((analytics.todaysBookings - analytics.yesterdaysBookings) / analytics.yesterdaysBookings) * 100)}%`}
          changeType={analytics.todaysBookings > analytics.yesterdaysBookings ? 'positive' : 'negative'}
          icon="📅"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.revenue.total)}
          change="15%"
          changeType="positive"
          icon="💰"
        />
        <MetricCard
          title="Cancellation Rate"
          value={`${analytics.cancelationRate}%`}
          change="0.5%"
          changeType="negative"
          icon="❌"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Today</span>
              <span className="font-bold text-green-600">{formatCurrency(analytics.revenue.today)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-900">This Week</span>
              <span className="font-bold text-blue-600">{formatCurrency(analytics.revenue.thisWeek)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-gray-900">This Month</span>
              <span className="font-bold text-purple-600">{formatCurrency(analytics.revenue.thisMonth)}</span>
            </div>
          </div>
        </div>

        {/* Top Performing Hotels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Hotels</h2>
          <div className="space-y-3">
            {analytics.topHotels.map((hotel, index) => (
              <div key={hotel.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{hotel.name}</div>
                    <div className="text-sm text-gray-500">{hotel.city} • {formatNumber(hotel.bookings)} bookings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(hotel.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by City</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">City</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Hotels</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Booking Value</th>
              </tr>
            </thead>
            <tbody>
              {analytics.cityPerformance.map((city) => (
                <tr key={city.city} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{city.city}</td>
                  <td className="py-3 px-4 text-gray-600">{city.hotels}</td>
                  <td className="py-3 px-4 text-gray-600">{formatNumber(city.bookings)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatCurrency(city.revenue)}</td>
                  <td className="py-3 px-4 text-gray-600">₦{formatNumber(city.avgBookingValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Update Schedule */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">📅 Automated Daily Updates</h3>
        <p className="text-sm text-blue-800 mb-3">
          Analytics data is automatically refreshed daily at 3:00 PM GMT to ensure accurate reporting.
        </p>
        <div className="flex items-center gap-4 text-sm text-blue-700">
          <span>⏰ Next update: Today at 15:00 GMT</span>
          <span>•</span>
          <span>🔄 Last update: {lastUpdated.toLocaleString('en-GB', { timeZone: 'GMT' })} GMT</span>
        </div>
      </div>
    </div>
  )
}