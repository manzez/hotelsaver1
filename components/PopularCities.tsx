'use client'

import Link from 'next/link'
import SafeImage from '@/components/SafeImage'

interface CityData {
  name: string
  description: string
  hotelCount: number
  image: string
  searchUrl: string
  featured5StarHotel: {
    name: string
    image: string
    stars: number
    priceFrom: number
  }
  featured4StarHotel: {
    name: string
    image: string
    stars: number
    priceFrom: number
  }
}

const cities: CityData[] = [
  {
    name: 'Lagos',
    description: 'Commercial hub with luxury hotels and business centers',
    hotelCount: 150,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&auto=format&q=80',
    searchUrl: '/search?city=Lagos&budget=200p&stayType=hotel',
    featured5StarHotel: {
      name: 'Lagos Marriott Hotel Ikeja',
      image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=AWn5SU7Eq_5z35-O2GgFZTWbRJtg_48976LG86vbeXkxdpWRZgrlB2s9lchDurC7cCwGHrIVpghqusQ_qsJtyPLE5T8CKww9AztgKcauCAk7rvZzCb53lpivkWxRG6OaPBVqeYZgyrYehqczBErRQKi35QIR5NRjdLxbmNZL4qE7uxzXuTcaFW9SduzLDdbsuiFBIWQRo8r3tubJwKdgLQ3Ys4ugj3ykF9aZUnJaoWqv-RAPSZihsuO7AKMlHkHnB91gZrNSgP2jHSOzXCCZvFlQuBkhENQ43wpQJWCUiH3urSNITw&key=AIzaSyAZyBiJ4AMsGsnUbIS6tsg-9iUbQpx-fRw',
      stars: 5,
      priceFrom: 149000
    },
    featured4StarHotel: {
      name: 'Protea Hotel Owerri',
      image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=AWn5SU51N3THg_3095mZim2DVT1mUgNyPyuJw4X9NLFXPugiNX1-Z3nsB7jQuK819ESsW4AE8y3RCH8UhWSLqOzgQKIfpemFrTt9-kW6oOFp5-95W4VRoyHBvyCDhEHNBWQq-vQw0VBRY1b1koAc7Qx4jvOLjzhAAfFn_w5sqVx0cJ-UkOVxQAnluxvysnO2HP7C5ZQ1VdEiZ1LWaYY4JvIHIC-S6cX3mn7YwagGezUpYmi2W2RODqTWUjhQ85s7BFNyq576Kg5bCEVF5xmT5R3W2JPln9cw7F0oGzDL3mnuyVkWrQ&key=AIzaSyAZyBiJ4AMsGsnUbIS6tsg-9iUbQpx-fRw',
      stars: 4,
      priceFrom: 92000
    }
  },
  {
    name: 'Abuja',
    description: 'Federal capital with premium hotels for government & business',
    hotelCount: 80,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop&auto=format&q=80',
    searchUrl: '/search?city=Abuja&budget=200p&stayType=hotel',
    featured5StarHotel: {
      name: 'Transcorp Hilton Abuja',
      image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=AWn5SU5Yz7TVKxL7x-zJm2beqjJ5bsi5ohBnH-JJwh3mcoxI4Jur3NodN890HSDpXCtiFXtq7fcIiGY-4gyKcaq_LvRBeBfL9DKMQ-Nwlqf0Vw0Yau6h316Dm2DQXMckz13bumx-N0FD9h6VLDp7UrTedFGD7nv7vseJO1eVTqW2FnrKkEsFl9dh0LiQOF0ncQ9odqcXKrtWBBRiOD7_LoFIt5eh3Y8i9vZkkvezeOWcr0bQiRQGGpUjXrr5NY3m_V7EAdaBcR24jQ5YomYpy7tDlAWADhk9R66AEAO5qFz4buejwA&key=AIzaSyAZyBiJ4AMsGsnUbIS6tsg-9iUbQpx-fRw',
      stars: 5,
      priceFrom: 188000
    },
    featured4StarHotel: {
      name: 'BON Hotel Abuja',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=300&fit=crop&auto=format&q=80',
      stars: 4,
      priceFrom: 85000
    }
  },
  {
    name: 'Port Harcourt',
    description: 'Oil city with modern hotels serving international business',
    hotelCount: 60,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&auto=format&q=80',
    searchUrl: '/search?city=Port Harcourt&budget=130_200&stayType=hotel',
    featured5StarHotel: {
      name: 'Hotel Presidential Port Harcourt',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=300&fit=crop&auto=format&q=80',
      stars: 5,
      priceFrom: 145000
    },
    featured4StarHotel: {
      name: 'Le Meridien Ogeyi Place',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=300&fit=crop&auto=format&q=80',
      stars: 4,
      priceFrom: 110000
    }
  },
  {
    name: 'Owerri',
    description: 'Growing hospitality sector with quality business hotels',
    hotelCount: 45,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop&auto=format&q=80',
    searchUrl: '/search?city=Owerri&budget=80_130&stayType=hotel',
    featured5StarHotel: {
      name: 'Rockview Hotels Owerri',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=300&fit=crop&auto=format&q=80',
      stars: 5,
      priceFrom: 125000
    },
    featured4StarHotel: {
      name: 'Protea Hotel Owerri',
      image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=AWn5SU51N3THg_3095mZim2DVT1mUgNyPyuJw4X9NLFXPugiNX1-Z3nsB7jQuK819ESsW4AE8y3RCH8UhWSLqOzgQKIfpemFrTt9-kW6oOFp5-95W4VRoyHBvyCDhEHNBWQq-vQw0VBRY1b1koAc7Qx4jvOLjzhAAfFn_w5sqVx0cJ-UkOVxQAnluxvysnO2HP7C5ZQ1VdEiZ1LWaYY4JvIHIC-S6cX3mn7YwagGezUpYmi2W2RODqTWUjhQ85s7BFNyq576Kg5bCEVF5xmT5R3W2JPln9cw7F0oGzDL3mnuyVkWrQ&key=AIzaSyAZyBiJ4AMsGsnUbIS6tsg-9iUbQpx-fRw',
      stars: 4,
      priceFrom: 92000
    }
  }
]

