'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from './UserMenu'

function Header() {
  return (
    <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm'>
      <div className='container h-16 flex items-center gap-6'>
        <Link href='/' className='flex items-center gap-2 text-xl font-bold text-brand-green tracking-tight hover:text-brand-dark transition-colors'>
          <div className='w-7 h-7 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-xs'>
            H
          </div>
          <span>Hotelsaver.ng</span>
        </Link>
          <nav className='ml-auto flex items-center gap-5 text-sm'>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-5">
              <Link href='/#how' className='hover:text-brand-green transition-colors'>How It Works</Link>
              <Link href='/partner' className='hover:text-brand-green transition-colors'>Partner With Us</Link>
              <a href='https://wa.me/2347077775545' target='_blank' className='hover:text-brand-green transition-colors'>Customer Support</a>
              <Link href='/about' className='hover:text-brand-green transition-colors'>About</Link>
            </div>
            
            <UserMenu />
        </nav>
      </div>
    </header>
  )
}

function MobileBottomNav() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-4 py-2">
          <Link href="/" className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-brand-green transition-colors">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          
          <Link 
            href="/auth/signin" 
            className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-brand-green transition-colors"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Account</span>
          </Link>
          
          <button className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-brand-green transition-colors">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5-5M17 17a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Bookings</span>
          </button>
          
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center justify-center py-2 text-xs text-gray-600 hover:text-brand-green transition-colors"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMenu(false)}>
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Menu</h3>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/reviews" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="font-medium text-gray-900">Reviews</span>
              </Link>
              
              <Link 
                href="/about" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-900">About Us</span>
              </Link>
              
              <Link 
                href="/services" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium text-gray-900">Services</span>
              </Link>
              
              <a 
                href="https://wa.me/2347077775545" 
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-gray-900">WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className='container pb-20 md:pb-0'>{children}</main>
      <MobileBottomNav />
      <footer className='mt-16 bg-white border-t border-gray-200'>
        <div className='container py-8'>
          {/* Main Footer Content */}
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-6'>
            
            {/* Company */}
            <div>
              <h4 className='text-gray-900 font-semibold text-sm mb-3'>Company</h4>
              <ul className='space-y-1.5 text-xs'>
                <li><Link href='/about' className='text-gray-600 hover:text-brand-green transition-colors'>About</Link></li>
                <li><Link href='/careers' className='text-gray-600 hover:text-brand-green transition-colors'>Careers</Link></li>
                <li><Link href='/partner' className='text-gray-600 hover:text-brand-green transition-colors'>Partners</Link></li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className='text-gray-900 font-semibold text-sm mb-3'>Explore</h4>
              <ul className='space-y-1.5 text-xs'>
                <li><Link href='/search?city=Lagos' className='text-gray-600 hover:text-brand-green transition-colors'>Lagos Hotels</Link></li>
                <li><Link href='/search?city=Abuja' className='text-gray-600 hover:text-brand-green transition-colors'>Abuja Hotels</Link></li>
                <li><Link href='/services' className='text-gray-600 hover:text-brand-green transition-colors'>Services</Link></li>
                <li><Link href='/food' className='text-gray-600 hover:text-brand-green transition-colors'>Food</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className='text-gray-900 font-semibold text-sm mb-3'>Support</h4>
              <ul className='space-y-1.5 text-xs'>
                <li><a href='https://wa.me/2347077775545' className='text-gray-600 hover:text-brand-green transition-colors'>WhatsApp</a></li>
                <li><a href='tel:+2347077775545' className='text-gray-600 hover:text-brand-green transition-colors'>Phone</a></li>
                <li><a href='mailto:admin@hotelsaver.ng' className='text-gray-600 hover:text-brand-green transition-colors'>Email</a></li>
                <li><span className='text-green-600 text-xs font-medium'>24/7 Available</span></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className='text-gray-900 font-semibold text-sm mb-3'>Legal</h4>
              <ul className='space-y-1.5 text-xs'>
                <li><Link href='/terms' className='text-gray-600 hover:text-brand-green transition-colors'>Terms</Link></li>
                <li><Link href='/privacy' className='text-gray-600 hover:text-brand-green transition-colors'>Privacy</Link></li>
                <li><Link href='/cookies' className='text-gray-600 hover:text-brand-green transition-colors'>Cookies</Link></li>
                <li><Link href='/refund-policy' className='text-gray-600 hover:text-brand-green transition-colors'>Refunds</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className='col-span-2'>
              <h4 className='text-gray-900 font-semibold text-sm mb-3'>Contact Info</h4>
              <div className='space-y-1.5 text-xs text-gray-600'>
                <p>📱 +234 707 777 55 45</p>
                <p>📧 admin@hotelsaver.ng</p>
                <p className='leading-relaxed'>
                  🏢 Suite 3004, Anbeez Plaza<br />
                  Plot 16 Ndola Crescent<br />
                  Wuse Zone 5, FCT, Abuja
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center gap-3'>
            <div className='flex items-center gap-4'>
              <Link href='/' className='flex items-center gap-2 text-base font-bold text-brand-green hover:text-brand-dark transition-colors'>
                <div className='w-5 h-5 bg-brand-green rounded flex items-center justify-center text-white font-bold text-xs'>
                  H
                </div>
                <span>Hotelsaver.ng</span>
              </Link>
              <span className='text-xs text-gray-500'>
                © {new Date().getFullYear()} Hotelsaver Nigeria Limited
              </span>
            </div>
            
            <div className='flex items-center gap-4'>
              <span className='text-xs text-gray-500'>🇳🇬 Made for Nigeria</span>
              <div className='flex items-center gap-2'>
                <a href='https://wa.me/2347077775545' target='_blank' 
                   className='w-6 h-6 bg-brand-green text-white rounded text-xs flex items-center justify-center hover:bg-brand-dark transition-colors'>
                  💬
                </a>
                <a href='tel:+2347077775545'
                   className='w-6 h-6 bg-gray-600 text-white rounded text-xs flex items-center justify-center hover:bg-gray-700 transition-colors'>
                  📞
                </a>
                <a href='mailto:admin@hotelsaver.ng'
                   className='w-6 h-6 bg-gray-600 text-white rounded text-xs flex items-center justify-center hover:bg-gray-700 transition-colors'>
                  📧
                </a>
              </div>
            </div>
          </div>
          
          {/* Legal Notice */}
          <div className='mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center'>
            HotelSaver Nigeria Limited • Registered Office: Suite 3004, Anbeez Plaza, Plot 16 Ndola Crescent, Wuse Zone 5, FCT, Abuja
          </div>
        </div>
      </footer>
    </>
  )
}