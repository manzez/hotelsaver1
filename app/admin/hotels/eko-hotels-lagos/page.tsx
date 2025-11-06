'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct hotel ID
    router.replace('/admin/hotels/eko-hotel-and-suites-lagos')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
        <p>Redirecting to correct hotel page...</p>
      </div>
    </div>
  )
}