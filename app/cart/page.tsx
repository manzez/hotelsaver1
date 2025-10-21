'use client'
import { useState } from 'react'
import { useCart, SERVICE_PACKAGES } from '@/lib/cart-context'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import SafeImage from '@/components/SafeImage'

export default function CartPage() {
  const { 
    state, 
    totals, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    dispatch 
  } = useCart()
  
  const [bookingStep, setBookingStep] = useState(1) // 1: Review, 2: Contact, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  // If cart is empty, show empty state
  if (totals.itemCount === 0 && !bookingComplete) {
    return (
      <div className="py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Event Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Add services to your cart to book multiple items together and save with package discounts.
          </p>
          <Link href="/services" className="btn btn-primary">
            Browse Services
          </Link>
        </div>
      </div>
    )
  }

  // Handle package selection
  const handleApplyPackage = (pkg: typeof SERVICE_PACKAGES[0]) => {
    if (pkg.eligible) {
      dispatch({ type: 'APPLY_PACKAGE', package: pkg })
    }
  }

  // Handle booking submission
  const handleCompleteBooking = async () => {
    setIsSubmitting(true)
    
    try {
      const bookingData = {
        items: state.items,
        eventDate: state.eventDate,
        eventLocation: state.eventLocation,
        contact: state.contactInfo,
        appliedPackage: state.appliedPackage,
        totals
      }
      
      const response = await fetch('/api/cart/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      if (response.ok) {
        setBookingComplete(true)
        clearCart()
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  // Booking confirmation view
  if (bookingComplete) {
    return (
      <div className="py-12">
        <div className="card p-8 max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-brand-green mb-4">Event Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your multi-service booking has been confirmed. We've sent details to your email and 
            notified all service providers.
          </p>
          <div className="space-y-3">
            <Link href="/services" className="btn btn-primary w-full">
              Book Another Event
            </Link>
            <Link href="/" className="btn btn-ghost w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <BackButton />
      
      <div className="mt-4">
        <h1 className="text-3xl font-bold">Event Cart & Checkout</h1>
        <p className="text-gray-600 mt-1">
          Review your services, apply package discounts, and complete your booking
        </p>
      </div>

      {/* Booking Steps */}
      <div className="flex items-center justify-center mt-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            bookingStep >= 1 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-sm font-medium">Review Services</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            bookingStep >= 2 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-sm font-medium">Event Details</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            bookingStep >= 3 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Cart Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Service Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Services ({totals.itemCount} items)</h2>
            
            <div className="space-y-4">
              {state.items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Service Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <SafeImage 
                      src={item.image || ''} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format&q=80"
                    />
                  </div>
                  
                  {/* Service Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.provider} • {item.city}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    {item.duration && (
                      <p className="text-xs text-gray-500">{item.duration}</p>
                    )}
                    <div className="mt-2">
                      <span className="text-lg font-bold text-brand-green">
                        ₦{item.totalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        (₦{item.unitPrice.toLocaleString()} each)
                      </span>
                    </div>
                  </div>
                  
                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.serviceId)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Event Details Form */}
          {bookingStep >= 2 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Event Date</label>
                    <input
                      type="date"
                      value={state.eventDate}
                      onChange={e => dispatch({ type: 'UPDATE_EVENT_DATE', date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Event Location</label>
                    <input
                      type="text"
                      placeholder="Event venue address"
                      value={state.eventLocation}
                      onChange={e => dispatch({ type: 'UPDATE_EVENT_LOCATION', location: e.target.value })}
                      className="input mt-1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Your Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={state.contactInfo.name}
                      onChange={e => dispatch({ type: 'UPDATE_CONTACT', field: 'name', value: e.target.value })}
                      className="input mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={state.contactInfo.email}
                      onChange={e => dispatch({ type: 'UPDATE_CONTACT', field: 'email', value: e.target.value })}
                      className="input mt-1"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+234 xxx xxx xxxx"
                      value={state.contactInfo.phone}
                      onChange={e => dispatch({ type: 'UPDATE_CONTACT', field: 'phone', value: e.target.value })}
                      className="input mt-1"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Special Requirements</label>
                  <textarea
                    placeholder="Any special requests or notes for your event..."
                    value={state.contactInfo.notes}
                    onChange={e => dispatch({ type: 'UPDATE_CONTACT', field: 'notes', value: e.target.value })}
                    rows={3}
                    className="input mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Package Discounts & Summary */}
        <div className="space-y-6">
          
          {/* Available Packages */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Package Discounts</h3>
            
            <div className="space-y-3">
              {state.packages.map(pkg => (
                <div 
                  key={pkg.id}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    pkg.eligible 
                      ? state.appliedPackage?.id === pkg.id
                        ? 'border-brand-green bg-brand-green/5'
                        : 'border-gray-200 hover:border-brand-green'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => pkg.eligible && handleApplyPackage(pkg)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{pkg.name}</div>
                      <div className="text-xs text-gray-600">{pkg.description}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${pkg.eligible ? 'text-green-600' : 'text-gray-400'}`}>
                        -{pkg.discountPercent}%
                      </div>
                      {pkg.eligible ? (
                        <div className="text-xs text-green-600">✅ Eligible</div>
                      ) : (
                        <div className="text-xs text-gray-400">Add required services</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({totals.itemCount} items):</span>
                <span>₦{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Package Discount:</span>
                  <span>-₦{totals.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (7.5%):</span>
                <span>₦{totals.tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-brand-green">₦{totals.total.toLocaleString()}</span>
              </div>
              {totals.savings > 0 && (
                <div className="text-center text-sm text-green-600 mt-2">
                  You save ₦{totals.savings.toLocaleString()} with package discount! 🎉
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {bookingStep === 1 && (
                <button 
                  onClick={() => setBookingStep(2)}
                  className="btn btn-primary w-full"
                >
                  Continue to Event Details
                </button>
              )}
              
              {bookingStep === 2 && (
                <button 
                  onClick={() => setBookingStep(3)}
                  disabled={!state.eventDate || !state.contactInfo.name || !state.contactInfo.email}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  Review & Confirm
                </button>
              )}
              
              {bookingStep === 3 && (
                <button 
                  onClick={handleCompleteBooking}
                  disabled={isSubmitting}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Booking'}
                </button>
              )}
              
              <button 
                onClick={clearCart}
                className="btn btn-ghost w-full text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}