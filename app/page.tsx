import SearchBar from '@/components/SearchBar'
import StickyHeader from '@/components/StickyHeader'
import NegotiateExplainer from '@/components/NegotiateExplainer'
import CategoryTabs from '@/components/CategoryTabs'
import PopularCities from '@/components/PopularCities'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { getHotelsOptimized, getHotelByIdOptimized } from '@/lib/hotel-data-optimized'
import FOOD_DATA from '@/lib.food.json'
import { getDiscountFor } from '@/lib/discounts'
import TourismScroller from '@/components/TourismScroller'
import SecurityBadge from '@/components/SecurityBadge'

// Helper function to extract price from hotel data
function getHotelPrice(hotel: any): number {
  // First check if roomTypes exist and extract lowest price
  if (hotel.roomTypes && Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0) {
    const prices = hotel.roomTypes
      .map((rt: any) => rt.pricePerNight || 0)
      .filter((p: number) => p > 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  
  // Fallback to old pricing structure
  return typeof hotel.basePriceNGN === 'number' 
    ? hotel.basePriceNGN 
    : (typeof hotel.price === 'number' ? hotel.price : 0);
}

export default async function Home() {
  // Use optimized data loading with limited results for homepage
  const allHotels = await getHotelsOptimized();
  
  // Get hotels from each city to ensure variety - exclude Lagos Continental and prioritize Protea Hotel Owerri
  const lagosHotels = allHotels.filter(h => h.city === 'Lagos' && h.type === 'Hotel' && h.id !== 'the-lagos-continental-hotel-lagos').slice(0, 2)
  const abujaHotels = allHotels.filter(h => h.city === 'Abuja' && h.type === 'Hotel').slice(0, 2)
  const portHarcourtHotels = allHotels.filter(h => h.city === 'Port Harcourt' && h.type === 'Hotel').slice(0, 2)
  
  // Prioritize Protea Hotel Owerri from Owerri hotels
  const proteaHotel = await getHotelByIdOptimized('protea-hotel-owerri-owerri')
  const otherOwerriHotels = allHotels.filter(h => h.city === 'Owerri' && h.type === 'Hotel' && h.id !== 'protea-hotel-owerri-owerri').slice(0, 1)
  const owerriHotels = proteaHotel ? [proteaHotel, ...otherOwerriHotels] : allHotels.filter(h => h.city === 'Owerri' && h.type === 'Hotel').slice(0, 2)
  
  const featuredHotels = [...lagosHotels, ...abujaHotels, ...portHarcourtHotels, ...owerriHotels]
  
  // Get apartments from different cities for variety
  const lagosApartments = allHotels.filter(h => h.city === 'Lagos' && h.type === 'Apartment').slice(0, 1)
  const abujaApartments = allHotels.filter(h => h.city === 'Abuja' && h.type === 'Apartment').slice(0, 1)
  const portHarcourtApartments = allHotels.filter(h => h.city === 'Port Harcourt' && h.type === 'Apartment').slice(0, 1)
  const owerriApartments = allHotels.filter(h => h.city === 'Owerri' && h.type === 'Apartment').slice(0, 1)
  
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
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop&auto=format&q=80',
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
    { city: 'Lagos', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&h=900&fit=crop&auto=format&q=80' }, // Luxury hotel lobby interior for Lagos
    { city: 'Abuja', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&h=900&fit=crop&auto=format&q=80' }, // Modern hotel room interior for Abuja
    { city: 'Port Harcourt', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&h=900&fit=crop&auto=format&q=80' }, // Elegant hotel restaurant interior for Port Harcourt
    { city: 'Owerri', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1400&h=900&fit=crop&auto=format&q=80' }, // Beautiful hotel suite interior for Owerri
    { city: 'Calabar', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&h=900&fit=crop&auto=format&q=80' }, // Luxury hotel bathroom interior for Calabar
  ]

  const restaurants = (FOOD_DATA as any[]).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Sticky Header with Scroll Animation */}
      <StickyHeader />
      
      {/* Hero Section with Background Image like Booking.com */}
      <section className="relative pt-20 md:pt-40 h-80 md:h-96 overflow-visible">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <SafeImage 
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&h=800&fit=crop&auto=format&q=85" 
            alt="Luxury hotel pool and resort view in Nigeria"
            mobileQuery="luxury hotel Nigeria resort"
            className="w-full h-full object-cover"
            fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=800&fit=crop&auto=format&q=85"
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/30"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center text-left text-white px-4 overflow-visible">
          <div className="container mx-auto px-4 md:px-6 overflow-visible">
            <div className="max-w-3xl mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight drop-shadow-lg">
                Negotiate hotel prices in real time
              </h1>
              <p className="text-sm md:text-lg mb-3 text-white/90 drop-shadow">
                Save up to 50%+ on select stays.
              </p>
            </div>
            
            {/* SearchBar on Homepage */}
            {/* Desktop/Tablet: keep inside hero overlay */}
            <div className="hidden md:block max-w-6xl overflow-visible">
              <SearchBar 
                defaultCity=""
                defaultHotelQuery=""
                defaultCheckIn=""
                defaultCheckOut=""
                defaultAdults={2}
                defaultChildren={0}
                defaultRooms={1}
                defaultBudget="u80"
                defaultStayType="any"
                submitLabel="Search Hotels"
              />
            </div>
          </div>
        </div>
        
  {/* Decorative gradient fade */}
  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </section>

      {/* Mobile SearchBar: render below hero to avoid overlap with hero text/header */}
  <section className="md:hidden bg-white px-4 pt-0 pb-2 relative z-20 -mt-10">
        <div className="container mx-auto">
          <SearchBar 
            defaultCity=""
            defaultHotelQuery=""
            defaultCheckIn=""
            defaultCheckOut=""
            defaultAdults={2}
            defaultChildren={0}
            defaultRooms={1}
            defaultBudget="u80"
            defaultStayType="any"
            submitLabel="Search Hotels"
          />
        </div>
      </section>

  {/* Negotiation explainer */}
  <NegotiateExplainer />

      {/* Mobile Featured Properties - Show immediately after mobile search */}
      <section className="md:hidden bg-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Featured properties</h2>
            <Link href="/search" className="text-brand-green text-sm font-medium">View all</Link>
          </div>
          
          {/* Mobile Horizontal Scroll Properties */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {featuredHotels.slice(0, 6).map(h => {
              const discount = getDiscountFor(h.id)
              const base = getHotelPrice(h)
              const displayPrice = base
              return (
                <Link key={h.id} href={`/hotel/${h.id}`} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <SafeImage
                    src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=60'}
                    alt={h.name}
                    mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
                    className="w-full h-24 object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=60"
                    loading="lazy"
                  />
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{h.name}</h3>
                    <p className="text-gray-600 text-xs mt-0.5">{h.city} • {h.stars}⭐</p>
                    <div className="mt-1">
                      <span className="text-sm font-bold text-gray-900">₦{displayPrice.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">per night</span>
                      {discount > 0 && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Negotiable • up to {(Math.round(discount * 100))}% off
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="destinations" className="bg-white py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-6">
          {/* Desktop/Tablet heading */}
          <h2 className="hidden md:block text-xl md:text-2xl font-bold text-center mb-3 md:mb-4">Featured Hotels</h2>

          {/* Mobile heading */}
          <h2 className="md:hidden text-lg font-bold mb-2">More properties</h2>

          {/* Mobile list (image-left cards) */}
          <div className="md:hidden space-y-3">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              const base = getHotelPrice(h)
              const displayPrice = base
              const showHighSecurity = base > 78000
              return (
                <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-3 p-2">
                    <Link href={`/hotel/${h.id}`} className="shrink-0">
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=60'}
                        alt={h.name}
                        mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
                        className="w-24 h-20 rounded-lg"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=60"
                        loading="lazy"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/hotel/${h.id}`} className="block">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{h.name}</h3>
                        <p className="text-gray-600 text-xs mt-0.5">{h.city} • {h.stars}⭐</p>
                      </Link>
                      <div className="mt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                          {hasNegotiation && (
                            <span className="text-[10px] text-emerald-700 font-medium">Negotiation available</span>
                          )}
                          {showHighSecurity ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <Link
                            href={`/hotel/${h.id}`}
                            className="flex-1 bg-teal-600 text-white py-1 px-2 rounded-md text-xs font-medium hover:bg-teal-700 transition-colors text-center"
                          >
                            Book
                          </Link>
                          {hasNegotiation && (
                            <Link
                              href={`/negotiate?propertyId=${h.id}`}
                              className="flex-1 bg-brand-green text-white py-1 px-2 rounded-md text-xs font-medium hover:bg-brand-dark transition-colors text-center"
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

          {/* Mobile list (image-left cards) */}
          <div className="md:hidden space-y-3">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              const base = getHotelPrice(h)
              const displayPrice = base
              const showHighSecurity = base > 78000
              return (
                <div key={h.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex gap-3 p-2">
                    <Link href={`/hotel/${h.id}`} className="shrink-0">
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=75'}
                        alt={h.name}
                        mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
                        className="w-20 h-20 object-cover rounded-lg"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&auto=format&q=75"
                        loading="lazy"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <Link href={`/hotel/${h.id}`} className="block">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{h.name}</h3>
                        <p className="text-gray-600 text-xs mt-0.5">{h.city} • {h.stars}⭐</p>
                      </Link>
                      <div className="mt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                          {hasNegotiation && (
                            <span className="text-[10px] text-emerald-700 font-medium">Negotiation available</span>
                          )}
                          {showHighSecurity ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <Link
                            href={`/hotel/${h.id}`}
                            className="flex-1 bg-teal-600 text-white py-1 px-2 rounded-md text-xs font-medium hover:bg-teal-700 transition-colors text-center"
                          >
                            Book
                          </Link>
                          {hasNegotiation && (
                            <Link
                              href={`/negotiate?propertyId=${h.id}`}
                              className="flex-1 bg-brand-green text-white py-1 px-2 rounded-md text-xs font-medium hover:bg-brand-dark transition-colors text-center"
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
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              // Show only base price - discount is revealed only after negotiate button is clicked
              const base = getHotelPrice(h)
              const displayPrice = base
              const showHighSecurity = base > 78000

              return (
                <div key={h.id} className="group h-full">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <Link href={`/hotel/${h.id}`}>
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&auto=format&q=75'}
                        alt={h.name}
                        mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
                        className="w-full h-44 object-cover"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&auto=format&q=75"
                        loading="lazy"
                      />
                    </Link>
                    <div className="p-3 flex flex-col flex-1">
                      <Link href={`/hotel/${h.id}`} className="block">
                        <h3 className="font-bold text-gray-900 mb-1 hover:text-brand-green transition-colors line-clamp-2 text-sm">{h.name}</h3>
                        <p className="text-gray-600 text-xs mb-2">{h.city} • {h.stars}⭐</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-base font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                          {showHighSecurity ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-700 border border-rose-200">High security</span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200">Good security</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">per night</div>
                      </Link>
                      <div className="mt-auto flex items-center gap-2">
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
                            Negotiate price
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-4">
            <Link href="/search" className="bg-brand-green text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors text-sm">
              View All Hotels
            </Link>
          </div>
        </div>
      </section>

      {/* Airport Taxi Promo Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚖</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Airport Taxi Service</h3>
                <p className="text-white/90 text-sm">Hassle-free transfers to and from airports</p>
              </div>
            </div>
            <a 
              href="/airport-taxi" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      {/* Popular Cities with Featured Hotels */}
      <PopularCities />

      {/* Food & Services */}
      <section className="py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">Food & Services</h2>
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
                      <SafeImage src={r.image} alt={r.name} mobileQuery={`${r.name} ${r.city} Nigeria`} className="h-40 w-full object-cover" fallbackSrc={r.image} />
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
                      <SafeImage src={service.image} alt={service.name} mobileQuery={`${service.name} ${service.city} Nigeria ${service.category}`} className="h-40 w-full object-cover" fallbackSrc={service.image} />
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
            <div className="bg-white rounded-lg border border-emerald-100 p-4">Pay at property on eligible bookings</div>
            <div className="bg-white rounded-lg border border-emerald-100 p-4">24/7 local support via WhatsApp</div>
          </div>
        </div>
      </section>

      {/* Tourism section (after Food & Services) */}
      <section className="py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl md:text-2xl font-bold">Explore Nigeria</h2>
            <Link href="/tourism" className="text-brand-green hover:text-brand-dark text-sm">See all</Link>
          </div>
          <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">Stunning natural wonders and heritage sites across the country</p>
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

      {/* Gift Box Section */}
      <section className="py-8 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                {/* Gift Box with Bow */}
                <div className="w-20 h-20 bg-brand-green rounded-lg shadow-lg relative transform hover:scale-105 transition-transform duration-300">
                  {/* Gift box body */}
                  <div className="absolute inset-2 bg-gradient-to-br from-green-400 to-green-600 rounded"></div>
                  {/* Ribbon horizontal */}
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-yellow-400 transform -translate-y-1/2"></div>
                  {/* Ribbon vertical */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-yellow-400 transform -translate-x-1/2"></div>
                  {/* Bow */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-4 bg-red-500 rounded-full relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Gift with Every Booking!</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Book any hotel through Hotelsaver.ng and receive a complimentary welcome gift. 
              Experience Nigerian hospitality at its finest!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/hotel-portal" className="bg-brand-green hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                List Your Property
              </a>
              <a href="/search" className="bg-white hover:bg-gray-50 text-brand-green px-6 py-3 rounded-lg font-medium border-2 border-brand-green transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Booking
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}