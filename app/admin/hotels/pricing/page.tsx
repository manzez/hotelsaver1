// app/admin/hotels/pricing/page.tsx - Advanced pricing management interface
'use client';

import { useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';

interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  shelfPriceNGN: number;
  discountRatePct: number;
  negotiationEnabled: boolean;
  negotiationMinPct: number;
  negotiationMaxPct: number;
  active: boolean;
  updatedAt: string;
}

interface PriceHistory {
  id: string;
  hotelId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export default function PricingManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkUpdateType, setBulkUpdateType] = useState<'price' | 'discount' | 'negotiation'>('price');
  const [bulkValue, setBulkValue] = useState('');
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  useEffect(() => {
    fetchHotels();
    fetchPriceHistory();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/admin/hotels/pricing', {
        headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(data.hotels || []);
      }
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await fetch('/api/admin/hotels/price-history', {
        headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPriceHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    }
  };

  const updateHotelPrice = async (hotelId: string, updates: Partial<Hotel>) => {
    try {
      const response = await fetch('/api/admin/hotels/pricing/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'your-secret-admin-key'
        },
        body: JSON.stringify({ hotelId, updates })
      });
      
      if (response.ok) {
        await fetchHotels(); // Refresh data
        await fetchPriceHistory(); // Refresh history
      } else {
        const error = await response.json();
        alert(`Failed to update: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update hotel:', error);
      alert('Failed to update hotel. Please try again.');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedHotels.length === 0 || !bulkValue) return;

    const updates: Partial<Hotel> = {};
    
    switch (bulkUpdateType) {
      case 'price':
        updates.shelfPriceNGN = parseInt(bulkValue);
        break;
      case 'discount':
        updates.discountRatePct = parseInt(bulkValue);
        break;
      case 'negotiation':
        updates.negotiationEnabled = bulkValue === 'true';
        break;
    }

    try {
      await Promise.all(
        selectedHotels.map(hotelId => updateHotelPrice(hotelId, updates))
      );
      
      setSelectedHotels([]);
      setBulkValue('');
      setShowBulkUpdate(false);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !cityFilter || hotel.city === cityFilter;
    return matchesSearch && matchesCity;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-gray-600">Real-time hotel pricing control with audit trail</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowBulkUpdate(true)}
              disabled={selectedHotels.length === 0}
              className={`btn ${selectedHotels.length > 0 ? 'btn-primary' : 'btn-ghost opacity-50'}`}
            >
              Bulk Update ({selectedHotels.length})
            </button>
            <button className="btn-ghost">
              📊 Export Pricing Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-soft border mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="select"
            >
              <option value="">All Cities</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
              <option value="Owerri">Owerri</option>
            </select>
          </div>
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedHotels.length === filteredHotels.length && filteredHotels.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHotels(filteredHotels.map(h => h.id));
                        } else {
                          setSelectedHotels([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Hotel</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Shelf Price</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Discount %</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Negotiation Range</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHotels.map((hotel) => (
                  <HotelPricingRow
                    key={hotel.id}
                    hotel={hotel}
                    selected={selectedHotels.includes(hotel.id)}
                    onSelect={(selected) => {
                      if (selected) {
                        setSelectedHotels(prev => [...prev, hotel.id]);
                      } else {
                        setSelectedHotels(prev => prev.filter(id => id !== hotel.id));
                      }
                    }}
                    onUpdate={(updates) => updateHotelPrice(hotel.id, updates)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Price Changes</h2>
          <div className="bg-white rounded-xl shadow-soft border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Hotel</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Old Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">New Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Changed By</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {priceHistory.slice(0, 10).map((change) => (
                    <tr key={change.id}>
                      <td className="px-4 py-3 text-sm">
                        {hotels.find(h => h.id === change.hotelId)?.name}
                      </td>
                      <td className="px-4 py-3 text-sm">₦{change.oldPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">₦{change.newPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{change.changedBy}</td>
                      <td className="px-4 py-3 text-sm">{new Date(change.changedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bulk Update Modal */}
        {showBulkUpdate && (
          <BulkUpdateModal
            selectedCount={selectedHotels.length}
            updateType={bulkUpdateType}
            setUpdateType={setBulkUpdateType}
            value={bulkValue}
            setValue={setBulkValue}
            onConfirm={handleBulkUpdate}
            onCancel={() => setShowBulkUpdate(false)}
          />
        )}
      </div>
    </div>
  );
}

// Individual hotel row component with inline editing
function HotelPricingRow({ 
  hotel, 
  selected, 
  onSelect, 
  onUpdate 
}: {
  hotel: Hotel;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (updates: Partial<Hotel>) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleEdit = (field: string, currentValue: number | boolean) => {
    setEditing(field);
    setTempValue(currentValue.toString());
  };

  const handleSave = () => {
    if (!editing) return;
    
    const updates: Partial<Hotel> = {};
    
    if (editing === 'shelfPriceNGN') {
      updates.shelfPriceNGN = parseInt(tempValue);
    } else if (editing === 'discountRatePct') {
      updates.discountRatePct = parseInt(tempValue);
    } else if (editing === 'negotiationMinPct') {
      updates.negotiationMinPct = parseInt(tempValue);
    } else if (editing === 'negotiationMaxPct') {
      updates.negotiationMaxPct = parseInt(tempValue);
    }
    
    onUpdate(updates);
    setEditing(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue('');
  };

  return (
    <tr className={selected ? 'bg-green-50' : ''}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900">{hotel.name}</div>
          <div className="text-sm text-gray-600">{hotel.city}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editing === 'shelfPriceNGN' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-24 text-sm border rounded px-2 py-1"
              autoFocus
            />
            <button onClick={handleSave} className="text-green-600 text-sm">✓</button>
            <button onClick={handleCancel} className="text-red-600 text-sm">✗</button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit('shelfPriceNGN', hotel.shelfPriceNGN)}
            className="text-left hover:bg-gray-100 rounded px-2 py-1"
          >
            ₦{hotel.shelfPriceNGN.toLocaleString()}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        {editing === 'discountRatePct' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-16 text-sm border rounded px-2 py-1"
              autoFocus
            />
            <button onClick={handleSave} className="text-green-600 text-sm">✓</button>
            <button onClick={handleCancel} className="text-red-600 text-sm">✗</button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit('discountRatePct', hotel.discountRatePct)}
            className="text-left hover:bg-gray-100 rounded px-2 py-1"
          >
            {hotel.discountRatePct}%
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {hotel.negotiationEnabled ? `${hotel.negotiationMinPct}% - ${hotel.negotiationMaxPct}%` : 'Disabled'}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          hotel.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {hotel.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onUpdate({ negotiationEnabled: !hotel.negotiationEnabled })}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {hotel.negotiationEnabled ? 'Disable Negotiation' : 'Enable Negotiation'}
        </button>
      </td>
    </tr>
  );
}

// Bulk update modal component
function BulkUpdateModal({
  selectedCount,
  updateType,
  setUpdateType,
  value,
  setValue,
  onConfirm,
  onCancel
}: {
  selectedCount: number;
  updateType: 'price' | 'discount' | 'negotiation';
  setUpdateType: (type: 'price' | 'discount' | 'negotiation') => void;
  value: string;
  setValue: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Bulk Update {selectedCount} Hotels</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Update Type</label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as any)}
              className="select w-full"
            >
              <option value="price">Shelf Price</option>
              <option value="discount">Discount Percentage</option>
              <option value="negotiation">Negotiation Enabled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">New Value</label>
            {updateType === 'negotiation' ? (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="select w-full"
              >
                <option value="">Select...</option>
                <option value="true">Enable</option>
                <option value="false">Disable</option>
              </select>
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={updateType === 'price' ? 'Enter price in NGN' : 'Enter percentage'}
                className="input w-full"
              />
            )}
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onConfirm}
            disabled={!value}
            className="btn-primary flex-1"
          >
            Update All
          </button>
          <button
            onClick={onCancel}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}