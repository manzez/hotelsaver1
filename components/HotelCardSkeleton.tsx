'use client'

interface HotelCardSkeletonProps {
  count?: number
}

export default function HotelCardSkeleton({ count = 8 }: HotelCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-gray-200"></div>
          
          {/* Content skeleton */}
          <div className="p-4">
            {/* Title skeleton */}
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            
            {/* Location skeleton */}
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            
            {/* Price skeleton */}
            <div className="flex items-baseline justify-between mb-1">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            {/* Nights calculation skeleton */}
            <div className="h-12 mb-4">
              <div className="h-3 bg-gray-200 rounded w-3/4 mt-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}