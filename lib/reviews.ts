// Service Reviews System
// Handles customer reviews, ratings, photo uploads, and provider responses

export interface ServiceReview {
  id: string
  serviceId: string
  serviceName: string
  customerId: string
  customerName: string
  customerEmail: string
  rating: number // 1-5 stars
  title: string
  content: string
  photos: string[] // URLs to uploaded photos
  eventDate: string
  reviewDate: string
  verified: boolean // Verified booking
  helpful: number // Helpful votes
  
  // Detailed ratings
  ratings: {
    quality: number
    punctuality: number
    communication: number
    value: number
    professionalism: number
  }
  
  // Provider response
  providerResponse?: {
    responseDate: string
    content: string
    providerName: string
  }
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
}

export interface ReviewSummary {
  serviceId: string
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  aspectRatings: {
    quality: number
    punctuality: number
    communication: number
    value: number
    professionalism: number
  }
  recentReviews: ServiceReview[]
  totalPhotos: number
  verifiedReviews: number
}

// Sample reviews for demonstration
export const SAMPLE_REVIEWS: ServiceReview[] = [
  {
    id: 'rev-001',
    serviceId: 'canopy-tent-hire',
    serviceName: 'Canopy Tent Hire',
    customerId: 'cust-001',
    customerName: 'Adebayo Johnson',
    customerEmail: 'adebayo@email.com',
    rating: 5,
    title: 'Excellent service for our wedding!',
    content: 'The canopy tent was exactly what we needed for our outdoor wedding ceremony. The team arrived on time, set up everything perfectly, and the quality was top-notch. Our guests were well protected from the sun, and the tent looked beautiful in our photos. Highly recommend!',
    photos: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop'
    ],
    eventDate: '2024-10-15',
    reviewDate: '2024-10-18',
    verified: true,
    helpful: 12,
    ratings: {
      quality: 5,
      punctuality: 5,
      communication: 4,
      value: 5,
      professionalism: 5
    },
    providerResponse: {
      responseDate: '2024-10-19',
      content: 'Thank you so much for the wonderful review, Adebayo! We were delighted to be part of your special day. Congratulations on your wedding, and we wish you both a lifetime of happiness together!',
      providerName: 'Lagos Events Central'
    },
    status: 'approved'
  },
  {
    id: 'rev-002',
    serviceId: 'plastic-chair-hire',
    serviceName: 'Plastic Chair Hire',
    customerId: 'cust-002',
    customerName: 'Funmi Okafor',
    customerEmail: 'funmi@email.com',
    rating: 4,
    title: 'Good chairs, minor delay in delivery',
    content: 'The chairs were clean and in good condition. Perfect for our family gathering. Only downside was they arrived about 30 minutes later than scheduled, but the team apologized and set up quickly. Overall satisfied with the service.',
    photos: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
    ],
    eventDate: '2024-10-12',
    reviewDate: '2024-10-14',
    verified: true,
    helpful: 8,
    ratings: {
      quality: 4,
      punctuality: 3,
      communication: 4,
      value: 4,
      professionalism: 4
    },
    status: 'approved'
  },
  {
    id: 'rev-003',
    serviceId: 'sound-system-hire',
    serviceName: 'Sound System Hire',
    customerId: 'cust-003',
    customerName: 'Chidi Amaechi',
    customerEmail: 'chidi@email.com',
    rating: 5,
    title: 'Crystal clear sound quality!',
    content: 'Amazing sound system for our corporate event. The audio was crystal clear throughout the venue, and the technician was very helpful in setting up our microphones and music playlist. Professional service from start to finish.',
    photos: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop'
    ],
    eventDate: '2024-10-10',
    reviewDate: '2024-10-11',
    verified: true,
    helpful: 15,
    ratings: {
      quality: 5,
      punctuality: 5,
      communication: 5,
      value: 4,
      professionalism: 5
    },
    providerResponse: {
      responseDate: '2024-10-12',
      content: 'Thank you for choosing our sound system services, Chidi! We\'re thrilled that everything went smoothly for your corporate event. We pride ourselves on delivering professional audio solutions.',
      providerName: 'Abuja Premium Services'
    },
    status: 'approved'
  }
]

