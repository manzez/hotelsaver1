
import './globals.css'
import Link from 'next/link'
import { Inter } from 'next/font/google'
const inter = Inter({subsets:['latin']})

export const metadata={
  title:'HotelSaver.ng — Save on Hotels & Services',
  description:'Negotiate hotel prices & book local services across Nigeria.'
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang='en' className={inter.className}>
      <body className='min-h-screen bg-white text-gray-900'>
        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100'>
          <div className='container h-16 flex items-center gap-6'>
            <Link href='/' className='text-2xl font-extrabold text-brand-green tracking-tight'>HotelSaver<span className='text-gray-900'>.ng</span></Link>
            <nav className='ml-auto flex items-center gap-5 text-sm'>
              <Link href='/#how' className='hover:text-brand-green'>How It Works</Link>
              <Link href='/partner' className='hover:text-brand-green'>Partner With Us</Link>
              <a href='https://wa.me/2347077775545' target='_blank' className='hover:text-brand-green'>Customer Support</a>
              <Link href='/about' className='hover:text-brand-green'>About</Link>
              <Link href='/contact' className='hover:text-brand-green'>Contact</Link>
            </nav>
          </div>
        </header>
        <main className='container'>{children}</main>
        <footer className='mt-20 border-t border-gray-100'>
          <div className='container py-10 text-sm text-gray-600'>© {new Date().getFullYear()} HotelSaver.ng — We help you pay less for hotels.</div>
        </footer>
      </body>
    </html>
  )
}
