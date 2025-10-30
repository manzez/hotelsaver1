'use client'

import { useEffect, useRef, useState } from 'react'
import SafeImage from './SafeImage'

interface Props {
  images: string[]
  altBase: string
  heightClass?: string // e.g., 'h-64'
  // Optional: use a Google Places mobile-only photo for all slides
  mobileQuery?: string
}

export default function MobileImageCarousel({ images = [], altBase, heightClass = 'h-64', mobileQuery }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(0)
  const count = images.length

  const scrollToIndex = (i: number) => {
    if (!containerRef.current) return
    const clamped = Math.max(0, Math.min(count - 1, i))
    const width = containerRef.current.clientWidth
    containerRef.current.scrollTo({ left: clamped * width, behavior: 'smooth' })
    setIndex(clamped)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const width = el.clientWidth || 1
      const i = Math.round(el.scrollLeft / width)
      if (i !== index) setIndex(Math.max(0, Math.min(count - 1, i)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => { el.removeEventListener('scroll', onScroll) }
  }, [count, index])

  if (count === 0) return null

  return (
    <div className={`relative ${heightClass} md:hidden`}>
      {/* Slide track */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth no-scrollbar snap-x snap-mandatory"
      >
        {images.map((src, i) => (
          <div key={i} className="inline-block align-top w-full h-full snap-center">
            <SafeImage
              src={src}
              alt={`${altBase} - Image ${i + 1}`}
              mobileQuery={mobileQuery}
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Left arrow */}
      {count > 1 && (
        <button
          aria-label="Previous image"
          onClick={() => scrollToIndex(index - 1)}
          disabled={index <= 0}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 ${index <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {count > 1 && (
        <button
          aria-label="Next image"
          onClick={() => scrollToIndex(index + 1)}
          disabled={index >= count - 1}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 ${index >= count - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
          {images.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}></span>
          ))}
        </div>
      )}
    </div>
  )
}
