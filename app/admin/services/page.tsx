'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SERVICE_CATEGORIES, getAllSubcategories } from '@/lib/service-categories'

type Service = {
  id: string
  title: string
  city: string
  category: string
  provider: string
  rating: number
  reviews: number
  summary: string
  prices: Array<{
    name: string
    amountNGN: number
    duration: string
  }>
  images: string[]
  cancellation: string
}

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri']

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    city: 'Lagos',
    category: '',
    provider: '',
    summary: '',
    cancellation: 'Free cancellation up to 24h before.',
    images: [''],
    prices: [{ name: 'Standard', amountNGN: 50000, duration: '2h' }]
  })

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      setLoading(true)
      // Since we don't have a services API endpoint yet, we'll simulate it
      // In real implementation, this would fetch from /api/admin/services
      const response = await fetch('/api/services/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: '', query: '' })
      })
      const data = await response.json()
      setServices(data.results || [])
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCreateService() {
    setShowCreateForm(true)
    setEditingService(null)
    setFormData({
      title: '',
      city: 'Lagos',
      category: '',
      provider: '',
      summary: '',
      cancellation: 'Free cancellation up to 24h before.',
      images: [''],
      prices: [{ name: 'Standard', amountNGN: 50000, duration: '2h' }]
    })
  }

  function handleEditService(service: Service) {
    setEditingService(service)
    setShowCreateForm(true)
    setFormData({
      title: service.title,
      city: service.city,
      category: service.category,
      provider: service.provider,
      summary: service.summary,
      cancellation: service.cancellation,
      images: service.images,
      prices: service.prices
    })
  }

  function addPriceOption() {
    setFormData({
      ...formData,
      prices: [...formData.prices, { name: 'Premium', amountNGN: 80000, duration: '3h' }]
    })
  }

  function removePriceOption(index: number) {
    if (formData.prices.length > 1) {
      setFormData({
        ...formData,
        prices: formData.prices.filter((_, i) => i !== index)
      })
    }
  }

  function addImageUrl() {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    })
  }

  function removeImageUrl(index: number) {
    if (formData.images.length > 1) {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index)
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate form
    if (!formData.title || !formData.category || !formData.provider || !formData.summary) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const serviceData = {
        ...formData,
        id: editingService?.id || `svc-${formData.city.toLowerCase()}-${Date.now()}`,
        rating: editingService?.rating || 5.0,
        reviews: editingService?.reviews || 0,
        images: formData.images.filter(img => img.trim())
      }

      // In real implementation, this would be POST/PUT to /api/admin/services
      console.log('Service data:', serviceData)
      
      alert(editingService ? 'Service updated successfully!' : 'Service created successfully!')
      setShowCreateForm(false)
      loadServices()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error saving service. Please try again.')
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = !selectedCity || service.city === selectedCity
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    
    return matchesSearch && matchesCity && matchesCategory
  })

  const allCategories = Array.from(new Set(services.map(s => s.category)))

  if (showCreateForm) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setShowCreateForm(false)}
            className="btn btn-ghost"
          >
            ← Back to Services
          </button>
          <h1 className="text-2xl font-bold">
            {editingService ? 'Edit Service' : 'Create New Service'}
          </h1>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="input"
                  placeholder="e.g. Professional Hair Styling Services"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                  className="input"
                  placeholder="e.g. Beauty Pro Lagos"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="select"
                  required
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="select"
                  required
                >
                  <option value="">Select Category</option>
                  {getAllSubcategories().map(sub => (
                    <option key={sub.id} value={sub.name}>
                      {sub.icon} {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Description *
              </label>
              <textarea
                value={formData.summary}
                onChange={e => setFormData({...formData, summary: e.target.value})}
                className="input min-h-20"
                placeholder="Describe your service, what's included, and key benefits..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cancellation Policy
              </label>
              <input
                type="text"
                value={formData.cancellation}
                onChange={e => setFormData({...formData, cancellation: e.target.value})}
                className="input"
                placeholder="e.g. Free cancellation up to 24h before."
              />
            </div>

            {/* Pricing Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Pricing Options *
                </label>
                <button
                  type="button"
                  onClick={addPriceOption}
                  className="btn btn-ghost text-sm"
                >
                  + Add Option
                </button>
              </div>

              <div className="space-y-3">
                {formData.prices.map((price, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <input
                        type="text"
                        value={price.name}
                        onChange={e => {
                          const newPrices = [...formData.prices]
                          newPrices[index].name = e.target.value
                          setFormData({...formData, prices: newPrices})
                        }}
                        className="input text-sm"
                        placeholder="Package name"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={price.amountNGN}
                        onChange={e => {
                          const newPrices = [...formData.prices]
                          newPrices[index].amountNGN = parseInt(e.target.value) || 0
                          setFormData({...formData, prices: newPrices})
                        }}
                        className="input text-sm"
                        placeholder="Price in Naira"
                        min="1000"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={price.duration}
                        onChange={e => {
                          const newPrices = [...formData.prices]
                          newPrices[index].duration = e.target.value
                          setFormData({...formData, prices: newPrices})
                        }}
                        className="input text-sm"
                        placeholder="Duration"
                      />
                      {formData.prices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePriceOption(index)}
                          className="btn btn-ghost text-red-600 text-sm px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Service Images
                </label>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="btn btn-ghost text-sm"
                >
                  + Add Image
                </button>
              </div>

              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={e => {
                        const newImages = [...formData.images]
                        newImages[index] = e.target.value
                        setFormData({...formData, images: newImages})
                      }}
                      className="input flex-1 text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="btn btn-ghost text-red-600 text-sm px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary">
                {editingService ? 'Update Service' : 'Create Service'}
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Management</h1>
          <p className="text-gray-600">Manage service listings and providers</p>
        </div>
        <button 
          onClick={handleCreateService}
          className="btn-primary"
        >
          + Create Service
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input"
          />
          
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="select"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="select"
          >
            <option value="">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading services...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Service</th>
                  <th className="text-left p-4 font-semibold">Provider</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">City</th>
                  <th className="text-left p-4 font-semibold">Price Range</th>
                  <th className="text-left p-4 font-semibold">Rating</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(service => (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold">{service.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {service.summary}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{service.provider}</span>
                    </td>
                    <td className="p-4">
                      <span className="badge">{service.category}</span>
                    </td>
                    <td className="p-4">{service.city}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        ₦{Math.min(...service.prices.map(p => p.amountNGN)).toLocaleString()} - 
                        ₦{Math.max(...service.prices.map(p => p.amountNGN)).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-sm">{service.rating}</span>
                        <span className="text-xs text-gray-500">({service.reviews})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="btn btn-ghost text-sm"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/services/${service.id}`}
                          className="btn btn-ghost text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredServices.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No services found matching your criteria
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-brand-green">{services.length}</div>
          <div className="text-sm text-gray-600">Total Services</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{cities.length}</div>
          <div className="text-sm text-gray-600">Cities Covered</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{allCategories.length}</div>
          <div className="text-sm text-gray-600">Service Categories</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Array.from(new Set(services.map(s => s.provider))).length}
          </div>
          <div className="text-sm text-gray-600">Service Providers</div>
        </div>
      </div>
    </div>
  )
}