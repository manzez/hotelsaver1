
'use client'

import dynamic from 'next/dynamic'

// Dynamically import the Datepicker with SSR disabled
const Datepicker = dynamic(() => import('react-tailwindcss-datepicker'), {
  ssr: false
})

export default Datepicker
