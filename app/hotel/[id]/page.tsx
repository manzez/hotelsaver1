import { getHotelById } from '@/lib/hotels-source'
import Link from 'next/link'
import { getDiscountFor } from '@/lib/discounts'
import { getFacilitiesFor, facilityLabel, facilityIcon, FACILITY_GROUPS, POPULAR_KEYS, type FacilityKey } from '@/lib/facilities'
import SafeImage from '@/components/SafeImage'
import MobileImageCarousel from '@/components/MobileImageCarousel'

// Hotel descriptions and highlights (amenities moved to dynamic facilities)
const hotelDetails: { [key: string]: { description: string; highlights: string[] } } = {
  "protea-hotel-owerri-owerri": {
    description: "This premium 4-star hotel is located in the heart of Owerri, the capital city of Imo State. It offers luxurious accommodations with modern amenities and exceptional service. The hotel is conveniently situated near major shopping centers, business districts, and cultural attractions. Guests enjoy complimentary WiFi, 24-hour room service, and access to our fitness center.",
    highlights: ["Perfect for business travelers", "Family-friendly environment", "Central location in Owerri", "Highly rated by couples (9.2/10)"]
  },
  "bon-hotel-nest-owerri-owerri": {
    description: "BON Hotel Nest Owerri is a contemporary 4-star hotel offering world-class hospitality in the vibrant city of Owerri. Our hotel combines modern luxury with traditional Nigerian warmth, providing guests with an unforgettable experience. Located minutes away from major attractions and business centers, we cater to both leisure and business travelers.",
    highlights: ["Award-winning restaurant", "Rooftop pool with city views", "State-of-the-art conference facilities", "Popular with international guests"]
  },
  "immaculate-royal-hotel-owerri": {
    description: "Immaculate Royal Hotel offers comfortable and affordable accommodation in Owerri. This 3-star hotel provides excellent value for money while maintaining high standards of cleanliness and service. Perfect for budget-conscious travelers who don't want to compromise on comfort and convenience.",
    highlights: ["Excellent value for money", "Family-friendly", "Central location", "Popular breakfast buffet"]
  },
  "default": {
    description: "This exceptional hotel offers premium accommodations in one of Nigeria's most vibrant cities. Our property combines modern luxury with traditional hospitality, ensuring every guest enjoys a memorable stay. Located in a prime area with easy access to business districts, shopping centers, and cultural attractions.",
    highlights: ["Prime location", "Modern facilities", "Excellent service", "Perfect for all travelers"]
  }
}

