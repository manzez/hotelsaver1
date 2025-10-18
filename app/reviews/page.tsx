import BackButton from '@/components/BackButton'

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: "Chioma Adebayo",
      city: "Lagos",
      rating: 5,
      hotel: "Eko Hotel & Suites",
      comment: "Amazing negotiation experience! Saved ₦45,000 on my 3-night stay. The hotel was exactly as described and the service was excellent.",
      date: "2 weeks ago",
      verified: true
    },
    {
      id: 2,
      name: "Ibrahim Mohammed",
      city: "Abuja",
      rating: 4,
      hotel: "Transcorp Hilton",
      comment: "Good experience with HotelSaver. Got a decent discount and the booking process was smooth. Will use again.",
      date: "1 month ago",
      verified: true
    },
    {
      id: 3,
      name: "Grace Okafor",
      city: "Port Harcourt",
      rating: 5,
      hotel: "Hotel Presidential",
      comment: "Excellent service! The negotiation feature is brilliant. Saved money and got a great room. Highly recommended!",
      date: "3 weeks ago",
      verified: true
    },
    {
      id: 4,
      name: "Yusuf Tanko",
      city: "Lagos",
      rating: 4,
      hotel: "Lagos Continental Hotel",
      comment: "Very satisfied with the service. The hotel was clean and comfortable. The discount made it affordable for my business trip.",
      date: "1 week ago",
      verified: true
    },
    {
      id: 5,
      name: "Folake Adewale",
      city: "Lagos",
      rating: 5,
      hotel: "Four Points by Sheraton",
      comment: "Outstanding experience! The customer support via WhatsApp was very helpful. Will definitely book again through HotelSaver.",
      date: "4 days ago",
      verified: true
    }
  ]

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600">See what our customers say about HotelSaver.ng</p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-green">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-600">Based on {reviews.length} reviews</div>
          </div>
          
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length
                const percentage = (count / reviews.length) * 100
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-12">{rating} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center font-bold">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{review.name}</h3>
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{review.city} • {review.date}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <span className="font-medium text-brand-green">{review.hotel}</span>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Write Review CTA */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Experience</h2>
        <p className="text-gray-600 mb-6">
          Have you stayed at a hotel through HotelSaver.ng? We'd love to hear about your experience!
        </p>
        <a 
          href="https://wa.me/2347077775545" 
          target="_blank"
          className="bg-brand-green text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
        >
          <span>📝</span>
          Share Your Review via WhatsApp
        </a>
      </div>
    </div>
  )
}