'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hotel {
  id: string;
  name: string;
  city: string;
  type: string;
  basePriceNGN: number;
  stars: number;
  images: string[];
  facilities?: any;
  status?: 'active' | 'inactive' | 'pending';
}

interface HotelStats {
  totalHotels: number;
  activeHotels: number;
  avgPrice: number;
  topCity: string;
  recentlyAdded: number;
}

export default function HotelManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/admin/hotels', {
        headers: {
          'x-admin-key': 'your-secret-admin-key' // In production, get from env
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotels(data.hotels || []);
      calculateStats(data.hotels || []);
    } catch (error) {
      console.error('Failed to fetch hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (hotelsList: Hotel[]) => {
    const totalHotels = hotelsList.length;
    const activeHotels = hotelsList.filter(h => h.status !== 'inactive').length;
    const avgPrice = hotelsList.reduce((sum, h) => sum + h.basePriceNGN, 0) / totalHotels;
    
    // Find top city by hotel count
    const cityCount: Record<string, number> = {};
    hotelsList.forEach(h => {
      cityCount[h.city] = (cityCount[h.city] || 0) + 1;
    });
    
    const topCity = Object.entries(cityCount).reduce((a, b) => 
      cityCount[a[0]] > cityCount[b[0]] ? a : b
    )[0];

    setStats({
      totalHotels,
      activeHotels,
      avgPrice,
      topCity,
      recentlyAdded: 5 // Mock data
    });
  };

  const updateHotelPrice = async (hotelId: string, newPrice: number) => {
    try {
      const response = await fetch('/api/admin/hotels/update-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'your-secret-admin-key'
        },
        body: JSON.stringify({ hotelId, newPrice })
      });
      
      if (response.ok) {
        // Update local state
        setHotels(prev => 
          prev.map(h => 
            h.id === hotelId ? { ...h, basePriceNGN: newPrice } : h
          )
        );
      }
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  };

  const toggleHotelStatus = async (hotelId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch('/api/admin/hotels/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'your-secret-admin-key'
        },
        body: JSON.stringify({ hotelId, status: newStatus })
      });
      
      if (response.ok) {
        setHotels(prev => 
          prev.map(h => 
            h.id === hotelId ? { ...h, status: newStatus } : h
          )
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Filter and sort hotels
  const filteredAndSortedHotels = hotels
    .filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hotel.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !cityFilter || hotel.city === cityFilter;
      return matchesSearch && matchesCity;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Hotel];
      let bValue: any = b[sortBy as keyof Hotel];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
            <p className="text-gray-600">Manage your hotel inventory and pricing</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              + Add Hotel
            </button>
            <button className="btn-ghost">
              📤 Export CSV
            </button>
            <button className="btn-ghost">
              📥 Import CSV
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Total Hotels</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalHotels}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Active Hotels</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activeHotels}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Average Price</h3>
            <p className="text-3xl font-bold text-brand-green">₦{Math.round(stats?.avgPrice || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Top City</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.topCity}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft border">
            <h3 className="text-sm text-gray-600 mb-2">Recently Added</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.recentlyAdded}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-soft border p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-1 min-w-64"
            />
            
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select"
            >
              <option value="name">Sort by Name</option>
              <option value="city">Sort by City</option>
              <option value="basePriceNGN">Sort by Price</option>
              <option value="stars">Sort by Stars</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="btn-ghost"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl shadow-soft border overflow-hidden hover:shadow-lg transition-shadow">
              {/* Hotel Image */}
              <div className="h-48 bg-gray-200 relative">
                {hotel.images && hotel.images.length > 0 ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🏨 No Image
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    hotel.status === 'active' ? 'bg-green-100 text-green-800' :
                    hotel.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hotel.status || 'active'}
                  </span>
                </div>
              </div>
              
              {/* Hotel Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-gray-600 text-sm">{hotel.city} • {hotel.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{'⭐'.repeat(hotel.stars)}</p>
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fallback Price:</span>
                    <div className="flex items-center gap-2">
                      <PriceEditor 
                        currentPrice={hotel.basePriceNGN}
                        onSave={(newPrice) => updateHotelPrice(hotel.id, newPrice)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingHotel(hotel)}
                    className="flex-1 btn-ghost text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => toggleHotelStatus(hotel.id, hotel.status === 'active' ? 'inactive' : 'active')}
                    className={`flex-1 text-sm ${
                      hotel.status === 'active' 
                        ? 'btn-ghost text-red-600 hover:bg-red-50' 
                        : 'btn-primary'
                    }`}
                  >
                    {hotel.status === 'active' ? '❌ Deactivate' : '✅ Activate'}
                  </button>
                  <Link 
                    href={`/hotel/${hotel.id}`}
                    target="_blank"
                    className="btn-ghost text-sm"
                  >
                    👁️ View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedHotels.length === 0 && (
          <div className="bg-white rounded-xl shadow-soft border p-12 text-center">
            <p className="text-gray-500 text-lg">No hotels found matching your criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setCityFilter('');
              }}
              className="btn-ghost mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Price Editor Component
function PriceEditor({ currentPrice, onSave }: { currentPrice: number; onSave: (price: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(currentPrice.toString());

  const handleSave = () => {
    const newPrice = parseInt(price.replace(/[,]/g, ''));
    if (!isNaN(newPrice) && newPrice > 0) {
      onSave(newPrice);
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setPrice(currentPrice.toString());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-24 px-2 py-1 text-sm border rounded"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-800 text-xs">✓</button>
        <button onClick={handleCancel} className="text-red-600 hover:text-red-800 text-xs">✕</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-lg font-bold text-gray-900 hover:text-brand-green transition-colors"
    >
      ₦{currentPrice.toLocaleString()}
    </button>
  );
}