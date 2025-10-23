import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { HOTELS } from '@/lib/data'
import { getDiscountFor, getDiscountInfo, DiscountTier } from '@/lib/discounts'

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

  return (
    <div className="min-h-screen relative overflow-hidden w-screen">
      {/* Hero with Zoom Animation (visible on all viewports) */}
      <section className="relative h-screen w-screen">
        {/* Animated Background Image */}
        <div className="absolute inset-0 zoom-out-animation w-screen">
          <img 
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury hotel"
            className="w-screen h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50 w-screen"></div>
        </div>

        {/* Navigation - Floating */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-6">
          <div className="flex items-center justify-center">
            <CategoryTabs active="hotels" />
          </div>
        </div>

        {/* Hero Content - Much Higher Up */}
        <div className="absolute inset-0 flex flex-col items-center text-center z-40 px-4 md:px-6 pt-20 md:pt-32">
          {/* Minimal Text */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-12 tracking-tight fade-in-up">
            SAVE UP TO 50% ON<br />
            HOTELS IN NIGERIA
          </h1>
          
          {/* Search Bar - Full Width Across Page */}
          <div className="w-full max-w-6xl fade-in-up-delayed">
            <SearchBar submitLabel="Search" showBrandSplashOnSubmit />
          </div>
        </div>
      </section>

      {/* Featured Hotels - First 8 Only */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Hotels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map(h => {
              const discount = getDiscountFor(h.id)
              const hasNegotiation = discount > 0
              // Show only base price - discount is revealed only after negotiate button is clicked
              const displayPrice = h.basePriceNGN

              return (
                <div key={h.id} className="group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <Link href={`/hotel/${h.id}`}>
                      <SafeImage
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80'}
                        alt={h.name}
                        className="w-full h-48"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
                      />
                    </Link>
                    <div className="p-4">
                      <Link href={`/hotel/${h.id}`}>
                        <h3 className="font-bold text-gray-900 mb-1 hover:text-brand-green transition-colors">{h.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{h.city} • {h.stars}⭐</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-lg font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">per night</div>
                      </Link>
                      
                      {hasNegotiation ? (
                        <Link 
                          href={`/negotiate?propertyId=${h.id}`}
                          className="w-full bg-brand-green text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors text-center block"
                        >
                          Negotiate Price
                        </Link>
                      ) : (
                        <Link 
                          href={`/hotel/${h.id}`}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors text-center block"
                        >
                          Book Now
                        </Link>
                      )}
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

      {/* Secure Popular Apartments */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Secure Popular Apartments</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover comfortable and secure apartment rentals across Nigeria's major cities with our verified hosts
          </p>
          {/* Horizontal layout with varied sizes */}
          <div className="flex gap-6 overflow-x-auto pb-4">
            {featuredApartments.map((apartment, index) => {
              const discount = getDiscountFor(apartment.id)
              const hasNegotiation = discount > 0
              // Show only base price - discount is revealed only after negotiate button is clicked
              const displayPrice = apartment.basePriceNGN
              
              // Different widths for variety: first one is large, others vary
              const widthClass = index === 0 ? 'w-96' : index === 1 ? 'w-80' : 'w-72'

              return (
                <div key={apartment.id} className={`group flex-shrink-0 ${widthClass}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <Link href={`/hotel/${apartment.id}`}>
                      <div className="relative h-48">
                        <SafeImage
                          src={apartment.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format&q=80'}
                          alt={apartment.name}
                          className="w-full h-full"
                          fallbackSrc="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format&q=80"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-blue-100/90 text-blue-800 text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                            Apartment
                          </span>
                          <span className="bg-green-100/90 text-green-800 text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                            Verified
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/hotel/${apartment.id}`}>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 hover:text-brand-green transition-colors">{apartment.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{apartment.city} • {apartment.stars}⭐</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-lg font-bold text-gray-900">
                            ₦{displayPrice.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">per night</div>
                      </Link>
                      
                      {hasNegotiation ? (
                        <Link 
                          href={`/negotiate?propertyId=${apartment.id}`}
                          className="w-full bg-brand-green text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors text-center block"
                        >
                          Negotiate Price
                        </Link>
                      ) : (
                        <Link 
                          href={`/hotel/${apartment.id}`}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors text-center block"
                        >
                          Book Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/search?stayType=apartment" className="bg-brand-green text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors">
              View All Apartments
            </Link>
          </div>
        </div>
      </section>

      {/* Hire Vehicles and Coaches */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Hire Vehicles and Coaches</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Rent reliable vehicles for your transportation needs across Nigeria
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      {vehicle.type}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                      {vehicle.capacity}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{vehicle.city}</p>
                  <div className="text-lg font-bold text-brand-green">
                    ₦{vehicle.pricePerDay.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">per day</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/vehicles" className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors">
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Local Services</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Book trusted local services for all your needs across Nigerian cities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map(service => (
              <Link key={service.id} href={`/services/${service.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                        {service.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">{service.provider}</p>
                    <p className="text-gray-500 text-xs mb-2">{service.city}</p>
                    <div className="text-lg font-bold text-brand-green">
                      ₦{service.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">starting price</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}