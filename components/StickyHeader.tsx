'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

export default function StickyHeader() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Header becomes compact after scrolling 100px
      setIsScrolled(currentScrollY > 100)
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl transition-all duration-300 pointer-events-none ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'backdrop-blur-md bg-green-900/95' : ''
      }`}
    >
      <div className="container mx-auto px-3 md:px-6">
        {/* Top Navigation Bar */}
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}>
          {/* Logo Section */}
          <div className="flex items-center">
            <h1 className={`font-bold text-white drop-shadow-lg transition-all duration-300 ${
              isScrolled ? 'text-sm md:text-lg' : 'text-base md:text-xl'
            }`}>Hotelsaver.ng</h1>
          </div>
          
          {/* Right Side - Help, List Property, WhatsApp, Sign in */}
          <div className="flex items-center space-x-1 md:space-x-4 text-xs md:text-sm whitespace-nowrap overflow-x-auto scrollbar-hide" style={{pointerEvents: 'auto'}}>
            <a 
              href="https://wa.me/+2349053999263?text=Hi%20HotelSaver.ng,%20I%20need%20help%20with%20my%20booking" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline-block hover:bg-white/10 px-2 md:px-3 py-1 md:py-2 rounded transition-all duration-300"
            >
              Help
            </a>
            <a href="/partner" className="hidden sm:block hover:bg-white/10 px-2 md:px-3 py-1 md:py-2 rounded transition-all duration-300">
              List your property
            </a>
            
            {/* Gift Box Section */}
            <div className="hidden md:block relative group">
              <div className="hover:bg-white/10 px-3 py-2 rounded transition-all duration-300 flex items-center gap-2 cursor-default">
                <span className="text-2xl">🎁</span>
                <span className="text-xs hidden md:block">Free gift with every booking</span>
              </div>
              <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm font-medium">Free gift with every booking!</span>
                </div>
              </div>
            </div>
            
            <a 
              href="https://wa.me/+2349053999263?text=Welcome%20to%20HotelSaver.ng.%20How%20can%20I%20help%20you%20today%3F" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-4 py-1 md:py-2 rounded font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-1 md:gap-2"
              title="Chat with us on WhatsApp - Instant Response!"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">WhatsApp Us</span>
                <span className="sm:hidden">Chat</span>
                <span className="text-xs opacity-75">💬</span>
              </span>
            </a>
            <a href="/auth/signin" className="bg-white text-green-800 px-2 md:px-4 py-1 md:py-2 rounded font-medium hover:bg-gray-100 transition-all duration-300 shadow-lg text-xs md:text-sm">
              Sign in
            </a>
          </div>
        </div>
        
        {/* Navigation Tabs - Hide when scrolled for compact view */}
        <div className={`flex items-center space-x-1 pb-3 border-b border-green-600/20 transition-all duration-300 overflow-x-auto scrollbar-hide ${
          isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`} style={{pointerEvents: 'auto'}}>
          <a href="/" className="bg-green-800/50 text-white px-3 md:px-4 py-2 md:py-3 rounded-full border border-white/20 font-medium whitespace-nowrap text-sm">
            Hotels
          </a>
          <a href="/search?stayType=apartment" className="hover:bg-green-700/30 text-white/90 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap text-sm">
            Apartments
          </a>
          <a href="/services" className="hover:bg-green-700/30 text-white/90 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap text-sm">
            Services
          </a>
          <a href="/food" className="hover:bg-green-700/30 text-white/90 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap text-sm">
            Food
          </a>
          <a href="/airport-taxi" className="hover:bg-green-700/30 text-white/90 px-3 md:px-4 py-2 md:py-3 rounded-full transition-all duration-300 whitespace-nowrap text-sm">
            Airport Taxi
          </a>
        </div>
        
        {/* Search Bar - Compact mode for header (hide on homepage since it has its own SearchBar) */}
        {pathname !== '/' && (
          <div className={`transition-all duration-300 ${
            isScrolled ? 'pt-2 pb-2 md:pt-3 md:pb-3' : 'pt-3 pb-3 md:pt-4 md:pb-4'
          }`} style={{pointerEvents: 'auto'}}>
            <div className="w-full max-w-6xl mx-auto px-2">
              <SearchBar compact={true} submitLabel="Search" showBrandSplashOnSubmit={false} mobileDatePicker="custom" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}