'use client'
import { useState } from 'react'
import SafeImage from '@/components/SafeImage'
import { 
  type ServiceReview, 
  getServiceReviews, 
  getReviewSummary,
  formatRating,
  getRatingColor,
  getStarDisplay,
  sortReviews,
  filterReviewsByRating
} from '@/lib/reviews'

interface ServiceReviewsProps {
  serviceId: string
  serviceName: string
  reviews?: ServiceReview[]
}

export default function ServiceReviews({ serviceId, serviceName, reviews: propReviews }: ServiceReviewsProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showPhotos, setShowPhotos] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string>('')

  const allReviews = propReviews || getServiceReviews(serviceId)
  const summary = getReviewSummary(serviceId)
  
  // Apply filters and sorting
  let displayedReviews = filterRating 
    ? filterReviewsByRating(allReviews, filterRating)
    : allReviews
  displayedReviews = sortReviews(displayedReviews, sortBy)

  // Star component
  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' | 'md' }) => {
    const { filled, half, empty } = getStarDisplay(rating)
    const starSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    
    return (
      <div className="flex items-center gap-0.5">
        {Array(filled).fill(0).map((_, i) => (
          <svg key={`filled-${i}`} className={`${starSize} text-yellow-400 fill-current`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {half && (
          <svg className={`${starSize} text-yellow-400`} viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-fill">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {Array(empty).fill(0).map((_, i) => (
          <svg key={`empty-${i}`} className={`${starSize} text-gray-300`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (summary.totalReviews === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-4xl mb-2">⭐</div>
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-4">
          Be the first to review {serviceName}! Your feedback helps other customers make informed decisions.
        </p>
        <button className="btn btn-primary">
          Write First Review
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getRatingColor(summary.averageRating)}`}>
              {formatRating(summary.averageRating)}
            </div>
            <StarRating rating={summary.averageRating} size="md" />
            <p className="text-gray-600 mt-2">
              Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {summary.verifiedReviews} verified • {summary.totalPhotos} photos
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution]
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aspect Ratings */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Detailed Ratings</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {Object.entries(summary.aspectRatings).map(([aspect, rating]) => (
              <div key={aspect} className="text-center">
                <div className={`font-bold ${getRatingColor(rating)}`}>
                  {formatRating(rating)}
                </div>
                <div className="text-gray-600 capitalize">{aspect}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter:</label>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-2 py-1 text-xs rounded ${
                filterRating === null ? 'bg-brand-green text-white' : 'bg-white border'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-2 py-1 text-xs rounded ${
                  filterRating === rating ? 'bg-brand-green text-white' : 'bg-white border'
                }`}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        {summary.totalPhotos > 0 && (
          <button
            onClick={() => setShowPhotos(!showPhotos)}
            className="btn btn-ghost text-sm"
          >
            📷 View All Photos ({summary.totalPhotos})
          </button>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {displayedReviews.map(review => (
          <div key={review.id} className="card p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-semibold">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{review.customerName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.reviewDate).toLocaleDateString()}
                      {review.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium">{review.title}</span>
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <div>Event: {new Date(review.eventDate).toLocaleDateString()}</div>
                <button className="text-gray-400 hover:text-gray-600 mt-1">
                  👍 {review.helpful}
                </button>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4">{review.content}</p>

            {/* Review Photos */}
            {review.photos.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(photo)}
                    className="w-20 h-20 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <SafeImage
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Detailed Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 text-xs">
              {Object.entries(review.ratings).map(([aspect, rating]) => (
                <div key={aspect} className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{rating}/5</div>
                  <div className="text-gray-600 capitalize">{aspect}</div>
                </div>
              ))}
            </div>

            {/* Provider Response */}
            {review.providerResponse && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    P
                  </div>
                  <div className="font-medium text-blue-900">
                    Response from {review.providerResponse.providerName}
                  </div>
                  <div className="text-xs text-blue-600">
                    {new Date(review.providerResponse.responseDate).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-blue-800 text-sm">{review.providerResponse.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto('')}
        >
          <div className="max-w-4xl max-h-full">
            <SafeImage
              src={selectedPhoto}
              alt="Review photo"
              className="max-w-full max-h-full object-contain rounded-lg"
              fallbackSrc=""
            />
          </div>
        </div>
      )}

      {/* Write Review Button */}
      <div className="text-center">
        <button className="btn btn-primary">
          Write a Review
        </button>
      </div>
    </div>
  )
}