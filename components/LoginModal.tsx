'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleSignIn = () => {
    onClose()
    router.push('/auth/signin')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to HotelSaver.ng
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Sign in to unlock exclusive deals and manage your bookings
          </p>

          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full btn-primary py-3 text-lg font-semibold"
            >
              Sign In
            </button>

            <div className="text-sm text-gray-500">
              🇳🇬 Nigerian hotel deals • Instant negotiation • Secure booking
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}