export default async function HotelDetail({params, searchParams}:{params:{id:string}, searchParams?:Record<string,string|undefined>}){
  const h = await getHotelById(params.id)
  if (!h) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h1>
      <p className="text-gray-600 mb-8">The hotel you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  )

  const details = hotelDetails[h.id] || hotelDetails["default"]
  const facilityKeys: FacilityKey[] = getFacilitiesFor(h.id)
  const discount = getDiscountFor(h.id)
  const canNegotiate = discount > 0
  const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price! : 0)
  const discountedPrice = canNegotiate ? Math.round(base * (1 - discount)) : base
  const savings = base - discountedPrice
  const stars = typeof (h as any).stars === 'number' ? (h as any).stars : 4

  // Preserve booking context from URL (check-in/out and guests)
  const sp = new URLSearchParams((searchParams || {}) as any)
  const checkIn = sp.get('checkIn') || ''
  const checkOut = sp.get('checkOut') || ''
  const adults = sp.get('adults') || '2'
  const children = sp.get('children') || '0'
  const rooms = sp.get('rooms') || '1'

  const fmtDate = (isoDate: string) => {
    try {
      if (!isoDate) return ''
      const d = new Date(isoDate + 'T00:00:00')
      if (isNaN(+d)) return ''
      return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    } catch { return '' }
  }
  const checkInLabel = checkIn ? `${fmtDate(checkIn)} from 15:00` : 'from 15:00'
  const checkOutLabel = checkOut ? `${fmtDate(checkOut)} 11:00` : '11:00'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Image Gallery first (especially for mobile) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Mobile carousel */}
          <MobileImageCarousel images={(h.images||[]).slice(0,5)} altBase={h.name} heightClass="h-64" />

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-1">
            {(h.images||[]).slice(0, 5).map((src: string, i: number) => {
              const fallbackImages = [
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80'
              ];
              return (
                <SafeImage
                  key={i}
                  src={src}
                  alt={`${h.name} - Image ${i + 1}`}
                  className={`w-full object-cover ${i === 0 ? 'md:col-span-2 h-80' : 'h-40'}`}
                  fallbackSrc={fallbackImages[i] || fallbackImages[0]}
                  loading="lazy"
                />
              )
            })}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight break-words line-clamp-2">{h.name}</h1>
              <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                <div className="text-amber-400 text-base md:text-lg leading-none">{"★".repeat(stars)}{"☆".repeat(5-stars)}</div>
                <span className="text-gray-600 text-sm md:text-base">{stars}-star {h.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{h.city}, Nigeria</span>
              </div>
            </div>
            <div className="mt-2 md:mt-0 md:text-right">
              <div className="flex flex-wrap md:flex-nowrap items-baseline justify-start md:justify-end gap-2 mb-1">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₦{base.toLocaleString()}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">per night</div>
            </div>
          </div>

          {/* Action Buttons: Book first, then Negotiate (if available) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href={`/book?propertyId=${h.id}&price=${base}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`}
              className="w-full sm:flex-1 text-center py-3 rounded-lg font-medium transition-colors bg-teal-600 text-white hover:bg-teal-700"
            >
              Book Now
            </Link>
            {canNegotiate && (
              <Link 
                href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`}
                className="w-full sm:flex-1 text-center py-3 rounded-lg font-medium transition-colors bg-brand-green text-white hover:bg-brand-dark"
              >
                Negotiate
              </Link>
            )}
            <button className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              ❤️ Save
            </button>
          </div>
        </div>

        {/* end gallery moved above */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Property */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed">{details.description}</p>
            </div>

            {/* Your Dates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your dates</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-600 mb-1">Check-in</div>
                  <div className="font-semibold text-gray-900">{checkIn ? checkInLabel : 'Please select dates'}</div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-600 mb-1">Check-out</div>
                  <div className="font-semibold text-gray-900">{checkOut ? checkOutLabel : 'Please select dates'}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Guests: <span className="font-medium">{adults}</span> adults{Number(children)>0?`, ${children} children`:''}, Rooms: <span className="font-medium">{rooms}</span>
              </div>
            </div>

            {/* Facilities (dynamic per hotel) */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
              {facilityKeys.length > 0 ? (
                <>
                  {/* Popular quick-glance chips */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {POPULAR_KEYS.filter(k => facilityKeys.includes(k as FacilityKey)).map(k => (
                      <span key={k} className="badge">
                        {facilityIcon(k as FacilityKey) || '✔️'} {facilityLabel(k as FacilityKey)}
                      </span>
                    ))}
                  </div>

                  {/* Detailed grouped list */}
                  <div className="space-y-5">
                    {FACILITY_GROUPS.map(group => {
                      const items = group.items.filter(k => facilityKeys.includes(k))
                      if (!items.length) return null
                      return (
                        <div key={group.id}>
                          <h3 className="font-semibold text-gray-900 mb-2">{group.label}</h3>
                          <ul className="list-disc ml-5 text-gray-700">
                            {items.map(k => (
                              <li key={k}>{facilityLabel(k)}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">Facilities information not provided.</div>
              )}
            </div>

            {/* Removed static full facilities block to avoid incorrect info. Facilities now come from per-hotel data. */}

            {/* Property Highlights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property highlights</h2>
              <div className="space-y-2">
                {details.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="text-brand-green mt-1">✨</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    ₦{base.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">per night</div>
              </div>

              <div className="space-y-3">
                <Link 
                  href={`/book?propertyId=${h.id}&price=${base}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`}
                  className="block w-full text-center py-3 rounded-lg font-medium transition-colors bg-teal-600 text-white hover:bg-teal-700"
                >
                  Book Now
                </Link>
                {canNegotiate && (
                  <Link 
                    href={`/negotiate?propertyId=${h.id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`}
                    className="block w-full text-center py-3 rounded-lg font-medium transition-colors bg-brand-green text-white hover:bg-brand-dark"
                  >
                    Negotiate
                  </Link>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  ✨ Free cancellation • No prepayment needed
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property type:</span>
                  <span className="font-medium">{h.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Star rating:</span>
                  <span className="font-medium">{stars} stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
