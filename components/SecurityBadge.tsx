import React from 'react'

interface SecurityBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
  className?: string
}

export default function SecurityBadge({ 
  size = 'sm', 
  variant = 'default',
  className = '' 
}: SecurityBadgeProps) {
  const sizeClasses = {
    sm: 'text-[12px] px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        <svg className={`${iconSizes[size]} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secure Booking</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium ${sizeClasses[size]} ${className}`}>
      <svg className={`${iconSizes[size]} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Secure Booking</span>
    </div>
  )
}