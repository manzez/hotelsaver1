"use client";
import CategoryTabs from '@/components/CategoryTabs'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri', 'All Cities']



const restaurants = [
  {
    id: 1,
    name: "Nigerian Delights",
    type: "Traditional",
    city: "Lagos",
    rating: 4.5,
    image: "/images/food/ogbono-egusi.jpg",
    dishes: ["Pounded Yam & Egusi", "Jollof Rice", "Pepper Soup"],
    priceRange: "₦₦"
  },
  {
    id: 2,
    name: "Jollof Masters", 
    type: "African",
    city: "Abuja",
    rating: 4.8,
    image: "/images/food/jollof-rice.jpg",
    dishes: ["Party Jollof", "Fried Chicken", "Plantain"],
    priceRange: "₦₦"
  },
  {
    id: 3,
    name: "Pizza Palace",
    type: "Italian",
    city: "Port Harcourt", 
    rating: 4.3,
    image: "/images/food/fresh-pizza.jpg",
    dishes: ["Pepperoni Pizza", "Pasta", "Garlic Bread"],
    priceRange: "₦₦₦"
  },
  {
    id: 4,
    name: "Ice Cream Dream",
    type: "Desserts",
    city: "Lagos",
    rating: 4.7,
    image: "/images/food/ice-cream.jpg",
    dishes: ["Bubblegum Ice Cream", "Strawberry Sundae", "Chocolate Cone"],
    priceRange: "₦"
  },
  {
    id: 5,
    name: "Suya Spot",
    type: "Grill",
    city: "Abuja",
    rating: 4.6,
    image: "/images/food/suya.jpg",
    dishes: ["Beef Suya", "Chicken Suya", "Kilishi"],
    priceRange: "₦₦"
  },
  {
    id: 6,
    name: "Seafood Haven",
    type: "Seafood", 
    city: "Port Harcourt",
    rating: 4.4,
    image: "/images/food/grilled-fish.jpg",
    dishes: ["Grilled Fish", "Pepper Soup", "Prawns"],
    priceRange: "₦₦₦"
  }
]

function FoodInner() {
  const sp = useSearchParams()
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const urlCity = sp.get('city')
    if (urlCity && cities.includes(urlCity)) {
      setSelectedCity(urlCity)
    }
  }, [sp])

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCity = selectedCity === 'All Cities' || restaurant.city === selectedCity
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.dishes.some(dish => dish.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCity && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <CategoryTabs active="food" />
          <div className="text-sm text-gray-600">Best restaurants across Nigeria</div>
        </div>

        

        {/* Enhanced Header with Dropdown and Search */}
  <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Best Food & Restaurants</h1>
          <p className="text-gray-600 mb-6">Discover amazing local restaurants and food spots</p>
          
          {/* Dropdown and Search Box Container */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            {/* City Dropdown */}
            <div className="w-full md:w-56">
              <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select City
              </label>
              <select 
                id="city-select"
                className="w-full h-11 border border-gray-300 rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent appearance-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="flex-1 w-full">
              <label htmlFor="food-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Food or Restaurant
              </label>
              <div className="relative">
                <input
                  id="food-search"
                  type="text"
                  placeholder="Search for dishes, restaurants..."
                  className="w-full h-11 border border-gray-300 rounded-md px-4 pl-10 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-gray-900 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRestaurants.map(restaurant => (
            <div key={restaurant.id} className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                  }}
                />
                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{restaurant.type} • {restaurant.city}</p>
                    <span className="text-sm font-medium text-brand-green">{restaurant.priceRange}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {restaurant.dishes.slice(0, 2).join(', ')}
                    {restaurant.dishes.length > 2 && ` +${restaurant.dishes.length - 2} more`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="btn-ghost flex-1 text-sm h-9">View Menu</button>
                  <button className="btn-primary flex-1 text-sm h-9">Order Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or exploring different cities</p>
              <button 
                onClick={() => {
                  setSelectedCity('All Cities')
                  setSearchQuery('')
                }}
                className="btn-ghost mt-4"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-brand-green rounded-xl p-8 text-center text-white mt-12">
          <h2 className="text-2xl font-bold mb-2">Want to list your restaurant?</h2>
          <p className="text-green-100 mb-6 max-w-md mx-auto">
            Join thousands of restaurants reaching new customers across Nigeria
          </p>
          <button className="bg-white text-brand-green px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
            Add Your Restaurant
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FoodPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading…</div>}>
      <FoodInner />
    </Suspense>
  )
}