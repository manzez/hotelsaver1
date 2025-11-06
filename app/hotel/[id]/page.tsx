import { getHotelById } from '@/lib/hotels-source'
import Link from 'next/link'
import { getDiscountFor } from '@/lib/discounts'
import { getFacilitiesFor, facilityLabel, facilityIcon, FACILITY_GROUPS, POPULAR_KEYS, type FacilityKey } from '@/lib/facilities'
import SafeImage from '@/components/SafeImage'
import MobileImageCarousel from '@/components/MobileImageCarousel'
import RoomSelection from '@/components/RoomSelection'
import SecurityBadge from '@/components/SecurityBadge'

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

async function getHotelByIdWithFallback(id: string) {
  // First try the hybrid system
  const h = await getHotelById(id)
  if (h) return h

  // If it's a Places API ID, try to extract city from search params or use default
  if (id.startsWith('places_')) {
    try {
      const { getHotelById: getHybridHotelById } = await import('@/lib/hybrid-hotels')
      const hybridHotel = await getHybridHotelById(id, 'Owerri') // Default to Owerri
      if (hybridHotel) {
        // Convert to HotelShape format
        return {
          id: hybridHotel.id,
          name: hybridHotel.name,
          city: hybridHotel.city,
          type: hybridHotel.type,
          stars: hybridHotel.stars,
          basePriceNGN: hybridHotel.basePriceNGN,
          price: hybridHotel.basePriceNGN,
          images: hybridHotel.images,
          source: hybridHotel.source,
          rating: hybridHotel.rating,
          totalRatings: hybridHotel.totalRatings,
          address: hybridHotel.address,
          amenities: hybridHotel.amenities,
          phoneNumber: hybridHotel.phoneNumber,
          website: hybridHotel.website,
          coordinates: hybridHotel.coordinates,
          placeId: hybridHotel.placeId
        }
      }
    } catch (error) {
      console.error('Error fetching Places API hotel:', error)
    }
  }
  
  return null
}

export default async function HotelDetail({params, searchParams}:{params:{id:string}, searchParams?:Record<string,string|undefined>}){
  const h = await getHotelByIdWithFallback(params.id)
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
        {/* SEO: JSON-LD for Hotel + basic Offer (consent not required) */}
        {(() => {
          try {
            const address = (h as any).address || `${h.city}, Nigeria`
            const aggregateRating = (h as any).rating && (h as any).totalRatings ? {
              "@type": "AggregateRating",
              ratingValue: (h as any).rating,
              reviewCount: (h as any).totalRatings
            } : undefined
            const offer = {
              "@type": "Offer",
              priceCurrency: "NGN",
              price: String(base),
              availability: "https://schema.org/InStock"
            }
            const ld = {
              "@context": "https://schema.org",
              "@type": "Hotel",
              name: h.name,
              address: {
                "@type": "PostalAddress",
                addressLocality: h.city,
                addressCountry: "NG"
              },
              starRating: {
                "@type": "Rating",
                ratingValue: String(stars)
              },
              image: Array.isArray(h.images) ? h.images.slice(0, 5) : [],
              url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/hotel/${h.id}`,
              telephone: (h as any).phoneNumber || undefined,
              description: (hotelDetails[h.id]?.description || hotelDetails["default"].description),
              aggregateRating,
              makesOffer: offer
            }
            return (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
              />
            )
          } catch {
            return null
          }
        })()}
        {/* Image Gallery first (especially for mobile) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {(() => {
            // Get images with priority for Places API photos
            const isPlacesHotel = h.id && h.id.startsWith('places_')
            const rawImages = Array.isArray(h.images) ? h.images : []
            
            let displayImages: string[]
            
            if (isPlacesHotel) {
              // For Places API hotels, prioritize Google Places photos
              const placesPhotos = rawImages.filter((img: string) => 
                typeof img === 'string' && img.includes('maps.googleapis.com')
              )
              const fallbackImages = [
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80'
              ]
              // Use Places photos first, then fallback images to fill remaining slots
              displayImages = [...placesPhotos, ...fallbackImages].slice(0, 5)
            } else {
              // For static hotels, use existing logic with curated fallbacks
              displayImages = rawImages.slice(0, 5)
              if (displayImages.length === 0) {
                displayImages = [
                  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80',
                  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=80',
                  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80',
                  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&auto=format&q=80',
                  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80'
                ]
              }
            }
            
            return (
              <>
                {/* Mobile carousel */}
                <MobileImageCarousel images={displayImages} altBase={h.name} heightClass="h-64" mobileQuery={`${h.name} ${h.city} hotel Nigeria`} />

                {/* Desktop grid */}
                <div className="hidden md:grid md:grid-cols-3 gap-1">
                  {displayImages.map((src: string, i: number) => {
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
                        mobileQuery={`${h.name} ${h.city} hotel Nigeria`}
                        className={`w-full object-cover ${i === 0 ? 'md:col-span-2 h-80' : 'h-40'}`}
                        fallbackSrc={fallbackImages[i] || fallbackImages[0]}
                        loading="lazy"
                      />
                    )
                  })}
                </div>
              </>
            )
          })()}
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
              {/* Location and Rating Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{(h as any).address || `${h.city}, Nigeria`}</span>
                </div>
                
                {/* Google Rating for Places API hotels */}
                {(h as any).rating && (h as any).totalRatings && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span className="font-medium">{(h as any).rating}</span>
                      <span>({((h as any).totalRatings).toLocaleString()} reviews)</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Google Reviews</span>
                  </div>
                )}
                
                {/* Contact Info for Places API hotels */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {(h as any).phoneNumber && (
                    <a href={`tel:${(h as any).phoneNumber}`} className="flex items-center gap-1 hover:text-brand-green">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      {(h as any).phoneNumber}
                    </a>
                  )}
                  {(h as any).website && (
                    <a href={(h as any).website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-green">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                      </svg>
                      Website
                    </a>
                  )}
                </div>
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

        {/* Room Selection Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <RoomSelection 
            hotelId={h.id}
            basePrice={base}
            searchParams={{
              checkIn,
              checkOut,
              adults,
              children,
              rooms
            }}
          />
        </div>

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

            {/* Facilities (Places API amenities or static facilities) */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
              
              {/* Show Places API amenities if available */}
              {(h as any).amenities && (h as any).amenities.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {((h as any).amenities as string[]).map((amenity: string, idx: number) => (
                      <span key={idx} className="badge">
                        ✔️ {amenity}
                      </span>
                    ))}
                  </div>
                  {(h as any).source === 'places_api' && (
                    <div className="text-xs text-gray-500 mt-2">
                      ℹ️ Amenities sourced from Google Places
                    </div>
                  )}
                </div>
              ) : facilityKeys.length > 0 ? (
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

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-500 text-center">
                  ✨ Free cancellation
                </div>
                <SecurityBadge size="sm" />
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
