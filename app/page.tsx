// app/page.tsx
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import Link from 'next/link'
import { HOTELS } from '@/lib/data'
import { getDiscountFor } from '@/lib/discounts'

export default function Home() {
  // Get featured hotels for display
  const featuredHotels = HOTELS.slice(0, 6)

  return (
    <div className="py-8">
      <div className="flex items-center justify-between">
        <CategoryTabs active="hotels" />
        <div className="text-sm text-gray-600">Luxury stays across Nigeria 🇳🇬</div>
      </div>

      {/* Hero Section - Enhanced */}
      <section className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-brand-green/10 card border-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative p-6 md:p-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Save up to <span className="text-brand-green">15%</span> on Nigerian Hotels 
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              🏨 Instant negotiation • ⚡ Real-time offers • 🇳🇬 Lagos, Abuja, Port Harcourt & Owerri
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Hotels</h2>
            <p className="text-gray-600 mt-1">Premium accommodations across Nigeria</p>
          </div>
          <Link href="/search" className="btn-primary">
            View All Hotels
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHotels.map((hotel) => {
            const discount = getDiscountFor(hotel.id)
            const canNegotiate = discount > 0
            const discountedPrice = canNegotiate ? Math.round((hotel.basePriceNGN || 0) * (1 - discount)) : (hotel.basePriceNGN || 0)
            const savings = (hotel.basePriceNGN || 0) - discountedPrice
            
            return (
              <Link 
                key={hotel.id} 
                href={`/hotel/${hotel.id}`}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative">
                  <img
                    src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'}
                    alt={hotel.name}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
                    {'⭐'.repeat(hotel.stars)}
                  </div>
                  {canNegotiate ? (
                    <div className="absolute top-3 right-3 bg-brand-green text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save {Math.round(discount * 100)}%
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Fixed Price
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">📍 {hotel.city}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className={`text-2xl font-bold ${canNegotiate ? 'text-brand-green' : 'text-gray-900'}`}>
                        ₦{discountedPrice.toLocaleString()}
                      </span>
                      {canNegotiate && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">₦{(hotel.basePriceNGN || 0).toLocaleString()}</span>
                          <span className="text-red-600 font-medium ml-1">-{Math.round(discount * 100)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">per night</div>
                      <div className="mt-1">
                        {canNegotiate ? (
                          <Link
                            href={`/negotiate?propertyId=${hotel.id}`}
                            className="inline-block text-sm px-3 py-1 bg-brand-green text-white rounded hover:bg-brand-dark transition-colors"
                          >
                            🔥 Negotiate
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="text-sm px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                          >
                            Fixed Price
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Food Section (Nigeria) */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Best Food and Restaurants</h2>
            <p className="text-sm text-gray-600">
              Try: <i>&quot;I want fresh pounded yam with egusi soup&quot;</i>
            </p>
          </div>
          <Link href="/food" className="btn-ghost">Browse all restaurants</Link>
        </div>

        {/* Grid with Nigerian dishes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
          {/* Large featured image */}
          <div className="md:col-span-8 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="https://images.unsplash.com/photo-1586201375761-83865001e26c?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Nigerian Jollof Rice with Chicken"
              className="h-64 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Jollof Rice &amp; Chicken</h3>
              <p className="text-sm text-gray-600 mt-1">Smoky party jollof with fried chicken and plantains</p>
            </div>
          </div>

          {/* Right column (two medium cards) */}
          <div className="md:col-span-4 grid grid-rows-2 gap-4">
            <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format&q=80"
                alt="Pounded Yam and Egusi Soup"
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">Pounded Yam &amp; Egusi</h3>
              </div>
            </div>
            <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <img
                src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&h=600&fit=crop&auto=format&q=80"
                alt="Nigerian Suya"
                className="h-32 w-full object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold">Suya</h3>
              </div>
            </div>
          </div>

          {/* Two wide cards beneath */}
          <div className="md:col-span-6 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Goat Meat Pepper Soup"
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">Goat Meat Pepper Soup</h3>
              <p className="text-sm text-gray-600 mt-1">Spicy, comforting broth with local spices</p>
            </div>
          </div>

          <div className="md:col-span-6 card overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Ofada Rice with Ayamase Stew"
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold">Ofada Rice &amp; Ayamase</h3>
              <p className="text-sm text-gray-600 mt-1">Ofada rice served with green pepper stew</p>
            </div>
          </div>
        </div>

        {/* Optional extra Nigerian snacks (show on wide screens via /food page if you prefer) */}
        {/* Examples you can use later:
            /images/food/ng/moi-moi.jpg (Moi Moi)
            /images/food/ng/akara.jpg (Akara)
            /images/food/ng/puff-puff.jpg (Puff-Puff)
            /images/food/ng/efo-riro.jpg (Efo Riro)
            /images/food/ng/okro-soup.jpg (Okro Soup)
        */}
      </section>

      {/* Hair & Beauty */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hair and Beauty</h2>
            <p className="text-sm text-gray-600">Try: <i>&quot;I need my hair braided urgently&quot;</i></p>
          </div>
          <Link href="/services?category=beauty" className="btn-ghost">Browse beauty services</Link>
        </div>
        <div className="grid-cards mt-4">
          {[
            {title:'Professional Braiding',img:'https://images.unsplash.com/photo-1595475883362-5d6c3616a9a1?w=800&auto=format&fit=crop',desc:'Expert braiding styles for black hair'},
            {title:'Nail Art & Care',img:'https://images.unsplash.com/photo-1607778835362-8b8c3c4b5c1a?w=800&auto=format&fit=crop',desc:'Beautiful nail designs and treatments'},
            {title:'Eyelash Extensions',img:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',desc:'Luxurious lash extensions for black women'},
            {title:'Hair Extensions',img:'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&auto=format&fit=crop',desc:'Premium hair extensions and styling'}
          ].map((s,i)=>(
            <div className="card overflow-hidden hover:shadow-lg transition-shadow" key={i}>
              <img src={s.img} className="h-44 w-full object-cover" alt={s.title}/>
              <div className="p-4">
                <div className="font-semibold">{s.title}</div>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Original Services */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Explore Local Services</h2>
            <p className="text-sm text-gray-600">Various services available in your area</p>
          </div>
          <Link href="/services" className="btn-ghost">Browse all services</Link>
        </div>
        <div className="grid-cards mt-4">
          {[
            {title:'Massage therapists',img:'https://picsum.photos/seed/svc1/800/500',desc:'Relaxation & deep-tissue at your location'},
            {title:'Hair & makeup',img:'https://picsum.photos/seed/svc2/800/500',desc:'Braids, styling, nails & more'},
            {title:'Cleaning services',img:'https://picsum.photos/seed/svc3/800/500',desc:'Home & office cleaners on-demand'}
          ].map((s,i)=>(
            <div className="card overflow-hidden hover:shadow-lg transition-shadow" key={i}>
              <img src={s.img} className="h-44 w-full object-cover" alt={s.title}/>
              <div className="p-4">
                <div className="font-semibold">{s.title}</div>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
