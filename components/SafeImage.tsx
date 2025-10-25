'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
}

export default function SafeImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80',
  loading = 'lazy',
  width = 800,
  height = 600
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  // Default to not loading so SSR renders an <img> even if hydration is blocked
  const [isLoading, setIsLoading] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      setIsLoading(true) // Reset loading for fallback image
    } else {
      // If even fallback fails, keep loading state false to show placeholder
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        width={width}
        height={height}
      />
      {/* Optional lightweight skeleton overlay while loading (won't block SSR image) */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" aria-hidden="true" />
      )}
      {/* Error placeholder if both images fail */}
      {hasError && imgSrc === fallbackSrc && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="text-red-400 text-center">
            <svg className="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <p className="text-xs font-medium">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  )
}