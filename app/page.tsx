import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { HOTELS } from '@/lib/data'
import FOOD_DATA from '@/lib.food.json'
import { getDiscountFor } from '@/lib/discounts'
import TourismScroller from '@/components/TourismScroller'

export default function Home() {
  // Get hotels from each city to ensure variety
  const lagosHotels = HOTELS.filter(h => h.city === 'Lagos' && h.type === 'Hotel').slice(0, 2)
  const abujaHotels = HOTELS.filter(h => h.city === 'Abuja' && h.type === 'Hotel').slice(0, 2)
  const portHarcourtHotels = HOTELS.filter(h => h.city === 'Port Harcourt' && h.type === 'Hotel').slice(0, 2)
  const owerriHotels = HOTELS.filter(h => h.city === 'Owerri' && h.type === 'Hotel').slice(0, 2)
  
  const featuredHotels = [...lagosHotels, ...abujaHotels, ...portHarcourtHotels, ...owerriHotels]
  
  // Get apartments from different cities for variety
  const lagosApartments = HOTELS.filter(h => h.city === 'Lagos' && h.type === 'Apartment').slice(0, 1)
  const abujaApartments = HOTELS.filter(h => h.city === 'Abuja' && h.type === 'Apartment').slice(0, 1)
  const portHarcourtApartments = HOTELS.filter(h => h.city === 'Port Harcourt' && h.type === 'Apartment').slice(0, 1)
  const owerriApartments = HOTELS.filter(h => h.city === 'Owerri' && h.type === 'Apartment').slice(0, 1)
  
  const featuredApartments = [...lagosApartments, ...abujaApartments, ...portHarcourtApartments, ...owerriApartments].filter(Boolean).slice(0, 4)
  
  // Sample data for vehicles and services (you can replace with real data)
  const vehicles = [
    {
      id: 'toyota-hiace-lagos',
      name: 'Toyota HiAce Bus',
      type: 'Coach',
      capacity: '14 passengers',
      pricePerDay: 45000,
      city: 'Lagos',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop'
    },
    {
      id: 'mercedes-sprinter-abuja',
      name: 'Mercedes Sprinter',
      type: 'Van',
      capacity: '12 passengers',
      pricePerDay: 55000,
      city: 'Abuja',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop'
    },
    {
      id: 'toyota-camry-lagos',
      name: 'Toyota Camry',
      type: 'Car',
      capacity: '4 passengers',
      pricePerDay: 25000,
      city: 'Lagos',
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop'
    },
    {
      id: 'lexus-suv-abuja',
      name: 'Lexus RX 350',
      type: 'SUV',
      capacity: '7 passengers',
      pricePerDay: 65000,
      city: 'Abuja',
      image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop'
    }
  ]

  const featuredServices = [
    {
      id: 'hair-styling-lagos',
      name: 'Professional Hair Styling',
      category: 'Hair',
      price: 15000,
      city: 'Lagos',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
      provider: 'Beauty Pro Studio'
    },
    {
      id: 'massage-therapy-abuja',
      name: 'Relaxation Massage',
      category: 'Massage',
      price: 25000,
      city: 'Abuja',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop',
      provider: 'Wellness Center'
    },
    {
      id: 'catering-service-lagos',
      name: 'Event Catering',
      category: 'Catering',
      price: 75000,
      city: 'Lagos',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop',
      provider: 'Premium Caterers'
    },
    {
      id: 'cleaning-service-port-harcourt',
      name: 'Home Cleaning',
      category: 'Cleaning',
      price: 12000,
      city: 'Port Harcourt',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      provider: 'Clean Pro Services'
    }
  ]

  const trendingDestinations: Array<{ city: string; image: string }> = [
    { city: 'Lagos', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&h=900&fit=crop&auto=format&q=80' },
    { city: 'Abuja', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=1400&h=900&fit=crop&auto=format&q=80' },
    { city: 'Port Harcourt', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&h=900&fit=crop&auto=format&q=80' },
    { city: 'Owerri', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400&h=900&fit=crop&auto=format&q=80' },
    { city: 'Calabar', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&h=900&fit=crop&auto=format&q=80' },
  ]

  const restaurants = (FOOD_DATA as any[]).slice(0, 3)

  return (
  <div className="min-h-screen relative overflow-hidden w-full pb-24">
      {/* Hero banner (keep search box design) */}
  <section className="relative z-20 min-h-[82vh] md:h-[78vh] w-full mb-6 md:mb-12">
        {/* Animated Background Image */}
        <div className="absolute inset-0 w-full">
          <img 
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury hotel"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50 w-screen"></div>
        </div>

        {/* Navigation - Floating */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-6">
          <div className="flex items-center justify-center">
            <CategoryTabs active="hotels" />
          </div>
        </div>

  {/* Hero Content */}
  <div className="absolute inset-0 flex flex-col items-center text-center z-40 px-4 md:px-6 pt-16 md:pt-24">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-8 tracking-tight fade-in-up">
            Save on stays across Nigeria
          </h1>
          <p className="text-white/90 max-w-2xl mb-6 md:mb-10 text-sm md:text-base">
            Best prices, flexible options, and local support—find your perfect stay today.
          </p>
          
          {/* Search Bar - Full Width Across Page */}
          <div className="w-full max-w-6xl fade-in-up-delayed">
            <SearchBar submitLabel="Search" showBrandSplashOnSubmit mobileDatePicker="custom" />
          </div>

          {/* Benefits strip - desktop only to avoid overlapping mobile content */}
          <div className="hidden md:flex mt-6 flex-wrap items-center justify-center gap-4 text-white/90 text-sm">
            <span className="bg-white/10 rounded-full px-3 py-1 backdrop-blur">No prepayment needed</span>
            <span className="bg-white/10 rounded-full px-3 py-1 backdrop-blur">Free cancellation on many stays</span>
            <span className="bg-white/10 rounded-full px-3 py-1 backdrop-blur">Trusted Nigerian support</span>
          </div>
        </div>
      </section>

      {/* Mobile: remove benefit chips entirely to tighten layout */}

  {/* Trending Destinations */}
  <section className="relative z-0 py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Trending destinations</h2>
          <p className="text-gray-600 mb-6 md:mb-10">Most popular choices for travellers in Nigeria</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {trendingDestinations.map((d, i) => (
              <Link key={d.city} href={`/search?city=${encodeURIComponent(d.city)}`} className={`${i===0 ? 'md:col-span-2 lg:col-span-2' : ''} group relative rounded-2xl overflow-hidden shadow-sm border border-gray-100`}> 
                <SafeImage src={d.image} alt={d.city} className="h-48 md:h-60 lg:h-64 w-full" fallbackSrc="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&auto=format&fit=crop&q=80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <div className="text-white font-bold text-xl md:text-2xl drop-shadow">{d.city} <span className="text-white/90">🇳🇬</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hotels - First 8 Only */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Desktop/Tablet heading */}
          <h2 className="hidden md:block text-3xl font-bold text-center mb-12">Featured Hotels</h2>

          {/* Mobile heading */}
          <h2 className="md:hidden text-2xl font-bold mb-6">Stay at our top properties</h2>

          {/* Mobile list (image-left cards) */}
          <div className="md:hidden space-y-4">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              const base = typeof (h as any).basePriceNGN === 'number' ? (h as any).basePriceNGN : (typeof (h as any).price === 'number' ? (h as any).price : 0)
              const displayPrice = base
              const showHighSecurity = base > 78000
              return (
                <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <Link href={`/hotel/${h.id}`} className="shrink-0">
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80'}
                        alt={h.name}
                        className="w-28 h-24 rounded-lg"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/hotel/${h.id}`} className="block">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{h.name}</h3>
                        <p className="text-gray-600 text-xs mt-0.5">{h.city} • {h.stars}⭐</p>
                      </Link>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-base font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                          {showHighSecurity ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Link
                            href={`/hotel/${h.id}`}
                            className="flex-1 bg-teal-600 text-white py-1.5 px-3 rounded-md text-xs font-medium hover:bg-teal-700 transition-colors text-center"
                          >
                            Book
                          </Link>
                          {hasNegotiation && (
                            <Link
                              href={`/negotiate?propertyId=${h.id}`}
                              className="flex-1 bg-brand-green text-white py-1.5 px-3 rounded-md text-xs font-medium hover:bg-brand-dark transition-colors text-center"
                            >
                              Negotiate
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop/Tablet grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              // Show only base price - discount is revealed only after negotiate button is clicked
              const base = typeof (h as any).basePriceNGN === 'number' ? (h as any).basePriceNGN : (typeof (h as any).price === 'number' ? (h as any).price : 0)
              const displayPrice = base
              const showHighSecurity = base > 78000

              return (
                <div key={h.id} className="group h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <Link href={`/hotel/${h.id}`}>
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80'}
                        alt={h.name}
                        className="w-full h-48 md:h-56 lg:h-60"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
                      />
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link href={`/hotel/${h.id}`} className="block">
                        <h3 className="font-bold text-gray-900 mb-1 hover:text-brand-green transition-colors line-clamp-2">{h.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{h.city} • {h.stars}⭐</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-lg font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                          {showHighSecurity ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">per night</div>
                      </Link>
                      <div className="mt-auto flex items-center gap-2">
                        <Link 
                          href={`/hotel/${h.id}`}
                          className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors text-center"
                        >
                          Book
                        </Link>
                        {hasNegotiation && (
                          <Link 
                            href={`/negotiate?propertyId=${h.id}`}
                            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors text-center"
                          >
                            Negotiate
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/search" className="bg-brand-green text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors">
              View All Hotels
            </Link>
          </div>
        </div>
      </section>

      {/* Food & Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Food & Services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Popular food</h3>
                <Link href="/food" className="text-brand-green hover:text-brand-dark text-sm">See all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restaurants.map(r => (
                  <Link key={r.id} href={`/food?city=${encodeURIComponent(r.city)}`} className="group">
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition">
                      <img src={r.image} alt={r.name} className="h-40 w-full object-cover" />
                      <div className="p-3">
                        <div className="font-semibold text-gray-900 line-clamp-1">{r.name}</div>
                        <div className="text-xs text-gray-600">{r.city} • {r.priceRange}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Top local services</h3>
                <Link href="/services" className="text-brand-green hover:text-brand-dark text-sm">See all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredServices.map(service => (
                  <Link key={service.id} href={`/services`} className="group">
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition">
                      <img src={service.image} alt={service.name} className="h-40 w-full object-cover" />
                      <div className="p-3">
                        <div className="font-semibold text-gray-900 line-clamp-1">{service.name}</div>
                        <div className="text-xs text-gray-600">{service.city} • {service.category}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
  <section className="py-10 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg border border-emerald-100 p-4">Free cancellation on many stays</div>
            <div className="bg-white rounded-lg border border-emerald-100 p-4">Pay at property on eligible bookings</div>
            <div className="bg-white rounded-lg border border-emerald-100 p-4">24/7 local support via WhatsApp</div>
          </div>
        </div>
      </section>

      {/* Tourism section (after Food & Services) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">Explore Nigeria</h2>
            <Link href="/tourism" className="text-brand-green hover:text-brand-dark text-sm">See all</Link>
          </div>
          <p className="text-gray-600 mb-6">Stunning natural wonders and heritage sites across the country</p>
          {/* Hero picks: horizontal scroll */}
          <TourismScroller variant="hero" />
          {/* More places: horizontal scroll with instruction to scroll */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">More places to explore</h3>
              <div className="text-xs text-gray-500">Scroll right to see more →</div>
            </div>
            <TourismScroller variant="more" />
          </div>
        </div>
      </section>
    </div>
  )
}