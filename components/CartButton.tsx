'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function CartButton() {
  const { state, totals, removeFromCart, updateQuantity } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  if (totals.itemCount === 0) return null

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-brand-green transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4M9 21h6" />
        </svg>
        {/* Item Count Badge */}
        <span className="absolute -top-2 -right-2 bg-brand-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totals.itemCount}
        </span>
      </button>

      {/* Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Event Cart</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {state.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.provider}</div>
                    <div className="text-sm font-medium text-brand-green">
                      ₦{item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.serviceId)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Event Date Display */}
            {state.eventDate && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Event Date</div>
                <div className="text-sm text-blue-700">
                  {new Date(state.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* Package Discount */}
            {state.appliedPackage && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-700 font-medium text-sm">🎉 {state.appliedPackage.name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    -{state.appliedPackage.discountPercent}%
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">Save ₦{totals.savings.toLocaleString()}</div>
              </div>
            )}

            {/* Cart Totals */}
            <div className="mt-4 pt-3 border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₦{totals.subtotal.toLocaleString()}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Package Discount:</span>
                  <span>-₦{totals.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (7.5%):</span>
                <span>₦{totals.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-brand-green">₦{totals.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Link 
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary w-full text-center"
              >
                Review & Book Event
              </Link>
              <Link 
                href="/services"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost w-full text-center text-sm"
              >
                Add More Services
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}