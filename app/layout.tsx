
import './globals.css'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import Chatbot from '@/components/Chatbot'
import ClientLayout from '@/components/ClientLayout'
const inter = Inter({subsets:['latin']})

export const metadata={
  title:'HotelSaver.ng — Save on Hotels & Services',
  description:'Negotiate hotel prices & book local services across Nigeria.'
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang='en' className={inter.className}>
      <body className='min-h-screen bg-gray-50 text-gray-900'>
        <ClientLayout>{children}</ClientLayout>
        <Chatbot />
        <div id="date-picker-portal" style={{ position: 'fixed', zIndex: 999999 }}></div>
      </body>
    </html>
  )
}
