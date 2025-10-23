
import './globals.css'
import Link from 'next/link'
import { Inter } from 'next/font/google'
// import Chatbot from '@/components/Chatbot'
// import AIChatbot from '@/components/AIChatbot'
import ClientLayout from '@/components/ClientLayout'
import AuthProvider from '@/components/AuthProvider'
import { CartProvider } from '@/lib/cart-context'

const inter = Inter({subsets:['latin']})

export const metadata={
  title:'HotelSaver.ng — Save on Hotels & Services',
  description:'Negotiate hotel prices & book local services across Nigeria.'
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang='en' className={inter.className}>
      <body className='min-h-screen bg-gray-50 text-gray-900'>
        <AuthProvider>
          <CartProvider>
            <ClientLayout>{children}</ClientLayout>
            {/* Chatbots disabled per request */}
            <div id="date-picker-portal" style={{ position: 'fixed', zIndex: 999999 }}></div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
