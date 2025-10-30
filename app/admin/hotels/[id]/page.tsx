'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'] as const
const availableAmenities = [
  'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Conference Rooms', 
  'Parking', 'Business Center', 'Room Service', 'Laundry', 'Concierge',
  'Airport Shuttle', 'Pet Friendly', 'Air Conditioning', 'Mini Bar',
  'Safe', 'Balcony', 'Garden View', 'Ocean View', 'City View'
]

// Mock hotel data - replace with API call
const mockHotel: Hotel = {
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
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  status: 'active',
  featured: true,
  totalRooms: 450,
  availableRooms: 387,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2025-10-20T14:30:00Z'
}

export default function EditHotelPage() {
  const params = useParams()
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [formData, setFormData] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load hotel data
  useEffect(() => {
    const loadHotel = async () => {
      try {
        // In production, fetch from API
        // const response = await fetch(`/api/admin/hotels/${params.id}`)
        // const data = await response.json()
        
        // For now, use mock data
        setTimeout(() => {
          setHotel(mockHotel)
          setFormData(mockHotel)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error loading hotel:', error)
        setLoading(false)
      }
    }

    loadHotel()
  }, [params.id])

  const validateForm = (): boolean => {
    if (!formData) return false
    
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.basePriceNGN || formData.basePriceNGN <= 0) {
      newErrors.basePriceNGN = 'Valid base price is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.totalRooms || formData.totalRooms <= 0) {
      newErrors.totalRooms = 'Valid total rooms is required'
    }

    if (formData.availableRooms < 0) {
      newErrors.availableRooms = 'Valid available rooms is required'
    }

    if (formData.availableRooms > formData.totalRooms) {
      newErrors.availableRooms = 'Available rooms cannot exceed total rooms'
    }

    const validImages = formData.images.filter(img => img.trim())
    if (validImages.length === 0) {
      newErrors.images = 'At least one image URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof Hotel, value: any) => {
    if (!formData) return
    
    setFormData(prev => prev ? { ...prev, [field]: value } : null)
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    if (!formData) return
    
    setFormData(prev => prev ? {
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    } : null)
  }

  const addImageField = () => {
    if (!formData) return
    
    setFormData(prev => prev ? {
      ...prev,
      images: [...prev.images, '']
    } : null)
  }

  const updateImageField = (index: number, value: string) => {
    if (!formData) return
    
    setFormData(prev => prev ? {
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    } : null)
  }

  const removeImageField = (index: number) => {
    if (!formData) return
    
    setFormData(prev => prev ? {
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData || !validateForm()) {
      return
    }

    setSaving(true)

    try {
      const validImages = formData.images.filter(img => img.trim())
      
      const updatedHotel = {
        ...formData,
        images: validImages,
        updatedAt: new Date().toISOString()
      }

      // In production, make API call to update hotel
      const response = await fetch(`/api/admin/hotels/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
        },
        body: JSON.stringify(updatedHotel)
      })

      if (!response.ok) {
        throw new Error('Failed to update hotel')
      }

      // Update local state
      setHotel(updatedHotel)
      
      // Show success message or redirect
      router.push(`/admin/hotels/${params.id}?updated=true`)
    } catch (error) {
      console.error('Error updating hotel:', error)
      setErrors({ submit: 'Failed to update hotel. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (!hotel || !formData) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hotel Not Found</h3>
          <p className="text-gray-600 mb-4">The hotel with ID "{params.id}" could not be found.</p>
          <Link 
            href="/admin/hotels"
            className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            ← Back to Hotels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/hotels"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Hotels
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
            <p className="text-gray-600">Update hotel information and settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/hotels/${params.id}/view`}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            👁️ View Hotel
          </Link>
        </div>
      </div>

      {/* Hotel Info Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-dark rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{hotel.name}</h2>
            <p className="opacity-90">{hotel.city} • {'★'.repeat(hotel.stars)} • {hotel.type}</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Created</div>
            <div>{formatDateTime(hotel.createdAt)}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter hotel name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₦) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.basePriceNGN}
                    onChange={(e) => handleInputChange('basePriceNGN', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.basePriceNGN ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="150000"
                  />
                  {errors.basePriceNGN && <p className="text-red-600 text-sm mt-1">{errors.basePriceNGN}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Star Rating
                  </label>
                  <select
                    value={formData.stars}
                    onChange={(e) => handleInputChange('stars', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                  >
                    {[1, 2, 3, 4, 5].map(star => (
                      <option key={star} value={star}>
                        {star} Star {'★'.repeat(star)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as 'Hotel' | 'Apartment')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as Hotel['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the hotel's features and location"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+234 1 234 5678"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="reservations@hotel.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) => handleInputChange('totalRooms', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.totalRooms ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="100"
                  />
                  {errors.totalRooms && <p className="text-red-600 text-sm mt-1">{errors.totalRooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Rooms *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.availableRooms}
                    onChange={(e) => handleInputChange('availableRooms', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.availableRooms ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="85"
                  />
                  {errors.availableRooms && <p className="text-red-600 text-sm mt-1">{errors.availableRooms}</p>}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900">Room Availability</div>
                  <div className="text-blue-700 mt-1">
                    {formData.availableRooms} of {formData.totalRooms} rooms available 
                    ({Math.round((formData.availableRooms / formData.totalRooms) * 100)}% occupancy)
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Images</h2>
              
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateImageField(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addImageField}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                ➕ Add Image URL
              </button>
              
              {errors.images && <p className="text-red-600 text-sm mt-2">{errors.images}</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                Selected: {formData.amenities.length} amenities
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Hotel</span>
                </label>
                <p className="text-xs text-gray-500">Featured hotels appear prominently on the homepage</p>
              </div>
            </div>

            {/* Hotel Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel Statistics</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotel ID:</span>
                  <span className="font-mono text-xs">{hotel.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDateTime(hotel.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{formatDateTime(hotel.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hotel.status === 'active' ? 'bg-green-100 text-green-800' :
                    hotel.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hotel.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
          
          <Link
            href={`/admin/hotels/${params.id}/view`}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Hotel
          </Link>
          
          <Link
            href="/admin/hotels"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}