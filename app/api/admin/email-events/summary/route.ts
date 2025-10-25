import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateAdminApiKey } from '@/lib/timing-safe-compare'

type Summary = {
  windowHours: number
  total: number
  delivered: number
  bounced: number
  complained: number
  opened: number
  clicked: number
  bounceRate: number
}

function ok(data: any) {
  return NextResponse.json({ ok: true, ...data })
}
function err(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY || ''
  const provided = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key') || ''
  if (!adminKey || !validateAdminApiKey(provided, adminKey)) {
    return err(401, 'unauthorized')
  }

  const since = Date.now() - 24 * 60 * 60 * 1000

  // Prefer DB if available
  try {
    const { prisma } = await import('@/lib/prisma')
    const p: any = prisma as any
    if (p?.emailEvent?.findMany) {
      const rows = await p.emailEvent.findMany({
        where: { createdAt: { gte: new Date(since) } },
        orderBy: { createdAt: 'desc' },
        take: 500,
      })
      let delivered = 0, bounced = 0, complained = 0, opened = 0, clicked = 0
      for (const e of rows) {
        const t = String(e?.type || '').toLowerCase()
        if (t.includes('deliver')) delivered++
        else if (t.includes('bounce')) bounced++
        else if (t.includes('complain')) complained++
        else if (t.includes('open')) opened++
        else if (t.includes('click')) clicked++
      }
      const total = rows.length
      const bounceRate = delivered > 0 ? bounced / delivered : 0
      const summary: Summary = { windowHours: 24, total, delivered, bounced, complained, opened, clicked, bounceRate }
      const recent = rows.slice(0, 20)
      return ok({ summary, recent })
    }
  } catch {
    // Fall through to file-based summary
  }

  // Fallback: parse file logs
  const file = path.join(process.cwd(), 'data', 'email-events.log')
  let lines: string[] = []
  try {
    const txt = await fs.promises.readFile(file, 'utf8')
    lines = txt.split(/\r?\n/).filter(Boolean)
  } catch {
    const empty: Summary = { windowHours: 24, total: 0, delivered: 0, bounced: 0, complained: 0, opened: 0, clicked: 0, bounceRate: 0 }
    return ok({ summary: empty, recent: [] })
  }

  const N = 1000
  const recentLines = lines.slice(Math.max(0, lines.length - N))
  const events: any[] = []
  for (const ln of recentLines) {
    try { events.push(JSON.parse(ln)) } catch {}
  }

  const last24h = events.filter(e => {
    const ts = Date.parse(e?.ts || e?.createdAt || '')
    return Number.isFinite(ts) && ts >= since
  })

  let delivered = 0, bounced = 0, complained = 0, opened = 0, clicked = 0
  for (const e of last24h) {
    const t = String(e?.type || '').toLowerCase()
    if (t.includes('deliver')) delivered++
    else if (t.includes('bounce')) bounced++
    else if (t.includes('complain')) complained++
    else if (t.includes('open')) opened++
    else if (t.includes('click')) clicked++
  }
  const total = last24h.length
  const bounceRate = delivered > 0 ? bounced / delivered : 0
  const summary: Summary = { windowHours: 24, total, delivered, bounced, complained, opened, clicked, bounceRate }
  const recent = last24h.slice(0, 20)
  return ok({ summary, recent })
}
