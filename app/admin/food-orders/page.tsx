"use client";

import { useEffect, useState, Suspense } from 'react'

type Order = {
  reference: string
  restaurantId?: string
  restaurantName?: string
  city?: string
  contactName?: string
  contactPhone?: string
  contactAddress?: string
  items?: any
  discountPct?: number
  deliveryFee?: number
  deliveryWindow?: string
  scheduleDate?: string
  scheduleTime?: string
  total?: number
  status?: string
  createdAt?: string
}

function naira(n: number) { return `₦${Math.round(Number(n)||0).toLocaleString()}` }

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCity, setFilterCity] = useState('All')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/food/orders', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        setOrders(Array.isArray(data?.orders) ? data.orders : [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = orders.filter(o => filterCity === 'All' || o.city === filterCity)

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Food Orders</h1>

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-700">City</label>
        <select className="select w-48" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
          {['All','Owerri','Lagos','Abuja','Port Harcourt'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-600">{filtered.length} orders</span>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
          <div className="col-span-2">Reference</div>
          <div className="col-span-3">Restaurant</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Delivery</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading…</div>
        ) : (
          <div>
            {filtered.map(o => (
              <div key={o.reference} className="grid grid-cols-12 px-4 py-3 border-t text-sm items-center">
                <div className="col-span-2 font-mono">{o.reference}</div>
                <div className="col-span-3">
                  <div className="font-medium">{o.restaurantName}</div>
                  <div className="text-xs text-gray-600">{o.city}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm">{o.contactName}</div>
                  <div className="text-xs text-gray-600">{o.contactPhone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-600">{o.deliveryWindow}{o.scheduleDate ? ` • ${o.scheduleDate}` : ''}{o.scheduleTime ? ` @ ${o.scheduleTime}` : ''}</div>
                  <div className="text-xs">Fee: {naira(o.deliveryFee || 0)}</div>
                </div>
                <div className="col-span-1 text-right">{naira(o.total || 0)}</div>
                <div className="col-span-2 text-right">
                  {o.contactPhone && (
                    <a className="btn-ghost h-8 mr-2" target="_blank" href={`https://wa.me/${o.contactPhone.replace(/\D/g,'')}`}>WhatsApp</a>
                  )}
                  {o.contactAddress && (
                    <a className="btn-ghost h-8" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.contactAddress)}`}>Map</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminFoodOrdersPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading…</div>}>
      <OrdersContent />
    </Suspense>
  )
}
