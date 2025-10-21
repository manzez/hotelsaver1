"use client";
import React, { useState, useEffect } from "react";

type Metrics = {
  totalHotels: number;
  negotiableHotels: number;
  negotiablePercentage: number;
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  topCities: Array<{ city: string; count: number }>;
  recentBookings: Array<{ id: string; hotel: string; amount: number; date: string }>;
};

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/metrics', {
          headers: {
            'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.ok) {
          setMetrics(data.metrics);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Metrics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container py-6">
        <div className="card p-6 text-center">
          <p className="text-gray-600">No metrics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin · Metrics Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hotels</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalHotels}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              🏨
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Negotiable Hotels</p>
              <p className="text-2xl font-bold text-green-600">{metrics.negotiableHotels}</p>
              <p className="text-xs text-gray-500">{metrics.negotiablePercentage.toFixed(1)}% of total</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              💰
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalBookings}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              📋
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-brand-green">₦{metrics.totalRevenue.toLocaleString()}</p>
              {metrics.totalBookings > 0 && (
                <p className="text-xs text-gray-500">Avg: ₦{metrics.avgBookingValue.toLocaleString()}</p>
              )}
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              💵
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Hotels by City</h3>
          <div className="space-y-3">
            {metrics.topCities.map((city, index) => (
              <div key={city.city} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{city.city}</span>
                </div>
                <span className="text-sm text-gray-600">{city.count} hotels</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          {metrics.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{booking.hotel}</p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                  </div>
                  <span className="text-sm font-medium text-brand-green">₦{booking.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No bookings yet</p>
              <p className="text-sm">Bookings will appear here once customers start booking through the platform.</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>Hotel data: {process.env.NEXT_PUBLIC_DATA_SOURCE === 'db' ? 'Database' : 'JSON files'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>Negotiate API: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>Admin API: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}