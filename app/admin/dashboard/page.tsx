'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalHotels: number
  activeHotels: number
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  averageRating: number
  pendingBookings: number
  recentActivities: Activity[]
}

interface Activity {
  id: string
  type: 'hotel_created' | 'booking_confirmed' | 'hotel_updated' | 'notification_sent' | 'room_status_changed'
  message: string
  timestamp: string
  severity: 'info' | 'success' | 'warning' | 'error'
  metadata?: any
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
}

// Mock data
const mockStats: DashboardStats = {
  totalHotels: 156,
  activeHotels: 142,
  totalBookings: 1247,
  totalRevenue: 89500000,
  occupancyRate: 73.2,
  averageRating: 4.3,
  pendingBookings: 23,
  recentActivities: [
    {
      id: '1',
      type: 'hotel_created',
      message: 'New hotel "Lagos Grand Resort" created in Lagos',
      timestamp: '2025-10-30T10:30:00Z',
      severity: 'success'
    },
    {
      id: '2',
      type: 'booking_confirmed',
      message: 'Booking BK12547 confirmed for Eko Hotel (₦285,000)',
      timestamp: '2025-10-30T10:15:00Z',
      severity: 'info'
    },
    {
      id: '3',
      type: 'room_status_changed',
      message: 'Room 501 at Transcorp Hilton changed from maintenance to available',
      timestamp: '2025-10-30T09:45:00Z',
      severity: 'success'
    },
    {
      id: '4',
      type: 'notification_sent',
      message: 'Check-in reminder sent to 15 guests for tomorrow',
      timestamp: '2025-10-30T09:30:00Z',
      severity: 'info'
    },
    {
      id: '5',
      type: 'hotel_updated',
      message: 'Sheraton Abuja pricing updated (15% increase)',
      timestamp: '2025-10-30T09:00:00Z',
      severity: 'warning'
    }
  ]
}

const quickActions: QuickAction[] = [
  {
    id: 'create-hotel',
    title: 'Add New Hotel',
    description: 'Create a new hotel with rooms and amenities',
    icon: '🏨',
    href: '/admin/hotels/create',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'advanced-search',
    title: 'Advanced Search',
    description: 'Search and filter hotels with advanced criteria',
    icon: '🔍',
    href: '/admin/hotels/advanced',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'bulk-operations',
    title: 'Bulk Operations',
    description: 'Update multiple hotels at once',
    icon: '⚡',
    href: '/admin/hotels/advanced?tab=bulk',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'View performance metrics and trends',
    icon: '📊',
    href: '/admin/hotels/analytics',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'room-management',
    title: 'Room Management',
    description: 'Manage rooms, availability, and bookings',
    icon: '🚪',
    href: '/admin/hotels/1/rooms',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'notifications',
    title: 'Send Notifications',
    description: 'Send emails and SMS to guests',
    icon: '📧',
    href: '/admin/notifications',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
]

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getActivityIcon(type: Activity['type']): string {
  switch (type) {
    case 'hotel_created': return '🏨'
    case 'booking_confirmed': return '✅'
    case 'hotel_updated': return '✏️'
    case 'notification_sent': return '📧'
    case 'room_status_changed': return '🚪'
    default: return 'ℹ️'
  }
}

function getSeverityColor(severity: Activity['severity']): string {
  switch (severity) {
    case 'success': return 'text-green-600'
    case 'warning': return 'text-yellow-600'
    case 'error': return 'text-red-600'
    default: return 'text-blue-600'
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [loading, setLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const router = useRouter()

  useEffect(() => {
    // Simulate fetching dashboard data
    setLoading(true)
    const timer = setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedTimeRange])

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStats({...mockStats, totalBookings: mockStats.totalBookings + Math.floor(Math.random() * 10)})
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your hotels.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-brand-green focus:border-brand-green"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              '🔄'
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-4">🏨</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hotels</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHotels}</p>
              <p className="text-xs text-green-600">+{stats.activeHotels} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 mr-4">📋</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
              <p className="text-xs text-orange-600">+{stats.pendingBookings} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-purple-600 mr-4">💰</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600">+12.5% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-indigo-600 mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              <p className="text-xs text-blue-600">⭐ {stats.averageRating}/5.0 avg rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h2>
          <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <Link
                key={action.id}
                href={action.href}
                className={`block p-4 rounded-lg border-2 hover:scale-105 transition-all duration-200 ${action.color}`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-80">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🔔 Recent Activity</h2>
                <p className="text-sm text-gray-600">Latest system events and updates</p>
              </div>
              <Link
                href="/admin/activity"
                className="text-sm text-brand-green hover:text-brand-dark transition-colors"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getSeverityColor(activity.severity)}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status & Tools */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🏥 System Health</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">142ms ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="text-sm font-medium text-green-600">Healthy ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="text-sm font-medium text-green-600">Active ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Usage</span>
                <span className="text-sm font-medium text-blue-600">67% 📊</span>
              </div>
            </div>
          </div>

          {/* Admin Tools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🛠️ Admin Tools</h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => router.push('/admin/backup')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                💾 Backup Data
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                ⚙️ System Settings
              </button>
              <button
                onClick={() => router.push('/admin/logs')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                📋 View Logs
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                👥 Manage Users
              </button>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📈 Key Indicators</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Booking Conversion</span>
                  <span className="font-medium">23.4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '23.4%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-medium">86%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Revenue Growth</span>
                  <span className="font-medium">+12.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}