
'use client'
import { useState, useEffect } from 'react'
import { SERVICES } from '@/lib/data'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { SERVICE_CATEGORIES, mapLegacyCategory } from '@/lib/service-categories'
import BackButton from '@/components/BackButton'
import { checkServiceAvailability, formatAvailabilityMessage } from '@/lib/availability'
import { useCart } from '@/lib/cart-context'
import LocationSelector from '@/components/LocationSelector'
import { type Location, type ServiceProvider, type LocationPricing } from '@/lib/location-pricing'
import ServiceReviews from '@/components/ServiceReviews'
import WriteReviewForm from '@/components/WriteReviewForm'
import { getServiceReviews, type ServiceReview } from '@/lib/reviews'

export default function ServiceDetail({params}:{params:{id:string}}){
  const s = SERVICES.find(x=>x.id===params.id)
  const { addToCart, isInCart, getCartItem, state } = useCart()
  const [people,setPeople]=useState(1)
  const [variant,setVariant]=useState(0)
  const [done,setDone]=useState(false)
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [showAddToCart, setShowAddToCart] = useState(false)
  const [eventLocation, setEventLocation] = useState<Location | null>(null)
  const [availableProviders, setAvailableProviders] = useState<Array<ServiceProvider & { pricing: LocationPricing }>>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [availability, setAvailability] = useState<{
    available: boolean
    maxAvailable: number
    message: string
    loading: boolean
  }>({ available: true, maxAvailable: 999, message: '', loading: false })
  
  // Review system state
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [reviews, setReviews] = useState<ServiceReview[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)

  if(!s) return <div className="py-10">Not found</div>

  // Get category information for enhanced display
  const categoryMapping = mapLegacyCategory(s.category)
  const categoryInfo = categoryMapping ? 
    SERVICE_CATEGORIES.find(cat => cat.id === categoryMapping.categoryId) : null
  const subcategoryInfo = categoryMapping && categoryInfo ?
    categoryInfo.subcategories.find(sub => sub.id === categoryMapping.subcategoryId) : null

  // Check if this is a hire service that needs special handling
  const isHireService = categoryInfo?.id === 'hire' || 
    ['Canopy Hire', 'Chair Hire', 'MC Services', 'Cooler Hire', 'Sound Equipment'].includes(s.category)
  
  // Check if this is an entertainment service
  const isEntertainmentService = categoryInfo?.id === 'entertainment' ||
    ['DJ Services', 'Live Band', 'Photography'].includes(s.category)

  // Check availability when date changes for hire services
  useEffect(() => {
    if (isHireService && eventDate) {
      checkAvailability()
    }
  }, [eventDate, people, isHireService])

  // Load reviews on component mount
  useEffect(() => {
    if (s && !reviewsLoaded) {
      const serviceReviews = getServiceReviews(s.id)
      setReviews(serviceReviews)
      setReviewsLoaded(true)
    }
  }, [s, reviewsLoaded])

  async function checkAvailability() {
    if (!eventDate || !isHireService) return
    
    setAvailability(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch(
        `/api/services/availability?serviceId=${s.id}&date=${eventDate}&quantity=${people}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setAvailability({
          available: data.available,
          maxAvailable: data.maxAvailable,
          message: data.message,
          loading: false
        })
      }
    } catch (error) {
      console.error('Availability check failed:', error)
      setAvailability({
        available: true,
        maxAvailable: 999,
        message: 'Could not check availability',
        loading: false
      })
    }
  }

  // Handle location selection
  const handleLocationChange = (location: Location | null, providers: Array<ServiceProvider & { pricing: LocationPricing }>) => {
    setEventLocation(location)
    setAvailableProviders(providers)
    if (providers.length > 0) {
      setSelectedProvider(providers[0].id) // Auto-select best provider
    }
  }

  // Get current pricing based on selected provider
  const getCurrentPricing = () => {
    if (!selectedProvider || availableProviders.length === 0) {
      return {
        basePrice: s.prices[variant]?.amountNGN || 0,
        travelCost: 0,
        totalPrice: s.prices[variant]?.amountNGN || 0
      }
    }
    
    const provider = availableProviders.find(p => p.id === selectedProvider)
    return provider?.pricing || {
      basePrice: s.prices[variant]?.amountNGN || 0,
      travelCost: 0,
      totalPrice: s.prices[variant]?.amountNGN || 0
    }
  }

  // Add to cart function
  function handleAddToCart() {
    if (!eventDate) {
      alert('Please select an event date first')
      return
    }
    
    const pricing = getCurrentPricing()
    
    addToCart({
      serviceId: s.id,
      title: s.title,
      category: s.category,
      provider: s.provider,
      city: s.city,
      quantity: people,
      unitPrice: pricing.totalPrice,
      eventDate,
      eventTime,
      isHireService,
      duration: s.prices[variant]?.duration,
      image: s.images[0]
    })
    
    setShowAddToCart(true)
    setTimeout(() => setShowAddToCart(false), 3000)
  }

  // Handle review submission
  const handleReviewSubmit = (reviewData: Partial<ServiceReview>) => {
    // In production, this would submit to API
    const newReview: ServiceReview = {
      id: `review_${Date.now()}`,
      serviceId: s.id,
      serviceName: s.title,
      customerId: `customer_${Date.now()}`,
      customerName: reviewData.customerName || '',
      customerEmail: reviewData.customerEmail || '',
      rating: reviewData.rating || 5,
      title: reviewData.title || '',
      content: reviewData.content || '',
      reviewDate: new Date().toISOString().split('T')[0],
      eventDate: reviewData.eventDate || '',
      verified: false,
      helpful: 0,
      photos: reviewData.photos || [],
      ratings: reviewData.ratings || {
        quality: 0,
        punctuality: 0, 
        communication: 0,
        value: 0,
        professionalism: 0
      },
      status: 'pending'
    }
    
    setReviews([newReview, ...reviews])
    setShowWriteReview(false)
    
    // Show success message
    alert('Thank you! Your review has been submitted for moderation.')
  }

  async function reserve(){
    const bookingData = {
      serviceId: s.id,
      people,
      variant,
      date: eventDate,
      time: eventTime,
      contact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone
      },
      serviceType: s.category,
      isHireService,
      totalAmount: s.prices[variant]?.amountNGN || 0
    }
    
    const res = await fetch('/api/services/book', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(bookingData)
    })
    
    if(res.ok) setDone(true)
  }

  if(done) return (
    <div className="py-10">
      <div className="card p-6 max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-semibold text-brand-green">Booking Confirmed!</h2>
        <p className="mt-2 text-gray-600">
          {isHireService ? 'Your equipment rental has been reserved' : 'Your service has been booked'} for {eventDate}.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          We've sent confirmation details to {contactEmail} and notified the provider.
        </p>
        <div className="mt-4 space-y-2">
          <Link href="/services" className="btn btn-primary w-full">
            Book More Services
          </Link>
          <Link href="/" className="btn btn-ghost w-full text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="py-8">
      <BackButton />
      
      {/* Header with Category Context */}
      <div className="mt-4">
        {categoryInfo && (
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${categoryInfo.color}`}>
              {categoryInfo.icon} {categoryInfo.name}
              {subcategoryInfo && (
                <span className="ml-2 opacity-75">• {subcategoryInfo.name}</span>
              )}
            </span>
          </div>
        )}
        
        <h1 className="text-3xl font-bold">{s.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="text-sm">
            <span className="text-amber-400">{"★".repeat(Math.round(s.rating||5))}</span>
            <span className="text-gray-300">{"☆".repeat(5-Math.round(s.rating||5))}</span>
            <span className="text-gray-500 ml-1">({s.reviews} reviews)</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{s.city}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-brand-green font-semibold">{s.provider}</span>
        </div>
      </div>
      {/* Images and Details */}
      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* Images */}
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-3">
            {s.images.slice(0,4).map((src: string, i: number) => {
              const fallbackImages = [
                'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&auto=format&q=80'
              ];
              
              return (
                <SafeImage 
                  key={i} 
                  src={src} 
                  alt={`${s.title}-${i}`} 
                  className="h-48 w-full object-cover rounded-lg" 
                  fallbackSrc={fallbackImages[i] || fallbackImages[0]}
                  loading="lazy"
                />
              )
            })}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Service Details</h3>
            <p className="text-gray-700 leading-relaxed">{s.summary}</p>
            
            {/* Service-specific information */}
            {isHireService && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900">Equipment Rental Information</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Setup and breakdown included in service</li>
                  <li>• Clean, well-maintained equipment guaranteed</li>
                  <li>• Professional delivery and pickup available</li>
                  <li>• {s.cancellation}</li>
                </ul>
              </div>
            )}
            
            {isEntertainmentService && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900">Entertainment Service Information</h4>
                <ul className="text-sm text-purple-800 mt-2 space-y-1">
                  <li>• Professional equipment and setup included</li>
                  <li>• Customizable playlist and performance style</li>
                  <li>• Backup equipment available for all bookings</li>
                  <li>• {s.cancellation}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <h3 className="text-lg font-semibold mb-4">Book This Service</h3>
            
            <div className="space-y-4">
              {/* Service Package Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {isHireService ? 'Equipment Package' : 'Service Package'}
                </label>
                <select 
                  className="select mt-1" 
                  value={variant} 
                  onChange={e=>setVariant(parseInt(e.target.value||'0'))}
                >
                  {s.prices.map((p:any,i:number)=>(
                    <option key={i} value={i}>
                      {p.name} — ₦{p.amountNGN.toLocaleString()} • {p.duration}
                    </option>
                  ))}
                </select>
              </div>

              {/* People/Quantity */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {isHireService ? 'Event Size (people)' : 'Number of people'}
                </label>
                <input 
                  type="number" 
                  min={1} 
                  value={people} 
                  onChange={e=>setPeople(parseInt(e.target.value||'1'))} 
                  className="input mt-1"
                  placeholder="Expected number of guests/participants"
                />
              </div>

              {/* Event Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Event Date</label>
                  <input 
                    type="date" 
                    value={eventDate}
                    onChange={e=>setEventDate(e.target.value)}
                    className="input mt-1"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Event Time</label>
                  <input 
                    type="time" 
                    value={eventTime}
                    onChange={e=>setEventTime(e.target.value)}
                    className="input mt-1"
                  />
                </div>
              </div>

              {/* Location Selector */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Location & Pricing</h4>
                <LocationSelector 
                  onLocationChange={handleLocationChange}
                  serviceType={s.category}
                  currentCity={s.city}
                />
              </div>

              {/* Provider Selection */}
              {availableProviders.length > 1 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Select Service Provider
                  </label>
                  <div className="space-y-2">
                    {availableProviders.map(provider => (
                      <label key={provider.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="provider"
                          value={provider.id}
                          checked={selectedProvider === provider.id}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="text-brand-green"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-600">
                            {provider.pricing.withinRadius ? 'Free delivery' : 
                             `₦${provider.pricing.travelCost.toLocaleString()} travel charge`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-brand-green">
                            ₦{provider.pricing.totalPrice.toLocaleString()}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status for Hire Services */}
              {isHireService && eventDate && (
                <div className="p-3 rounded-lg border">
                  {availability.loading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-green rounded-full animate-spin"></div>
                      Checking availability...
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 ${
                      availability.available 
                        ? availability.maxAvailable > 10 ? 'text-green-700 bg-green-50 border-green-200' 
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      <span className="font-medium">
                        {availability.available ? '✅' : '❌'} {availability.message}
                      </span>
                      {availability.available && availability.maxAvailable <= 10 && (
                        <span className="text-xs bg-amber-100 px-2 py-1 rounded">
                          High demand!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={contactName}
                    onChange={e=>setContactName(e.target.value)}
                    className="input"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={contactEmail}
                    onChange={e=>setContactEmail(e.target.value)}
                    className="input"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={contactPhone}
                    onChange={e=>setContactPhone(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing Breakdown</h4>
                
                {(() => {
                  const pricing = getCurrentPricing()
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Service Price:</span>
                        <span>₦{pricing.basePrice.toLocaleString()}</span>
                      </div>
                      
                      {pricing.travelCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Travel/Delivery Charge:</span>
                          <span>₦{pricing.travelCost.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {pricing.travelCost === 0 && eventLocation && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Travel/Delivery:</span>
                          <span>Free ✓</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total Amount:</span>
                        <span className="text-xl font-bold text-brand-green">
                          ₦{pricing.totalPrice.toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {s.prices[variant]?.duration || 'Duration varies'}
                        {eventLocation && ' • Location-based pricing applied'}
                      </p>
                    </div>
                  )
                })()}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={
                    !eventDate || 
                    (isHireService && !availability.available) ||
                    availability.loading
                  }
                  className="btn-ghost w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4M9 21h6" />
                  </svg>
                  {isInCart(s.id) ? `In Cart (${getCartItem(s.id)?.quantity || 0})` : 'Add to Event Cart'}
                </button>

                {/* Quick Book Button */}
                <button 
                  onClick={reserve}
                  disabled={
                    !eventDate || 
                    !contactName || 
                    !contactEmail || 
                    (isHireService && !availability.available) ||
                    availability.loading
                  }
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {availability.loading ? 'Checking availability...' :
                   isHireService && !availability.available ? 'Not Available' :
                   isHireService ? 'Reserve Now' : 'Book Immediately'}
                </button>

                {/* Cart Success Message */}
                {showAddToCart && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-green-800 font-medium">✅ Added to cart!</div>
                    <Link href="/cart" className="text-sm text-green-600 underline">
                      View cart & book multiple services
                    </Link>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                {s.cancellation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <button
            onClick={() => setShowWriteReview(true)}
            className="btn btn-primary"
          >
            Write a Review
          </button>
        </div>
        
        <ServiceReviews
          serviceId={s.id}
          serviceName={s.title}
          reviews={reviews}
        />
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <WriteReviewForm
          serviceId={s.id}
          serviceName={s.title}
          onClose={() => setShowWriteReview(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
