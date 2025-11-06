'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HotelFormData {
  name: string
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Owerri' | ''
  basePriceNGN: string
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
  totalRooms: string
  availableRooms: string
}

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'] as const
const availableAmenities = [
  'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Conference Rooms', 
  'Parking', 'Business Center', 'Room Service', 'Laundry', 'Concierge',
  'Airport Shuttle', 'Pet Friendly', 'Air Conditioning', 'Mini Bar',
  'Safe', 'Balcony', 'Garden View', 'Ocean View', 'City View'
]

const initialFormData: HotelFormData = {
  name: '',
  city: '',
  basePriceNGN: '',
  stars: 3,
  type: 'Hotel',
  address: '',
  phone: '',
  email: '',
  description: '',
  amenities: [],
  images: [''],
  status: 'active',
  featured: false,
  totalRooms: '',
  availableRooms: ''
}

export default function CreateHotelPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<HotelFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.basePriceNGN || isNaN(Number(formData.basePriceNGN)) || Number(formData.basePriceNGN) <= 0) {
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

    if (!formData.totalRooms || isNaN(Number(formData.totalRooms)) || Number(formData.totalRooms) <= 0) {
      newErrors.totalRooms = 'Valid total rooms is required'
    }

    if (!formData.availableRooms || isNaN(Number(formData.availableRooms)) || Number(formData.availableRooms) < 0) {
      newErrors.availableRooms = 'Valid available rooms is required'
    }

    if (Number(formData.availableRooms) > Number(formData.totalRooms)) {
      newErrors.availableRooms = 'Available rooms cannot exceed total rooms'
    }

    const validImages = formData.images.filter(img => img.trim())
    if (validImages.length === 0) {
      newErrors.images = 'At least one image URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateHotelId = (name: string, city: string): string => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
    const cleanCity = city.toLowerCase().replace(/\s+/g, '-')
    return `${cleanName}-${cleanCity}`
  }

  const handleInputChange = (field: keyof HotelFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const hotelId = generateHotelId(formData.name, formData.city)
      const validImages = formData.images.filter(img => img.trim())
      
      const hotelData = {
        id: hotelId,
        name: formData.name.trim(),
        city: formData.city,
        basePriceNGN: Number(formData.basePriceNGN),
        stars: formData.stars,
        type: formData.type,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        amenities: formData.amenities,
        images: validImages,
        status: formData.status,
        featured: formData.featured,
        totalRooms: Number(formData.totalRooms),
        availableRooms: Number(formData.availableRooms),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // In production, make API call to create hotel
      const response = await fetch('/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'default-key'
        },
        body: JSON.stringify(hotelData)
      })

      if (!response.ok) {
        throw new Error('Failed to create hotel')
      }

      // Redirect to hotels list or hotel detail page
      router.push(`/admin/hotels/${hotelId}?created=true`)
    } catch (error) {
      console.error('Error creating hotel:', error)
      setErrors({ submit: 'Failed to create hotel. Please try again.' })
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Hotel</h1>
            <p className="text-gray-600">Add a new hotel to your platform</p>
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
                    Fallback Price (₦) * <span className="text-xs text-gray-500">(used if no room types defined)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.basePriceNGN}
                    onChange={(e) => handleInputChange('basePriceNGN', e.target.value)}
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
                        {star} Star{'★'.repeat(star)}
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
                    onChange={(e) => handleInputChange('status', e.target.value as HotelFormData['status'])}
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
                    onChange={(e) => handleInputChange('totalRooms', e.target.value)}
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
                    onChange={(e) => handleInputChange('availableRooms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-brand-green focus:border-brand-green ${
                      errors.availableRooms ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="85"
                  />
                  {errors.availableRooms && <p className="text-red-600 text-sm mt-1">{errors.availableRooms}</p>}
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

            {/* Preview */}
            {formData.name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
                
                <div className="text-sm space-y-2">
                  <div><strong>ID:</strong> {generateHotelId(formData.name, formData.city)}</div>
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>City:</strong> {formData.city}</div>
                  <div><strong>Price:</strong> ₦{Number(formData.basePriceNGN || 0).toLocaleString()}</div>
                  <div><strong>Stars:</strong> {'★'.repeat(formData.stars)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Hotel...' : 'Create Hotel'}
          </button>
          
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