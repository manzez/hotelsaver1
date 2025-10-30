'use client'

import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { NIGERIAN_DISHES } from '@/lib/nigerian-dishes'

export default function NigerianDishesShowcase() {
  // Get signature dishes for homepage
  const signatureDishes = NIGERIAN_DISHES.filter(dish => dish.isSignature).slice(0, 6)
  
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Authentic Nigerian Cuisine
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the rich flavors of Nigerian food - from Jollof Rice to Egusi Soup and traditional street food favorites
          </p>
        </div>

        {/* Featured Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {signatureDishes.map((dish) => (
            <Link 
              key={dish.id}
              href={`/food?search=${encodeURIComponent(dish.name.split(' ')[0])}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Dish Image */}
              <div className="relative h-48 overflow-hidden">
                <SafeImage
                  src={dish.image}
                  alt={dish.name}
                  mobileQuery={`${dish.name} Nigerian food`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackSrc="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=400&fit=crop&auto=format&q=60"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full font-medium">
                    ₦{dish.price.toLocaleString()}
                  </span>
                </div>
                {dish.isSignature && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      🌟 Signature
                    </span>
                  </div>
                )}
              </div>

              {/* Dish Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-green transition-colors">
                  {dish.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {dish.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                    {dish.category}
                  </span>
                  <span className="text-brand-green font-semibold">
                    Order Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All Dishes Grid - More Options */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            More Nigerian Favorites
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {NIGERIAN_DISHES.filter(dish => !dish.isSignature).map((dish) => (
              <Link
                key={dish.id}
                href={`/food?search=${encodeURIComponent(dish.name.split(' ')[0])}`}
                className="group text-center"
              >
                <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2">
                  <SafeImage
                    src={dish.image}
                    alt={dish.name}
                    mobileQuery={`${dish.name} Nigerian food`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    fallbackSrc="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&h=150&fit=crop&auto=format&q=60"
                  />
                </div>
                <h4 className="font-medium text-sm text-gray-900 group-hover:text-brand-green transition-colors line-clamp-2">
                  {dish.name}
                </h4>
                <p className="text-xs text-brand-green font-medium mt-1">
                  ₦{dish.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <Link 
            href="/food" 
            className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium text-lg"
          >
            Explore All Nigerian Restaurants
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}