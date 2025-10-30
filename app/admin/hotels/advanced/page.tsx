'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdvancedHotelFilter, useBulkOperations, useFilterPreferences } from '@/hooks/useAdvancedFilters'

interface Hotel {
  id: string
  name: string
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Owerri'
  basePriceNGN: number
  stars: number
  type: 'Hotel' | 'Apartment'
  address: string
  phone: string
  email: string
  description: string
  amenities: string[]
  images: string[]
  status: 'active' | 'inactive' | 'maintenance'
  featured: boolean
  totalRooms: number
  availableRooms: number
  createdAt: string
  updatedAt: string
}

// Mock data
const mockHotels: Hotel[] = [
  {
    id: 'eko-hotels-lagos',
    name: 'Eko Hotels and Suites',
    city: 'Lagos',
    basePriceNGN: 185000,
    stars: 5,
    type: 'Hotel',
    address: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    phone: '+234 1 277 7000',
    email: 'reservations@ekohotels.com',
    description: 'Luxury hotel in the heart of Victoria Island offering world-class amenities and services.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Conference Rooms', 'Parking'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    status: 'active',
    featured: true,
    totalRooms: 450,
    availableRooms: 387,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-20T14:30:00Z'
  },
  {
    id: 'transcorp-hilton-abuja',
    name: 'Transcorp Hilton Abuja',
    city: 'Abuja',
    basePriceNGN: 220000,
    stars: 5,
    type: 'Hotel',
    address: '1 Aguiyi Ironsi Street, Maitama District, Abuja',
    phone: '+234 9 461 5000',
    email: 'info@transcorphilton.com',
    description: 'Premier luxury hotel in Abuja with exceptional business and leisure facilities.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Business Center', 'Parking'],
    images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    status: 'active',
    featured: true,
    totalRooms: 670,
    availableRooms: 542,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2025-10-18T11:15:00Z'
  },
  {
    id: 'four-points-lagos',
    name: 'Four Points by Sheraton Lagos',
    city: 'Lagos',
    basePriceNGN: 135000,
    stars: 4,
    type: 'Hotel',
    address: '18B Waziri Ibrahim Crescent, Victoria Island, Lagos',
    phone: '+234 1 460 1600',
    email: 'reservations@fourpointslagos.com',
    description: 'Modern business hotel with contemporary amenities in Victoria Island.',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Center'],
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    status: 'maintenance',
    featured: false,
    totalRooms: 180,
    availableRooms: 0,
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2025-10-25T16:45:00Z'
  }
]

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']

