'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import SafeImage from './SafeImage'
import { optimizeImageUrl } from '@/lib/performance-optimizations'

interface Hotel {
  id: string
  name: string
  city: string
  basePriceNGN: number
  stars: number
  images: string[]
  [key: string]: any
}

interface PaginatedHotelListProps {
  hotels: Hotel[]
  itemsPerPage?: number
  checkIn?: string
  checkOut?: string
  adults?: string
  children?: string
  rooms?: string
}

export default function PaginatedHotelList({
  hotels,
  itemsPerPage = 12,
  checkIn,
  checkOut,
  adults,
  children,
  rooms
}: PaginatedHotelListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Reset to first page when hotels change
  useEffect(() => {
    setCurrentPage(1)
  }, [hotels])

  // Calculate pagination
  const totalPages = Math.ceil(hotels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  // Memoize current page hotels to prevent unnecessary re-renders
  const currentHotels = useMemo(() => {
    return hotels.slice(startIndex, endIndex)
  }, [hotels, startIndex, endIndex])

  const handlePageChange = (page: number) => {
    setIsLoading(true)
    setCurrentPage(page)
    
    // Smooth scroll to top of results
    const resultsElement = document.getElementById('hotel-results')
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' })
    }
    
    // Simulate loading delay for better UX
    setTimeout(() => setIsLoading(false), 300)
  }

  const buildBookingUrl = (hotel: Hotel) => {
    const params = new URLSearchParams({
      propertyId: hotel.id,
      ...(checkIn && { checkIn }),
      ...(checkOut && { checkOut }),
      ...(adults && { adults }),
      ...(children && { children }),
      ...(rooms && { rooms })
    })
    return `/negotiate?${params.toString()}`
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  if (hotels.length === 0) {
    return (
      <div id="hotel-results" className="text-center py-12">
        <p className="text-gray-600">No hotels found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div id="hotel-results">
      {/* Results Summary */}
      <div className="mb-6 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, hotels.length)} of {hotels.length} results
        {totalPages > 1 && (
          <span className="ml-2">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      {/* Hotel Grid */}
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
        {currentHotels.map((hotel) => (
          <div key={hotel.id} className="card hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <SafeImage
                src={optimizeImageUrl(hotel.images[0] || '', 400, 80)}
                alt={hotel.name}
                className="w-full h-full object-cover"
                loading="lazy"
                width={400}
                height={300}
              />
              
              {/* Star Rating Overlay */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-medium">{hotel.stars || 4}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{hotel.name}</h3>
                <p className="text-gray-600 text-sm">{hotel.city}</p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-brand-green">
                    ₦{hotel.basePriceNGN.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">per night</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/hotel/${hotel.id}`}
                  className="flex-1 text-center py-2 border border-brand-green text-brand-green text-sm font-medium rounded hover:bg-green-50 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={buildBookingUrl(hotel)}
                  className="flex-1 text-center py-2 bg-brand-green text-white text-sm font-medium rounded hover:bg-brand-dark transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-green hover:bg-green-50'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  page === currentPage
                    ? 'bg-brand-green text-white'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-brand-green hover:bg-green-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}