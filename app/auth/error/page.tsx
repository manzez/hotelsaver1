'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          action: 'Contact Support'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in. This may be due to account restrictions.',
          action: 'Try Different Account'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or has already been used.',
          action: 'Request New Link'
        }
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
        return {
          title: 'Authentication Provider Error',
          description: 'There was an error communicating with the authentication provider. Please try again.',
          action: 'Try Again'
        }
      case 'EmailCreateAccount':
        return {
          title: 'Account Creation Error',
          description: 'Could not create an account with this email address.',
          action: 'Try Different Email'
        }
      case 'Callback':
        return {
          title: 'Callback Error',
          description: 'There was an error during the authentication callback.',
          action: 'Start Over'
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Already Exists',
          description: 'An account with this email already exists but is linked to a different provider.',
          action: 'Use Different Provider'
        }
      case 'EmailSignin':
        return {
          title: 'Email Sign In Error',
          description: 'Unable to send email. Please check your email address and try again.',
          action: 'Check Email'
        }
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          description: 'The credentials you provided are not valid. Please check and try again.',
          action: 'Try Again'
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication. Please try again.',
          action: 'Try Again'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brand-green">
              🏨 HotelSaver.ng
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600">
            We encountered an issue during sign in
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {errorInfo.description}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full bg-brand-green text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-brand-dark transition-colors"
            >
              {errorInfo.action}
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Error Details */}
          {error && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-mono text-xs">
                    Error Code: {error}
                  </p>
                </div>
              </details>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🇳🇬 Need Help?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">📧</span>
                Contact support: support@hotelsaver.ng
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">💬</span>
                WhatsApp: +234 123 456 7890
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">❓</span>
                Check our FAQ for common issues
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            If the problem persists, please contact our support team
          </p>
        </div>
      </div>
    </div>
  )
}

// Wrapper component with suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading error page...</p>
        </div>
      </div>
    }>
      <AuthError />
    </Suspense>
  )
}