'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  type: string
}

function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [loading, setLoading] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    setLoading(providerId)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading('')
    }
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#405DE6"/>
                <stop offset="25%" stopColor="#5B51D8"/>
                <stop offset="50%" stopColor="#833AB4"/>
                <stop offset="75%" stopColor="#C13584"/>
                <stop offset="100%" stopColor="#E1306C"/>
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      default:
        return null
    }
  }

  const getProviderColor = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
      case 'facebook':
        return 'bg-[#1877F2] text-white hover:bg-[#166FE5]'
      case 'instagram':
        return 'bg-gradient-to-r from-[#405DE6] via-[#833AB4] to-[#E1306C] text-white hover:from-[#3A56DB] hover:via-[#7A35A8] hover:to-[#D62D64]'
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brand-green">
              🏨 Hotelsaver.ng
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">
            Sign in to access exclusive Nigerian hotel deals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {error === 'OAuthSignin' && 'Error occurred during sign in. Please try again.'}
              {error === 'OAuthCallback' && 'Error occurred during callback. Please try again.'}
              {error === 'OAuthCreateAccount' && 'Could not create account. Please try again.'}
              {error === 'EmailCreateAccount' && 'Could not create account. Please try again.'}
              {error === 'Callback' && 'Error occurred during callback. Please try again.'}
              {error === 'OAuthAccountNotLinked' && 'Account already exists with different provider.'}
              {error === 'EmailSignin' && 'Check your email for the sign in link.'}
              {error === 'CredentialsSignin' && 'Invalid credentials. Please check and try again.'}
              {error === 'default' && 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            {providers && Object.values(providers).map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSignIn(provider.id)}
                disabled={loading === provider.id}
                className={`
                  w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold
                  transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]
                  focus:outline-none focus:ring-4 focus:ring-opacity-50
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  ${getProviderColor(provider.id)}
                  ${provider.id === 'google' ? 'focus:ring-gray-300' : 
                    provider.id === 'facebook' ? 'focus:ring-blue-300' : 'focus:ring-pink-300'}
                `}
              >
                {loading === provider.id ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  getProviderIcon(provider.id)
                )}
                <span>
                  {loading === provider.id 
                    ? 'Signing in...' 
                    : `Continue with ${provider.name}`
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🇳🇬 Sign in to unlock:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Exclusive discounts up to 25% off
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Priority booking for Lagos & Abuja hotels
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Save favorite hotels & services
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Access to members-only deals
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-brand-green hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-green hover:underline">
              Privacy Policy
            </Link>
          </p>
          <div className="mt-4">
            <Link 
              href="/"
              className="text-sm text-gray-500 hover:text-brand-green transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper component with suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-green to-brand-dark flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading sign in...</p>
        </div>
      </div>
    }>
      <SignIn />
    </Suspense>
  )
}