const StarDisplay = ({ stars }: { stars: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-gray-600 ml-1">{stars}-Star</span>
  </div>
)

export default function PopularCities() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Popular Cities
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Most popular choices for travellers in Nigeria - featuring our best 4 & 5 star hotels
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div key={city.name} className="group">
              {/* Main City Card */}
              <Link 
                href={city.searchUrl}
                className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:transform group-hover:-translate-y-1"
              >
                {/* City Image */}
                <div className="relative h-48 overflow-hidden">
                  <SafeImage
                    src={city.image}
                    alt={`Luxury hotels in ${city.name}`}
                    mobileQuery={`${city.name} skyline Nigeria hotel`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&auto=format&q=60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* City Name Overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                    <p className="text-sm text-white/90">{city.hotelCount}+ hotels</p>
                  </div>
                </div>

                {/* City Info */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {city.description}
                  </p>
                </div>
              </Link>

              {/* Featured Hotels Row */}
              <div className="mt-4 space-y-3">
                {/* 5-Star Hotel */}
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={city.featured5StarHotel.image}
                        alt={city.featured5StarHotel.name}
                        mobileQuery={`${city.featured5StarHotel.name} ${city.name} hotel Nigeria`}
                        className="w-full h-full object-cover"
                        fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=200&h=150&fit=crop&auto=format&q=60"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {city.featured5StarHotel.name}
                      </h4>
                      <StarDisplay stars={city.featured5StarHotel.stars} />
                      <p className="text-xs text-brand-green font-medium">
                        From ₦{city.featured5StarHotel.priceFrom.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4-Star Hotel */}
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <SafeImage
                        src={city.featured4StarHotel.image}
                        alt={city.featured4StarHotel.name}
                        mobileQuery={`${city.featured4StarHotel.name} ${city.name} hotel Nigeria`}
                        className="w-full h-full object-cover"
                        fallbackSrc="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=150&fit=crop&auto=format&q=60"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {city.featured4StarHotel.name}
                      </h4>
                      <StarDisplay stars={city.featured4StarHotel.stars} />
                      <p className="text-xs text-brand-green font-medium">
                        From ₦{city.featured4StarHotel.priceFrom.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <Link 
            href="/search" 
            className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors font-medium"
          >
            Explore All Cities
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}