import { NextRequest, NextResponse } from 'next/server'
import FOOD_DATA from '@/lib.food.json'
import { prisma } from '@/lib/prisma'

type MenuItem = { name: string; priceNGN: number; category: string }
type Restaurant = {
  id: string
  name: string
  city: string
  rating: number
  image: string
  priceRange: string
  menu: MenuItem[]
  discountPct?: number
}

const DELIVERY_FEES: Record<string, number> = {
  Lagos: 1500,
  Abuja: 1500,
  'Port Harcourt': 1200,
  Owerri: 1000,
}
const WINDOWS = ['Morning', 'Afternoon', 'Evening'] as const
function safeWindow(w?: string | null) {
  if (!w) return 'Afternoon'
  return WINDOWS.includes(w as any) ? w : 'Afternoon'
}

export async function POST(req: NextRequest) {
  try {
    let data: any = null
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      data = await req.json().catch(() => ({}))
    } else if (ct.includes('multipart/form-data')) {
      const form = await req.formData()
      data = Object.fromEntries(form.entries())
    } else {
      // Try json by default
      data = await req.json().catch(() => ({}))
    }

    const reference = 'FD' + Date.now()

    const restaurants: Restaurant[] = FOOD_DATA as any
    const r = restaurants.find(x => x.id === data?.restaurantId)

    const items = Array.isArray(data?.items) ? data.items : []
  const discountPct = typeof r?.discountPct === 'number' ? r!.discountPct! : (typeof data?.discountRate === 'number' ? data.discountRate : 10)
    const deliveryFee = DELIVERY_FEES[data?.city] ?? 1000
  const deliveryWindow = data?.scheduleTime ? 'Scheduled' : safeWindow(data?.deliveryWindow)
  const scheduleDate = String(data?.scheduleDate || '')
  const scheduleTime = String(data?.scheduleTime || '')

    // Recalculate subtotal server-side for integrity
    const menuMap = new Map((r?.menu || []).map(it => [it.name, it]))
    let subtotal = 0
    for (const it of items) {
      const menu = menuMap.get(String(it.name))
      const qty = Math.max(0, Number(it.qty) || 0)
      if (!menu || qty <= 0) continue
      const discounted = Math.round(menu.priceNGN * (1 - discountPct / 100))
      subtotal += discounted * qty
    }
    const total = subtotal + deliveryFee

    // Attempt to persist via Prisma (optional)
    try {
      const db = prisma as any
      await db.foodOrder?.create?.({
        data: {
          reference,
          restaurantId: String(data?.restaurantId || ''),
          restaurantName: String(data?.restaurantName || r?.name || ''),
          city: String(data?.city || r?.city || ''),
          contactName: String(data?.contact?.name || ''),
          contactPhone: String(data?.contact?.phone || ''),
          contactAddress: String(data?.contact?.address || ''),
          items,
          discountPct,
          deliveryFee,
          deliveryWindow,
          scheduleDate,
          scheduleTime,
          total,
          status: 'CONFIRMED',
        }
      })
    } catch (e) {
      console.warn('FoodOrder persist skipped:', e)
    }

    // Optional admin webhook notification
    try {
      const webhook = process.env.FOOD_ORDER_WEBHOOK_URL
      if (webhook) {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'food.order', reference, order: { ...data, total, deliveryFee, deliveryWindow } })
        }).catch(() => {})
      }
    } catch {}

    // WhatsApp Cloud (optional)
    try {
      const waToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
      const adminWa = process.env.ADMIN_WHATSAPP
      if (waToken && waPhoneId && adminWa) {
        await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminWa,
            type: 'text',
            text: { body: `New food order ${reference} — ${r?.name || data?.restaurantName} (${data?.city}). Total: ₦${total.toLocaleString()}\nCustomer: ${data?.contact?.name} (${data?.contact?.phone})` }
          })
        }).catch(() => {})
      }
    } catch {}

    // SendGrid email (optional)
    try {
      const sgKey = process.env.SENDGRID_API_KEY
      const adminEmail = process.env.ADMIN_EMAIL
      if (sgKey && adminEmail) {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sgKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: adminEmail }] }],
            from: { email: 'no-reply@hotelsaver.ng', name: 'HotelSaver.ng' },
            subject: `New Food Order ${reference}`,
            content: [{
              type: 'text/plain',
              value: `Restaurant: ${r?.name || data?.restaurantName}\nCity: ${data?.city}\nTotal: ₦${total.toLocaleString()}\nDelivery: ${deliveryWindow} ${scheduleDate ? `on ${scheduleDate}` : ''} ${scheduleTime ? `at ${scheduleTime}` : ''}\nCustomer: ${data?.contact?.name} (${data?.contact?.phone})\nAddress: ${data?.contact?.address}`
            }]
          })
        }).catch(() => {})
      }
    } catch {}

  const adminWa = process.env.ADMIN_WHATSAPP ? `https://wa.me/${process.env.ADMIN_WHATSAPP}?text=${encodeURIComponent(`New food order ${reference} for ${r?.name || data?.restaurantName} — total ₦${total.toLocaleString()}`)}` : undefined
    const adminEmail = process.env.ADMIN_EMAIL ? `mailto:${process.env.ADMIN_EMAIL}?subject=${encodeURIComponent('New Food Order ' + reference)}&body=${encodeURIComponent(`Restaurant: ${r?.name || data?.restaurantName}\nTotal: ${total}\nCustomer: ${data?.contact?.name} (${data?.contact?.phone})`)}` : undefined

  return NextResponse.json({ status: 'confirmed', reference, total, deliveryFee, deliveryWindow, scheduleDate, scheduleTime, adminWa, adminEmail })
  } catch (e) {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
