'use client';

import { useState, useEffect } from 'react';

interface Hotel {
  id: string;
  name: string;
  city: string;
  basePriceNGN: number;
  stars: number;
}

interface DiscountOverride {
  hotelId: string;
  discountRate: number; // 0-1 (e.g., 0.15 = 15%)
  validFrom?: string;
  validTo?: string;
  campaignName?: string;
}

interface DiscountStats {
  totalHotels: number;
  hotelsWithDiscounts: number;
  avgDiscountRate: number;
  totalSavings: number;
}

export default function SuperAdminDiscounts() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [discountOverrides, setDiscountOverrides] = useState<DiscountOverride[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0.15); // 15% default
  const [stats, setStats] = useState<DiscountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingHotel, setEditingHotel] = useState<string | null>(null);
  const [newDiscountRate, setNewDiscountRate] = useState('');
  
  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [showOnlyWithDiscounts, setShowOnlyWithDiscounts] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch hotels from your existing API
      const hotelsResponse = await fetch('/api/admin/hotels');
      const hotelsData = await hotelsResponse.json();
      setHotels(hotelsData.hotels || []);
      
      // Fetch discount data (you'll need to create this endpoint)
      const discountsResponse = await fetch('/api/admin/discounts');
      const discountsData = await discountsResponse.json();
      setDiscountOverrides(discountsData.overrides || []);
      setGlobalDiscount(discountsData.default || 0.15);
      
      // Calculate stats
      calculateStats(hotelsData.hotels || [], discountsData.overrides || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (hotelsList: Hotel[], overridesList: DiscountOverride[]) => {
    const totalHotels = hotelsList.length;
    const hotelsWithDiscounts = overridesList.length;
    const avgDiscountRate = overridesList.length > 0 
      ? overridesList.reduce((sum, override) => sum + override.discountRate, 0) / overridesList.length 
      : globalDiscount;
    
    const totalSavings = hotelsList.reduce((sum, hotel) => {
      const discount = getHotelDiscount(hotel.id);
      return sum + (hotel.basePriceNGN * discount);
    }, 0);

    setStats({
      totalHotels,
      hotelsWithDiscounts,
      avgDiscountRate,
      totalSavings
    });
  };

  const getHotelDiscount = (hotelId: string): number => {
    const override = discountOverrides.find(o => o.hotelId === hotelId);
    return override ? override.discountRate : globalDiscount;
  };

  const updateHotelDiscount = async (hotelId: string, discountRate: number) => {
    try {
      const response = await fetch('/api/admin/discounts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, discountRate })
      });
      
      if (response.ok) {
        // Update local state
        setDiscountOverrides(prev => {
          const existing = prev.findIndex(o => o.hotelId === hotelId);
          if (existing >= 0) {
            prev[existing].discountRate = discountRate;
            return [...prev];
          } else {
            return [...prev, { hotelId, discountRate }];
          }
        });
        setEditingHotel(null);
        setNewDiscountRate('');
      }
    } catch (error) {
      console.error('Failed to update discount:', error);
    }
  };

  const updateGlobalDiscount = async (newRate: number) => {
    try {
      const response = await fetch('/api/admin/discounts/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRate: newRate })
      });
      
      if (response.ok) {
        setGlobalDiscount(newRate);
      }
    } catch (error) {
      console.error('Failed to update global discount:', error);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const cityMatch = !cityFilter || hotel.city === cityFilter;
    const discountMatch = !showOnlyWithDiscounts || discountOverrides.some(o => o.hotelId === hotel.id);
    return cityMatch && discountMatch;
  });

  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
            <p className="text-gray-600">Manage global and hotel-specific discount rates</p>
          </div>
          <button className="btn-primary">
            + Create Campaign
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Total Hotels</h3>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalHotels}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Hotels with Custom Discounts</h3>
            <p className="text-2xl font-bold text-brand-green">{stats?.hotelsWithDiscounts}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Average Discount Rate</h3>
            <p className="text-2xl font-bold text-orange-600">{((stats?.avgDiscountRate || 0) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Total Potential Savings</h3>
            <p className="text-2xl font-bold text-green-600">₦{stats?.totalSavings.toLocaleString()}</p>
          </div>
        </div>

        {/* Global Discount Settings */}
        <div className="bg-white rounded-xl shadow-soft border p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Global Default Discount</h3>
          <div className="flex items-center gap-4">
            <label className="text-gray-600">Default discount rate for all hotels:</label>
            <input
              type="number"
              value={globalDiscount * 100}
              onChange={(e) => setGlobalDiscount(Number(e.target.value) / 100)}
              onBlur={() => updateGlobalDiscount(globalDiscount)}
              className="input w-24 text-center"
              min="0"
              max="50"
              step="0.5"
            />
            <span className="text-gray-600">%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This applies to hotels without custom discount overrides.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft border p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4">
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
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyWithDiscounts}
                onChange={(e) => setShowOnlyWithDiscounts(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700">Only hotels with custom discounts</span>
            </label>
          </div>
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Hotel Discount Configuration</h3>
            <p className="text-gray-600">Click on discount rates to edit them inline</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Hotel</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">City</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Fallback Price</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Current Discount</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Discounted Price</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Savings</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => {
                  const discount = getHotelDiscount(hotel.id);
                  const discountedPrice = Math.round(hotel.basePriceNGN * (1 - discount));
                  const savings = hotel.basePriceNGN - discountedPrice;
                  const hasCustomDiscount = discountOverrides.some(o => o.hotelId === hotel.id);
                  
                  return (
                    <tr key={hotel.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{hotel.name}</p>
                          <p className="text-sm text-gray-500">{'⭐'.repeat(hotel.stars)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{hotel.city}</td>
                      <td className="py-4 px-6 text-gray-700">₦{hotel.basePriceNGN.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        {editingHotel === hotel.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={newDiscountRate}
                              onChange={(e) => setNewDiscountRate(e.target.value)}
                              className="input w-20 text-center"
                              min="0"
                              max="50"
                              step="0.5"
                              placeholder={(discount * 100).toFixed(1)}
                            />
                            <span className="text-gray-500">%</span>
                            <button
                              onClick={() => updateHotelDiscount(hotel.id, Number(newDiscountRate) / 100)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingHotel(null);
                                setNewDiscountRate('');
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingHotel(hotel.id);
                              setNewDiscountRate((discount * 100).toFixed(1));
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium hover:bg-opacity-80 ${
                              hasCustomDiscount 
                                ? 'bg-brand-green text-white' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(discount * 100).toFixed(1)}%
                            {hasCustomDiscount && <span className="text-xs">Custom</span>}
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-700">₦{discountedPrice.toLocaleString()}</td>
                      <td className="py-4 px-6 text-green-600 font-medium">₦{savings.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <button className="text-brand-green hover:text-brand-dark text-sm">
                          View History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-soft border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-ghost">
              📤 Export Discounts CSV
            </button>
            <button className="btn-ghost">
              📥 Import Discounts CSV
            </button>
            <button className="btn-ghost">
              🎯 Create Seasonal Campaign
            </button>
            <button className="btn-ghost">
              🏷️ Apply City-Wide Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}