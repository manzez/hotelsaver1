'use client'

import { signOut } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'

export default function SignOut() {
  useEffect(() => {
    // Auto sign out after 3 seconds
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/' })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleSignOutNow = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brand-green">
              🏨 HotelSaver.ng
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Signing you out...
          </h2>
          <p className="text-gray-600">
            Thank you for using HotelSaver.ng
          </p>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">
              You're being signed out securely. You'll be redirected to the homepage in a few seconds.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignOutNow}
              className="w-full bg-brand-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Sign Out Now
            </button>
            
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🇳🇬 Thank you for choosing HotelSaver.ng!
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Your data is secure and protected
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Sign in anytime for exclusive deals
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Follow us for latest Nigerian hotel offers
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Safe travels! We hope to see you again soon.
          </p>
        </div>
      </div>
    </div>
  )
}