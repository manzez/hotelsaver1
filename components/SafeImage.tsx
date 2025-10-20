'use client'

import { useState, useEffect } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Show loading skeleton until mounted and image loads
  if (!mounted || isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    )
  }

  // If both original and fallback failed, show error placeholder
  if (hasError && imgSrc === fallbackSrc && !isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center`}>
        <div className="text-red-400 text-center">
          <svg className="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <p className="text-xs font-medium">Image unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        width={width}
        height={height}
        style={{
          opacity: isLoading ? 0 : 1,
        }}
      />
    </div>
  )
}