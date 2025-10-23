'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [loadingTooLong, setLoadingTooLong] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent indefinite spinner if session stays in "loading" too long (e.g., missing providers or dev misconfig)
  useEffect(() => {
    if (status === 'loading') {
      const t = setTimeout(() => setLoadingTooLong(true), 1200)
      return () => clearTimeout(t)
    } else {
      setLoadingTooLong(false)
    }
  }, [status])

  if (status === 'loading') {
    // After ~1.2s, show Sign In to keep UI responsive instead of spinning forever
    if (loadingTooLong) {
      return (
        <button
          onClick={() => signIn()}
          className="text-gray-600 hover:text-brand-green transition-colors font-medium"
        >
          Sign In
        </button>
      )
    }
    return (
      <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
    )
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn()}
        className="text-gray-600 hover:text-brand-green transition-colors font-medium"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {session?.user?.name?.charAt(0)?.toUpperCase() || 
           session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            Hello, {session?.user?.name?.split(' ')[0] || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {session?.user?.email}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 
                 session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-sm text-gray-500">
                  {session?.user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link 
              href="/bookings"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              My Bookings
            </Link>

            <Link 
              href="/favorites"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Saved Hotels
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-2">
            <div className="px-4 py-2 mb-2">
              <div className="text-xs text-gray-500">🇳🇬 Member benefits active</div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}