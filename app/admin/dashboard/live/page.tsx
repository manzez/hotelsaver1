'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardMetrics {
  todayStats: {
    bookings: number;
    revenue: number;
    uniqueVisitors: number;
    conversionRate: number;
  };
  hotelPerformance: {
    topPerforming: Array<{
      id: string;
      name: string;
      city: string;
      bookings: number;
      revenue: number;
    }>;
    needsAttention: Array<{
      id: string;
      name: string;
      city: string;
      issue: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  cityMetrics: Record<string, {
    hotels: number;
    bookings: number;
    revenue: number;
    avgPrice: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'booking' | 'hotel_added' | 'price_update' | 'discount_change';
    message: string;
    timestamp: string;
    hotel?: string;
    amount?: number;
  }>;
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMetrics();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      // In production, this would fetch from your analytics API
      const mockMetrics: DashboardMetrics = {
        todayStats: {
          bookings: 23,
          revenue: 2400000,
          uniqueVisitors: 1247,
          conversionRate: 1.85
        },
        hotelPerformance: {
          topPerforming: [
            { id: 'eko-hotel-lagos', name: 'Eko Hotel & Suites', city: 'Lagos', bookings: 8, revenue: 960000 },
            { id: 'transcorp-hilton-abuja', name: 'Transcorp Hilton', city: 'Abuja', bookings: 6, revenue: 720000 },
            { id: 'sheraton-lagos', name: 'Sheraton Hotel Lagos', city: 'Lagos', bookings: 4, revenue: 480000 }
          ],
          needsAttention: [
            { id: 'hotel-1', name: 'Royal Palace Hotel', city: 'Owerri', issue: 'Low booking rate', priority: 'high' },
            { id: 'hotel-2', name: 'Grand Hotel', city: 'Port Harcourt', issue: 'Price too high vs competitors', priority: 'medium' }
          ]
        },
        cityMetrics: {
          Lagos: { hotels: 45, bookings: 156, revenue: 18500000, avgPrice: 185000 },
          Abuja: { hotels: 32, bookings: 89, revenue: 12400000, avgPrice: 195000 },
          'Port Harcourt': { hotels: 28, bookings: 67, revenue: 8900000, avgPrice: 165000 },
          Owerri: { hotels: 22, bookings: 34, revenue: 4200000, avgPrice: 145000 }
        },
        recentActivity: [
          { 
            id: '1', 
            type: 'booking', 
            message: 'New booking for Lagos Marriott Hotel', 
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            hotel: 'Lagos Marriott Hotel',
            amount: 180000
          },
          { 
            id: '2', 
            type: 'price_update', 
            message: 'Price updated for Eko Hotel & Suites', 
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            hotel: 'Eko Hotel & Suites'
          },
          { 
            id: '3', 
            type: 'discount_change', 
            message: 'Christmas discount applied to 12 hotels in Lagos', 
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header with Live Indicator */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Live Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
            <p className="text-gray-600">Real-time hotel performance and booking analytics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchMetrics}
              className="btn-ghost"
            >
              🔄 Refresh
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Today's Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Today's Bookings</h3>
                <p className="text-3xl font-bold text-gray-900">{metrics?.todayStats.bookings}</p>
                <p className="text-sm text-green-600 mt-1">+15% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Today's Revenue</h3>
                <p className="text-3xl font-bold text-brand-green">
                  ₦{(metrics?.todayStats.revenue || 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">+8% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-brand-green bg-opacity-10 rounded-lg flex items-center justify-center">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Unique Visitors</h3>
                <p className="text-3xl font-bold text-blue-600">{metrics?.todayStats.uniqueVisitors.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">+23% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Conversion Rate</h3>
                <p className="text-3xl font-bold text-purple-600">{metrics?.todayStats.conversionRate}%</p>
                <p className="text-sm text-purple-600 mt-1">+0.3% vs yesterday</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                📈
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Performing Hotels */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Performing Hotels</h3>
            <div className="space-y-4">
              {metrics?.hotelPerformance.topPerforming.map((hotel, index) => (
                <div key={hotel.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{hotel.name}</p>
                      <p className="text-sm text-gray-500">{hotel.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-green">₦{hotel.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{hotel.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotels Needing Attention */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Needs Attention</h3>
            <div className="space-y-4">
              {metrics?.hotelPerformance.needsAttention.map((hotel) => (
                <div key={hotel.id} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{hotel.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      hotel.priority === 'high' ? 'bg-red-100 text-red-800' :
                      hotel.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {hotel.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{hotel.issue}</p>
                  <p className="text-xs text-gray-500 mt-1">{hotel.city}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🔄 Recent Activity</h3>
            <div className="space-y-4">
              {metrics?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'hotel_added' ? 'bg-blue-500' :
                    activity.type === 'price_update' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`}>
                    {activity.type === 'booking' ? '📋' :
                     activity.type === 'hotel_added' ? '🏨' :
                     activity.type === 'price_update' ? '💰' :
                     '🏷️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    {activity.amount && (
                      <p className="text-sm text-green-600 font-medium">₦{activity.amount.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* City Performance Overview */}
        <div className="bg-white rounded-xl shadow-soft border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">🏙️ City Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(metrics?.cityMetrics || {}).map(([city, data]) => (
              <div key={city} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">{city}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hotels:</span>
                    <span className="font-medium">{data.hotels}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bookings:</span>
                    <span className="font-medium">{data.bookings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium text-green-600">₦{(data.revenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">₦{data.avgPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-soft border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/admin/hotels/manage" className="btn-ghost text-center">
              🏨 Manage Hotels
            </Link>
            <Link href="/admin/discounts/super-admin" className="btn-ghost text-center">
              🏷️ Update Discounts
            </Link>
            <Link href="/admin/bookings/analytics" className="btn-ghost text-center">
              📊 View Analytics
            </Link>
            <button className="btn-ghost">
              📤 Export Report
            </button>
            <button className="btn-ghost">
              📧 Send Alert
            </button>
            <button className="btn-ghost">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}