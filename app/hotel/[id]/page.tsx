import { getHotelById } from '@/lib/hotels-source'
import Link from 'next/link'
import { getDiscountFor } from '@/lib/discounts'
import SafeImage from '@/components/SafeImage'

// Hotel descriptions and amenities data
const hotelDetails: { [key: string]: { description: string; amenities: string[]; highlights: string[] } } = {
  "protea-hotel-owerri-owerri": {
    description: "This premium 4-star hotel is located in the heart of Owerri, the capital city of Imo State. It offers luxurious accommodations with modern amenities and exceptional service. The hotel is conveniently situated near major shopping centers, business districts, and cultural attractions. Guests enjoy complimentary WiFi, 24-hour room service, and access to our fitness center.",
    amenities: ["Free WiFi", "24-hour Front Desk", "Fitness Centre", "Restaurant", "Room Service", "Air Conditioning", "Business Center", "Laundry Service", "Airport Shuttle", "Parking"],
    highlights: ["Perfect for business travelers", "Family-friendly environment", "Central location in Owerri", "Highly rated by couples (9.2/10)"]
  },
  "bon-hotel-nest-owerri-owerri": {
    description: "BON Hotel Nest Owerri is a contemporary 4-star hotel offering world-class hospitality in the vibrant city of Owerri. Our hotel combines modern luxury with traditional Nigerian warmth, providing guests with an unforgettable experience. Located minutes away from major attractions and business centers, we cater to both leisure and business travelers.",
    amenities: ["Free WiFi", "Swimming Pool", "Spa Services", "Restaurant & Bar", "Conference Rooms", "Gym", "24-hour Security", "Room Service", "Concierge", "Free Parking"],
    highlights: ["Award-winning restaurant", "Rooftop pool with city views", "State-of-the-art conference facilities", "Popular with international guests"]
  },
  "immaculate-royal-hotel-owerri": {
    description: "Immaculate Royal Hotel offers comfortable and affordable accommodation in Owerri. This 3-star hotel provides excellent value for money while maintaining high standards of cleanliness and service. Perfect for budget-conscious travelers who don't want to compromise on comfort and convenience.",
    amenities: ["Free WiFi", "Restaurant", "24-hour Front Desk", "Air Conditioning", "Room Service", "Laundry", "Airport Transfer", "Business Services", "Safe Deposit Box", "Wake-up Service"],
    highlights: ["Excellent value for money", "Family-friendly", "Central location", "Popular breakfast buffet"]
  },
  "default": {
    description: "This exceptional hotel offers premium accommodations in one of Nigeria's most vibrant cities. Our property combines modern luxury with traditional hospitality, ensuring every guest enjoys a memorable stay. Located in a prime area with easy access to business districts, shopping centers, and cultural attractions.",
    amenities: ["Free WiFi", "24-hour Front Desk", "Restaurant", "Air Conditioning", "Room Service", "Fitness Centre", "Business Center", "Laundry Service", "Concierge", "Parking"],
    highlights: ["Prime location", "Modern facilities", "Excellent service", "Perfect for all travelers"]
  }
}

export default async function HotelDetail({params}:{params:{id:string}}){
  const h = await getHotelById(params.id)
  if (!h) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h1>
      <p className="text-gray-600 mb-8">The hotel you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </div>
  )

  const details = hotelDetails[h.id] || hotelDetails["default"]
  const discount = getDiscountFor(h.id)
  const canNegotiate = discount > 0
  const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price! : 0)
  const discountedPrice = canNegotiate ? Math.round(base * (1 - discount)) : base
  const savings = base - discountedPrice
  const stars = typeof (h as any).stars === 'number' ? (h as any).stars : 4

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{h.name}</h1>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-amber-400 text-lg">{"★".repeat(stars)}{"☆".repeat(5-stars)}</div>
                <span className="text-gray-600">{stars}-star {h.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{h.city}, Nigeria</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-bold ${canNegotiate ? 'text-brand-green' : 'text-gray-900'}`}>
                  ₦{discountedPrice.toLocaleString()}
                </span>
                {canNegotiate && base > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    ₦{base.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">per night</div>
              {canNegotiate && (
                <div className="text-sm text-green-600 font-medium">Save ₦{savings.toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link 
              href={canNegotiate ? `/negotiate?propertyId=${h.id}` : `/book?propertyId=${h.id}&price=${discountedPrice}`}
              className={`flex-1 text-center py-3 rounded-lg font-medium transition-colors ${
                canNegotiate 
                  ? 'bg-brand-green text-white hover:bg-brand-dark' 
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              {canNegotiate ? 'Negotiate Now' : 'Book Now'}
            </Link>
            <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              ❤️ Save
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="grid md:grid-cols-3 gap-1">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Property */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed">{details.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Most popular facilities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {details.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-brand-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

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
                  <span className={`text-2xl font-bold ${canNegotiate ? 'text-brand-green' : 'text-gray-900'}`}>
                    ₦{discountedPrice.toLocaleString()}
                  </span>
                  {canNegotiate && base > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    ₦{base.toLocaleString()}
                  </span>
                )}
                </div>
                <div className="text-sm text-gray-600">per night</div>
                {canNegotiate && (
                  <div className="text-sm font-medium text-green-600">
                    {Math.round(discount * 100)}% discount available
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Link 
                  href={canNegotiate ? `/negotiate?propertyId=${h.id}` : `/book?propertyId=${h.id}&price=${discountedPrice}`}
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                    canNegotiate 
                      ? 'bg-brand-green text-white hover:bg-brand-dark' 
                      : 'bg-gray-700 text-white hover:bg-gray-800'
                  }`}
                >
                  {canNegotiate ? 'Negotiate' : 'Book Now'}
                </Link>
                
                {canNegotiate && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Or book at regular price</div>
                    <Link 
                      href={`/book?propertyId=${h.id}&price=${base}`}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Book for ₦{base.toLocaleString()}
                    </Link>
                  </div>
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