/**
 * Get reviews for a specific service
 */
export function getServiceReviews(serviceId: string): ServiceReview[] {
  return SAMPLE_REVIEWS.filter(review => 
    review.serviceId === serviceId && review.status === 'approved'
  ).sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
}

/**
 * Calculate review summary for a service
 */
export function getReviewSummary(serviceId: string): ReviewSummary {
  const reviews = getServiceReviews(serviceId)
  
  if (reviews.length === 0) {
    return {
      serviceId,
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      aspectRatings: {
        quality: 0,
        punctuality: 0,
        communication: 0,
        value: 0,
        professionalism: 0
      },
      recentReviews: [],
      totalPhotos: 0,
      verifiedReviews: 0
    }
  }
  
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
  
  // Rating distribution
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++
  })
  
  // Aspect ratings
  const aspectRatings = {
    quality: reviews.reduce((sum, r) => sum + r.ratings.quality, 0) / totalReviews,
    punctuality: reviews.reduce((sum, r) => sum + r.ratings.punctuality, 0) / totalReviews,
    communication: reviews.reduce((sum, r) => sum + r.ratings.communication, 0) / totalReviews,
    value: reviews.reduce((sum, r) => sum + r.ratings.value, 0) / totalReviews,
    professionalism: reviews.reduce((sum, r) => sum + r.ratings.professionalism, 0) / totalReviews
  }
  
  const totalPhotos = reviews.reduce((sum, review) => sum + review.photos.length, 0)
  const verifiedReviews = reviews.filter(review => review.verified).length
  
  return {
    serviceId,
    totalReviews,
    averageRating,
    ratingDistribution,
    aspectRatings,
    recentReviews: reviews.slice(0, 5),
    totalPhotos,
    verifiedReviews
  }
}

/**
 * Format rating for display
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Get rating color class
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4.0) return 'text-green-500'
  if (rating >= 3.5) return 'text-yellow-500'
  if (rating >= 3.0) return 'text-yellow-600'
  return 'text-red-500'
}

/**
 * Generate star display
 */
export function getStarDisplay(rating: number): { filled: number; half: boolean; empty: number } {
  const filled = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - filled - (half ? 1 : 0)
  
  return { filled, half, empty }
}

/**
 * Calculate review helpfulness score
 */
export function calculateHelpfulness(helpful: number, total: number = 20): number {
  if (total === 0) return 0
  return (helpful / total) * 100
}

/**
 * Sort reviews by different criteria
 */
export function sortReviews(
  reviews: ServiceReview[], 
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
): ServiceReview[] {
  const sorted = [...reviews]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime())
    case 'highest':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'lowest':
      return sorted.sort((a, b) => a.rating - b.rating)
    case 'helpful':
      return sorted.sort((a, b) => b.helpful - a.helpful)
    default:
      return sorted
  }
}

/**
 * Filter reviews by rating
 */
export function filterReviewsByRating(reviews: ServiceReview[], rating: number): ServiceReview[] {
  return reviews.filter(review => review.rating === rating)
}

/**
 * Get all photos from reviews
 */
export function getReviewPhotos(serviceId: string): string[] {
  const reviews = getServiceReviews(serviceId)
  return reviews.flatMap(review => review.photos)
}

/**
 * Validate review submission
 */
export function validateReview(review: Partial<ServiceReview>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.push('Rating must be between 1 and 5 stars')
  }
  
  if (!review.title || review.title.trim().length < 5) {
    errors.push('Review title must be at least 5 characters')
  }
  
  if (!review.content || review.content.trim().length < 20) {
    errors.push('Review content must be at least 20 characters')
  }
  
  if (!review.customerName || review.customerName.trim().length < 2) {
    errors.push('Customer name is required')
  }
  
  if (!review.customerEmail || !review.customerEmail.includes('@')) {
    errors.push('Valid email address is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}