const defaultFilters = {
  searchTerm: '',
  city: '',
  status: '',
  stars: '',
  type: '',
  priceRange: [0, 1000000] as [number, number],
  featured: null as boolean | null,
  occupancyRange: [0, 100] as [number, number],
  sortBy: 'name',
  sortOrder: 'asc' as 'asc' | 'desc'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdvancedHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>(mockHotels)
  const [loading, setLoading] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const { filters, updateFilters, resetFilters } = useFilterPreferences('hotel-filters', defaultFilters)
  const filteredHotels = useAdvancedHotelFilter(hotels, filters)
  
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    getSelectedItems
  } = useBulkOperations(filteredHotels)

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`

  const getOccupancyRate = (hotel: Hotel) => {
    return hotel.totalRooms > 0 ? ((hotel.totalRooms - hotel.availableRooms) / hotel.totalRooms) * 100 : 0
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedCount === 0) return
    
    setLoading(true)
    // In production, make API call
    setTimeout(() => {
      setHotels(prev => prev.map(hotel =>
        selectedIds.has(hotel.id)
          ? { ...hotel, status: newStatus as Hotel['status'], updatedAt: new Date().toISOString() }
          : hotel
      ))
      clearSelection()
      setLoading(false)
    }, 1000)
  }

  const handleBulkDelete = async () => {
    if (selectedCount === 0 || !confirm(`Delete ${selectedCount} hotels? This cannot be undone.`)) return
    
    setLoading(true)
    // In production, make API call
    setTimeout(() => {
      setHotels(prev => prev.filter(hotel => !selectedIds.has(hotel.id)))
      clearSelection()
      setLoading(false)
    }, 1000)
  }

  const handleBulkFeaturedToggle = async () => {
    if (selectedCount === 0) return
    
    setLoading(true)
    // In production, make API call
    setTimeout(() => {
      setHotels(prev => prev.map(hotel =>
        selectedIds.has(hotel.id)
          ? { ...hotel, featured: !hotel.featured, updatedAt: new Date().toISOString() }
          : hotel
      ))
      clearSelection()
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Hotel Management</h1>
          <p className="text-gray-600">
            {filteredHotels.length} of {hotels.length} hotels
            {selectedCount > 0 && ` • ${selectedCount} selected`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/hotels/create"
            className="px-4 py-2 bg-brand-green text-white hover:bg-brand-dark rounded-md transition-colors"
          >
            ➕ Add Hotel
          </Link>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 border rounded-md transition-colors ${
              showAdvancedFilters 
                ? 'bg-brand-green text-white border-brand-green' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔍 Advanced Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
                placeholder="Search hotels..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={filters.city}
                onChange={(e) => updateFilters({ city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stars</label>
              <select
                value={filters.stars}
                onChange={(e) => updateFilters({ stars: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="">All Types</option>
                <option value="Hotel">Hotel</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <select
                value={filters.featured === null ? '' : String(filters.featured)}
                onChange={(e) => updateFilters({ 
                  featured: e.target.value === '' ? null : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="">All Hotels</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="name">Name</option>
                <option value="city">City</option>
                <option value="price">Price</option>
                <option value="stars">Stars</option>
                <option value="occupancy">Occupancy</option>
                <option value="created">Date Created</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters({ 
                    priceRange: [Number(e.target.value), filters.priceRange[1]] 
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({ 
                    priceRange: [filters.priceRange[0], Number(e.target.value)] 
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupancy Rate: {filters.occupancyRange[0]}% - {filters.occupancyRange[1]}%
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.occupancyRange[0]}
                  onChange={(e) => updateFilters({ 
                    occupancyRange: [Number(e.target.value), filters.occupancyRange[1]] 
                  })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.occupancyRange[1]}
                  onChange={(e) => updateFilters({ 
                    occupancyRange: [filters.occupancyRange[0], Number(e.target.value)] 
                  })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900">
              {selectedCount} hotel{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <select
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm"
                defaultValue=""
              >
                <option value="">Change Status</option>
                <option value="active">Set Active</option>
                <option value="inactive">Set Inactive</option>
                <option value="maintenance">Set Maintenance</option>
              </select>
              <button
                onClick={handleBulkFeaturedToggle}
                disabled={loading}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                Toggle Featured
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm font-medium text-gray-600">Select All ({filteredHotels.length})</span>
          </div>
        </div>

        {/* Hotels List */}
        <div className="divide-y divide-gray-200">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(hotel.id)}
                  onChange={() => toggleSelectItem(hotel.id)}
                  className="mt-1 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                />
                
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={hotel.images[0] || '/placeholder-hotel.jpg'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>
                        {hotel.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(hotel.status)}`}>
                          {hotel.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{hotel.city}</span>
                        <span className="text-yellow-500">{'★'.repeat(hotel.stars)}</span>
                        <span>{hotel.type}</span>
                        <span>{hotel.availableRooms} / {hotel.totalRooms} rooms</span>
                        <span>{Math.round(getOccupancyRate(hotel))}% occupied</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{hotel.description}</p>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-gray-900">{formatPrice(hotel.basePriceNGN)}</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📧 {hotel.email}</span>
                      <span>📞 {hotel.phone}</span>
                    </div>

                    <div className="flex gap-1">
                      <Link
                        href={`/admin/hotels/${hotel.id}/view`}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        title="View details"
                      >
                        👁️ View
                      </Link>
                      <Link
                        href={`/admin/hotels/${hotel.id}`}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                        title="Edit hotel"
                      >
                        ✏️ Edit
                      </Link>
                      <Link
                        href={`/hotel/${hotel.id}`}
                        target="_blank"
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
                        title="Public view"
                      >
                        🌐 Public
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}