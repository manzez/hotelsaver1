"use client";
import CategoryTabs from '@/components/CategoryTabs'
import { useState } from 'react'

// ... the rest of your food page code remains the same
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

export default function FoodPage() {
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCity = selectedCity === 'All Cities' || restaurant.city === selectedCity
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.dishes.some(dish => dish.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCity && matchesSearch
  })

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <CategoryTabs active="food" />
        <div className="text-sm text-gray-600">Best restaurants across Nigeria</div>
      </div>

      {/* Enhanced Header with Dropdown and Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Best Food & Restaurants</h1>
        <p className="text-gray-600 mb-6">Discover amazing local restaurants and food spots</p>
        
        {/* Dropdown and Search Box Container */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* City Dropdown */}
          <div className="w-full md:w-48">
            <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select City
            </label>
            <select 
              id="city-select"
              className="w-full input border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <label htmlFor="food-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Food
            </label>
            <div className="relative">
              <input
                id="food-search"
                type="text"
                placeholder="Type your food..."
                className="w-full input border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map(restaurant => (
          <div key={restaurant.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img 
              src={restaurant.image} 
              alt={restaurant.name}
              className="h-48 w-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = '/images/placeholder-food.jpg'
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.type} • {restaurant.city}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">{restaurant.priceRange}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  {restaurant.dishes.slice(0, 2).join(', ')}
                  {restaurant.dishes.length > 2 && '...'}
                </p>
              </div>

              <div className="flex gap-2">
                <button className="btn-ghost flex-1 text-sm">View Menu</button>
                <button className="btn-primary flex-1 text-sm">Order Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600">No restaurants found</h3>
          <p className="text-gray-500 mt-2">Try a different city or search term</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold">Want to list your restaurant?</h2>
        <p className="text-gray-600 mt-2">Join thousands of restaurants reaching new customers</p>
        <button className="btn-primary mt-4">Add Your Restaurant</button>
      </div>
    </div>
  )
}