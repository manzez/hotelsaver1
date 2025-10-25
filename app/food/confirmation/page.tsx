"use client";

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

function naira(n: number) { return `₦${Math.round(Number(n)||0).toLocaleString()}` }

function FoodConfirmationInner() {
  const sp = useSearchParams()

  const reference = sp.get('reference') || ''
  const restaurant = sp.get('restaurant') || ''
  const city = sp.get('city') || ''
  const total = Number(sp.get('total') || '0')
  const deliveryFee = Number(sp.get('deliveryFee') || '0')
  const deliveryWindow = sp.get('window') || 'Afternoon'
  const scheduleDate = sp.get('scheduleDate') || ''
  const scheduleTime = sp.get('scheduleTime') || ''
  const eta = sp.get('eta') || ''
  const name = sp.get('name') || ''
  const phone = sp.get('phone') || ''
  const address = sp.get('address') || ''

  const gcalUrl = useMemo(() => {
    const today = new Date()
    const y = today.getUTCFullYear()
    const m = String(today.getUTCMonth() + 1).padStart(2, '0')
    const d = String(today.getUTCDate()).padStart(2, '0')
    const start = `${y}${m}${d}`
    const end = `${y}${m}${d}`
    const text = `Food delivery — ${restaurant}`
  const details = `Order ${reference} — window: ${deliveryWindow}`
    const location = address || city
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
  }, [restaurant, reference, deliveryWindow, address, city])

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-green-600">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-600">Thank you{name ? `, ${name}` : ''}! Your food order has been received.</p>
        </div>

        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Reference:</span><span className="font-mono text-brand-green">{reference}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Restaurant:</span><span className="font-medium">{restaurant}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">City:</span><span className="font-medium">{city}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery window:</span><span className="font-medium">{deliveryWindow}{scheduleDate ? ` • ${scheduleDate}` : ''}{scheduleTime ? ` @ ${scheduleTime}` : ''}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery fee:</span><span>{naira(deliveryFee)}</span></div>
                  {eta && (
                    <div className="text-xs text-gray-600">Estimated time: {eta}</div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total:</span><span>{naira(total)}</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                <div className="space-y-2 text-sm">
                  {name && (<div className="flex justify-between"><span className="text-gray-600">Name:</span><span className="font-medium">{name}</span></div>)}
                  {phone && (<div className="flex justify-between"><span className="text-gray-600">Phone:</span><span className="font-medium">{phone}</span></div>)}
                  {address && (<div className="flex justify-between"><span className="text-gray-600">Address:</span><span className="font-medium text-right max-w-[60%]">{address}</span></div>)}
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => window.print()} className="btn-ghost">🖨️ Print</button>
                  <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">📅 Add to Calendar</a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t text-center flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/food" className="btn-ghost">← Back to Food</a>
            <a href={`https://wa.me/2347077775545?text=${encodeURIComponent('Food order '+reference)}`} target="_blank" className="btn-primary">Message Support on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FoodConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading confirmation…</div>}>
      <FoodConfirmationInner />
    </Suspense>
  )
}
