'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthProvider, useAuth } from './AuthProvider'
import LoginModal from './LoginModal'

function Header() {
  const { user, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm'>
        <div className='container h-16 flex items-center gap-6'>
          <Link href='/' className='text-2xl font-extrabold text-brand-green tracking-tight'>
            HotelSaver<span className='text-gray-900'>.ng</span>
          </Link>
          <nav className='ml-auto flex items-center gap-5 text-sm'>
            <Link href='/#how' className='hover:text-brand-green transition-colors'>How It Works</Link>
            <Link href='/partner' className='hover:text-brand-green transition-colors'>Partner With Us</Link>
            <a href='https://wa.me/2347077775545' target='_blank' className='hover:text-brand-green transition-colors'>Customer Support</a>
            <Link href='/about' className='hover:text-brand-green transition-colors'>About</Link>
            <Link href='/contact' className='hover:text-brand-green transition-colors'>Contact</Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-brand-green/10 px-3 py-1 rounded-full">
                  <div className="w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-brand-green">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className='container'>{children}</main>
      <footer className='mt-20 border-t border-gray-100'>
        <div className='container py-10 text-sm text-gray-600'>
          © {new Date().getFullYear()} HotelSaver.ng — We help you pay less for hotels.
        </div>
      </footer>
    </AuthProvider>
  )
}