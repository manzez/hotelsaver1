'use client';

import { useState, useEffect } from 'react';

interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  avgBookingValue: number;
  avgDiscount: number;
  bookingsByCity: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  recentBookings: BookingRecord[];
}

interface BookingRecord {
  bookingId: string;
  hotelName: string;
  userEmail: string;
  finalPrice: number;
  city: string;
  status: string;
  createdAt: string;
  nights: number;
  commissionAmount: number;
}

export default function BookingAnalytics() {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7d'); // 7d, 30d, 90d, all
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, cityFilter]);

  const fetchAnalytics = async () => {
    try {
      let url = '/api/admin/bookings?';
      
      // Add date filter
      if (dateFilter !== 'all') {
        const daysBack = parseInt(dateFilter.replace('d', ''));
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - daysBack);
        url += `dateFrom=${dateFrom.toISOString().split('T')[0]}&`;
      }
      
      // Add city filter
      if (cityFilter) {
        url += `city=${cityFilter}&`;
      }
      
      const response = await fetch(url, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'your-secret-admin-key'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Analytics</h1>
            <p className="text-gray-600">Real-time booking performance and revenue insights</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft border p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="select"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalBookings || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-brand-green">
              ₦{(analytics?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Commission Earned</h3>
            <p className="text-3xl font-bold text-green-600">
              ₦{(analytics?.totalCommission || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Avg Booking Value</h3>
            <p className="text-3xl font-bold text-blue-600">
              ₦{Math.round(analytics?.avgBookingValue || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Avg Discount</h3>
            <p className="text-3xl font-bold text-orange-600">
              {((analytics?.avgDiscount || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bookings by City */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by City</h3>
            <div className="space-y-3">
              {Object.entries(analytics?.bookingsByCity || {}).map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-gray-700">{city}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-green h-2 rounded-full"
                        style={{ 
                          width: `${((count / (analytics?.totalBookings || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings by Status */}
          <div className="bg-white rounded-xl shadow-soft border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h3>
            <div className="space-y-3">
              {Object.entries(analytics?.bookingsByStatus || {}).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  confirmed: 'bg-green-500',
                  pending: 'bg-yellow-500',
                  cancelled: 'bg-red-500',
                  completed: 'bg-blue-500'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`}></div>
                      <span className="text-gray-700 capitalize">{status}</span>
                    </div>
                    <span className="font-bold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Booking ID</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Hotel</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Commission</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.recentBookings || []).map((booking) => (
                  <tr key={booking.bookingId} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900 font-mono">
                      {booking.bookingId.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{booking.hotelName}</p>
                        <p className="text-sm text-gray-500">{booking.city} • {booking.nights} nights</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{booking.userEmail}</td>
                    <td className="py-4 px-6 text-gray-700">₦{booking.finalPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-green-600 font-medium">₦{booking.commissionAmount.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!analytics?.recentBookings || analytics.recentBookings.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No bookings found for the selected filters.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="btn-primary">
            📊 Generate Report
          </button>
          <button className="btn-ghost">
            📤 Export CSV
          </button>
          <button className="btn-ghost">
            📧 Email Report
          </button>
        </div>
      </div>
    </div>
  );
}