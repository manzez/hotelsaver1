"use client";
import CategoryTabs from '@/components/CategoryTabs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FOOD_DATA from '@/lib.food.json'

type MenuItem = { name: string; priceNGN: number; category: string; image?: string }
type Restaurant = {
  id: string
  name: string
  city: string
  rating: number
  image: string
  priceRange: string
  menu: MenuItem[]
  discountPct?: number
}

const cities = ['Owerri', 'Lagos', 'Abuja', 'Port Harcourt', 'All Cities']

const DEFAULT_DISCOUNT = 10 // percent
function naira(n: number) { return `₦${Math.round(n).toLocaleString()}` }

function FoodInner() {
  const sp = useSearchParams()
  const [selectedCity, setSelectedCity] = useState('Owerri')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
  const [orderOpenFor, setOrderOpenFor] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [contact, setContact] = useState({ name: '', phone: '', address: '' })
  const [schedule, setSchedule] = useState<{ date: string; time: string }>({ date: '', time: '' })
  const [orderError, setOrderError] = useState<string>('')

  useEffect(() => {
    const urlCity = sp.get('city')
    if (urlCity && cities.includes(urlCity)) {
      setSelectedCity(urlCity)
    }
  }, [sp])

  const restaurants: Restaurant[] = FOOD_DATA as any

  const filteredRestaurants = restaurants.filter(r => {
    const matchesCity = selectedCity === 'All Cities' || r.city === selectedCity
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.menu.some(mi => mi.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCity && matchesSearch
  })

  const currentRestaurant = useMemo(() => restaurants.find(r => r.id === (menuOpenFor || orderOpenFor)), [menuOpenFor, orderOpenFor, restaurants])

  function restaurantDiscountPct(r?: Restaurant | null) { return r?.discountPct ?? DEFAULT_DISCOUNT }
  function discounted(price: number) { return Math.max(0, Math.round(price * (1 - (restaurantDiscountPct(currentRestaurant) / 100)))) }
  function inc(key: string) { setQuantities(q => ({ ...q, [key]: (q[key] || 0) + 1 })) }
  function dec(key: string) { setQuantities(q => ({ ...q, [key]: Math.max(0, (q[key] || 0) - 1) })) }
  function resetOrder() { setQuantities({}); setContact({ name: '', phone: '', address: '' }) }
  const orderItems = useMemo(() => {
    if (!currentRestaurant) return [] as Array<{ item: MenuItem; qty: number }>
    return currentRestaurant.menu
      .map(item => ({ item, qty: quantities[item.name] || 0 }))
      .filter(x => x.qty > 0)
  }, [currentRestaurant, quantities])
  const subtotal = useMemo(() => orderItems.reduce((s, x) => s + discounted(x.item.priceNGN) * x.qty, 0), [orderItems])
  const DELIVERY_FEES: Record<string, number> = { Lagos: 1500, Abuja: 1500, 'Port Harcourt': 1200, Owerri: 1000 }
  const ETA_TEXT: Record<string, string> = { Lagos: '≈45–60 mins', Abuja: '≈45–60 mins', 'Port Harcourt': '≈35–50 mins', Owerri: '≈30–45 mins' }
  const deliveryFee = currentRestaurant ? (DELIVERY_FEES[currentRestaurant.city] ?? 1000) : 0
  const totalWithDelivery = subtotal + deliveryFee

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
                    <p className="text-sm text-gray-600">{restaurant.city}</p>
                    <span className="text-sm font-medium text-brand-green">{restaurant.priceRange}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {restaurant.menu.slice(0, 2).map(m => m.name).join(', ')}
                    {restaurant.menu.length > 2 && ` +${restaurant.menu.length - 2} more`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="btn-ghost flex-1 text-sm h-9" onClick={() => { setMenuOpenFor(restaurant.id); setOrderOpenFor(null) }}>View Menu</button>
                  <button className="btn-primary flex-1 text-sm h-9" onClick={() => { setOrderOpenFor(restaurant.id); setMenuOpenFor(null); resetOrder() }}>Order Now</button>
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

      {/* Menu Drawer */}
      {menuOpenFor && currentRestaurant && (
        <div className="fixed inset-0 bg-black/40 z-50 flex" onClick={() => setMenuOpenFor(null)}>
          <div className="ml-auto w-full max-w-md bg-white h-full p-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Menu — {currentRestaurant.name}</h3>
              <button className="btn-ghost h-9" onClick={() => setMenuOpenFor(null)}>✕</button>
            </div>
            <div className="space-y-3">
              {currentRestaurant.menu.map(mi => (
                <div key={mi.name} className="flex items-center gap-3 border-b pb-3">
                  {/* Food Image */}
                  {mi.image && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={mi.image} 
                        alt={mi.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Food Info */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{mi.name}</div>
                    <div className="text-xs text-gray-500">{mi.category}</div>
                  </div>
                  
                  {/* Pricing */}
                  <div className="text-right">
                    <div className="text-gray-500 line-through text-xs">{naira(mi.priceNGN)}</div>
                    <div className="text-brand-green font-semibold">{naira(discounted(mi.priceNGN))}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderOpenFor && currentRestaurant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOrderOpenFor(null)}>
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Order from {currentRestaurant.name}</h3>
              <button className="btn-ghost h-9" onClick={() => setOrderOpenFor(null)}>✕</button>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Menu</h4>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {currentRestaurant.menu.map(mi => (
                    <div key={mi.name} className="flex items-center gap-3">
                      {/* Food Image */}
                      {mi.image && (
                        <div className="w-12 h-10 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={mi.image} 
                            alt={mi.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Food Info */}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{mi.name}</div>
                        <div className="text-xs text-gray-500">{mi.category}</div>
                      </div>
                      
                      {/* Pricing & Quantity */}
                      <div className="text-right">
                        <div className="text-xs line-through text-gray-500">{naira(mi.priceNGN)}</div>
                        <div className="text-brand-green font-semibold">{naira(discounted(mi.priceNGN))}</div>
                        <div className="mt-1 inline-flex items-center gap-2">
                          <button className="btn-ghost h-7 px-2" onClick={() => dec(mi.name)}>-</button>
                          <span className="w-6 text-center text-sm">{quantities[mi.name] || 0}</span>
                          <button className="btn-primary h-7 px-2" onClick={() => inc(mi.name)}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Details</h4>
                <div className="space-y-3">
                  <input className="input" placeholder="Full name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
                  <input className="input" placeholder="Phone (WhatsApp)" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
                  <input className="input" placeholder="Delivery address" value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Delivery date</label>
                      <input type="date" className="input" value={schedule.date} onChange={e => setSchedule({ ...schedule, date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Delivery time</label>
                      <input type="time" className="input" value={schedule.time} onChange={e => setSchedule({ ...schedule, time: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-100 text-sm">
                  <div className="flex justify-between">
                    <span>Items total:</span>
                    <span className="font-medium">{naira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Discount:</span>
                    <span className="font-medium">{restaurantDiscountPct(currentRestaurant)}% off</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery fee ({currentRestaurant.city}):</span>
                    <span>{naira(deliveryFee)}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Estimated time: {ETA_TEXT[currentRestaurant.city] || '≈45 mins'}</div>
                </div>
                {orderError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 text-sm text-red-800 rounded">
                    {orderError}
                  </div>
                )}
                <button
                  className="btn-primary w-full mt-4"
                  disabled={subtotal <= 0 || !contact.name || !contact.phone || !contact.address}
                  onClick={async () => {
                    setOrderError('')
                    const items = orderItems.map(x => ({ name: x.item.name, qty: x.qty, priceNGN: discounted(x.item.priceNGN) }))
                    try {
                      const resp = await fetch('/api/food/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          restaurantId: currentRestaurant.id,
                          restaurantName: currentRestaurant.name,
                          city: currentRestaurant.city,
                          contact,
                          items,
                          total: subtotal,
                          discountRate: restaurantDiscountPct(currentRestaurant),
                          deliveryWindow: schedule.time ? undefined : 'Afternoon',
                          scheduleDate: schedule.date,
                          scheduleTime: schedule.time,
                        })
                      })
                      if (!resp.ok) {
                        const err = await resp.json().catch(() => ({}))
                        setOrderError(err?.error || 'Unable to place order. Please try again.')
                        return
                      }
                      const data = await resp.json().catch(() => ({}))
                      const ref = data?.reference || `FD${Date.now()}`
                      // Redirect to food confirmation page with server-provided summary
                      const qp = new URLSearchParams({
                        reference: ref,
                        restaurant: currentRestaurant.name,
                        city: currentRestaurant.city,
                        total: String(data?.total || subtotal + deliveryFee),
                        deliveryFee: String(data?.deliveryFee || deliveryFee),
                        window: String(data?.deliveryWindow || (schedule.time ? 'Scheduled' : 'Afternoon')),
                        scheduleDate: schedule.date || '',
                        scheduleTime: schedule.time || '',
                        name: contact.name,
                        phone: contact.phone,
                        address: contact.address,
                        eta: String(ETA_TEXT[currentRestaurant.city] || ''),
                      })
                      setOrderOpenFor(null)
                      window.location.href = `/food/confirmation?${qp.toString()}`
                    } catch (e) {
                      setOrderError('Network error. Please check your connection and try again.')
                    }
                  }}
                >
                  Confirm Order — {naira(totalWithDelivery)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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