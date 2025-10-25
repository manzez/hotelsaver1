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
  const [emailSummary, setEmailSummary] = useState<{
    delivered: number;
    bounced: number;
    complained: number;
    opened: number;
    clicked: number;
    bounceRate: number;
  } | null>(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [evLoading, setEvLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [hours, setHours] = useState<number>(24);
  const [limit, setLimit] = useState<number>(50);

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

  useEffect(() => {
    const fetchEmailSummary = async () => {
      try {
        setEmailLoading(true);
        const response = await fetch('/api/admin/email-events/summary', {
          headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key' }
        });
        if (!response.ok) throw new Error(`Failed to fetch email summary: ${response.status}`);
        const data = await response.json();
        if (data.ok) {
          const s = data.summary || {};
          setEmailSummary({
            delivered: s.delivered || 0,
            bounced: s.bounced || 0,
            complained: s.complained || 0,
            opened: s.opened || 0,
            clicked: s.clicked || 0,
            bounceRate: s.bounceRate || 0,
          });
        }
      } catch (e) {
        console.warn('Email summary unavailable', e);
        setEmailSummary(null);
      } finally {
        setEmailLoading(false);
      }
    };
    fetchEmailSummary();
  }, []);

  const loadEvents = async () => {
    try {
      setEvLoading(true);
      const params = new URLSearchParams({
        ...(typeFilter ? { type: typeFilter } : {}),
        hours: String(hours),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/email-events/list?${params.toString()}`, {
        headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key' }
      });
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      console.warn('Failed to load email events', e);
      setEvents([]);
    } finally {
      setEvLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, hours, limit]);

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

      {/* Email delivery reliability */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Email Delivery Reliability</h3>
          <span className="text-xs text-gray-500">last 24h</span>
        </div>
        {emailLoading ? (
          <div className="text-sm text-gray-600">Loading email stats…</div>
        ) : emailSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Delivered</div>
              <div className="text-base font-semibold text-gray-900">{emailSummary.delivered}</div>
            </div>
            <div>
              <div className="text-gray-600">Bounces</div>
              <div className="text-base font-semibold text-red-600">{emailSummary.bounced}</div>
            </div>
            <div>
              <div className="text-gray-600">Complaints</div>
              <div className="text-base font-semibold text-orange-600">{emailSummary.complained}</div>
            </div>
            <div>
              <div className="text-gray-600">Opens</div>
              <div className="text-base font-semibold text-gray-900">{emailSummary.opened}</div>
            </div>
            <div>
              <div className="text-gray-600">Clicks</div>
              <div className="text-base font-semibold text-gray-900">{emailSummary.clicked}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">No email events yet.</div>
        )}
        {emailSummary && (
          <div className="mt-3 text-xs text-gray-500">Bounce rate: {(emailSummary.bounceRate * 100).toFixed(2)}%</div>
        )}
      </div>

      {/* Recent Email Events */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Email Events</h3>
          <div className="flex items-center gap-2 text-sm">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select h-9">
              <option value="">All types</option>
              <option value="delivered">Delivered</option>
              <option value="bounced">Bounced</option>
              <option value="complained">Complaints</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
            </select>
            <select value={hours} onChange={e => setHours(Number(e.target.value))} className="select h-9">
              <option value={24}>24h</option>
              <option value={72}>72h</option>
              <option value={168}>7d</option>
            </select>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="select h-9">
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button onClick={loadEvents} className="btn-ghost h-9">Refresh</button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">ID</th>
              </tr>
            </thead>
            <tbody>
              {evLoading ? (
                <tr><td className="py-4" colSpan={6}>Loading…</td></tr>
              ) : events.length === 0 ? (
                <tr><td className="py-4 text-gray-500" colSpan={6}>No events</td></tr>
              ) : (
                events.map((e, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(e.createdAt || e.ts).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <span className="badge">{String(e.type || '').split('.').pop()}</span>
                    </td>
                    <td className="py-2 pr-4 max-w-[240px] truncate" title={e.to}>{e.to || '—'}</td>
                    <td className="py-2 pr-4 max-w-[320px] truncate" title={e.subject}>{e.subject || '—'}</td>
                    <td className="py-2 pr-4">{e.status || '—'}</td>
                    <td className="py-2 pr-4 font-mono text-xs max-w-[200px] truncate" title={e.messageId}>{e.messageId || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* Additional Info & Alerts */}
      <div className="card p-6 mt-6">
        {/* Alert banner for spikes */}
        {emailSummary && (emailSummary.bounced > 5 || emailSummary.complained > 1 || emailSummary.bounceRate > 0.05) && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
            ⚠️ Email reliability issue detected — Bounces: {emailSummary.bounced}, Complaints: {emailSummary.complained}, Bounce rate: {(emailSummary.bounceRate * 100).toFixed(2)}%
          </div>
        )}
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