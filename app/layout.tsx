
export const dynamic = 'force-dynamic'

import './globals.css'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
// import Chatbot from '@/components/Chatbot'
// import AIChatbot from '@/components/AIChatbot'
import ClientLayout from '@/components/ClientLayout'
import AuthProvider from '@/components/AuthProvider'
import { CartProvider } from '@/lib/cart-context'
import Analytics from '@/components/Analytics'
import ConsentBanner from '@/components/ConsentBanner'

const inter = Inter({subsets:['latin']})

const base = process.env.NEXT_PUBLIC_BASE_URL
const baseUrl = base && base.trim() !== '' ? base : undefined

export const metadata: Metadata = {
  // metadataBase removed temporarily to unblock deployment
  // metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  title: {
    default: 'Hotelsaver.ng — Save on Hotels & Services',
    template: '%s · Hotelsaver.ng'
  },
  description: 'Negotiate hotel prices & book local services across Nigeria.',
  keywords: ['hotels', 'Nigeria', 'Lagos', 'Abuja', 'Port Harcourt', 'Owerri', 'booking', 'negotiation', 'discount'],
  openGraph: {
    title: 'Hotelsaver.ng — Save on Hotels & Services',
    description: 'Negotiate hotel prices & book local services across Nigeria.',
    url: baseUrl || undefined,
    siteName: 'Hotelsaver.ng',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotelsaver.ng — Save on Hotels & Services',
    description: 'Negotiate hotel prices & book local services across Nigeria.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang='en' className={inter.className}>
      <head>
        {/* Performance hints */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
      </head>
      <body className='min-h-screen bg-gray-50 text-gray-900'>
        {/* Consent-aware analytics: loads only when GA configured and user consent granted */}
        <Analytics />
        <AuthProvider>
          <CartProvider>
            <ClientLayout>{children}</ClientLayout>
            {/* Chatbots disabled per request */}
            <div id="date-picker-portal" style={{ position: 'fixed', zIndex: 999999 }}></div>
            <ConsentBanner />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
