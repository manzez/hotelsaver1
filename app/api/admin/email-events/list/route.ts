import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateAdminApiKey } from '@/lib/timing-safe-compare'

function ok(data: any) { return NextResponse.json({ ok: true, ...data }) }
function err(status: number, message: string) { return NextResponse.json({ ok: false, error: message }, { status }) }

export async function GET(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY || ''
  const provided = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key') || ''
  if (!adminKey || !validateAdminApiKey(provided, adminKey)) return err(401, 'unauthorized')

  const sp = req.nextUrl.searchParams
  const typeFilter = String(sp.get('type') || '').toLowerCase() // delivered|bounced|complained|opened|clicked|''
  const hours = Math.max(1, Math.min(24 * 30, Number(sp.get('hours') || 24)))
  const limit = Math.max(1, Math.min(1000, Number(sp.get('limit') || 50)))
  const since = Date.now() - hours * 60 * 60 * 1000

  // DB first if available
  try {
    const { prisma } = await import('@/lib/prisma')
    const p: any = prisma as any
    if (p?.emailEvent?.findMany) {
      const where: any = { createdAt: { gte: new Date(since) } }
      if (typeFilter) where.type = { contains: typeFilter, mode: 'insensitive' }
      const rows = await p.emailEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit })
      return ok({ events: rows })
    }
  } catch {}

  // Fallback to file
  const file = path.join(process.cwd(), 'data', 'email-events.log')
  let lines: string[] = []
  try {
    const txt = await fs.promises.readFile(file, 'utf8')
    lines = txt.split(/\r?\n/).filter(Boolean)
  } catch {
    return ok({ events: [] })
  }
  const N = 5000
  const recentLines = lines.slice(Math.max(0, lines.length - N))
  const events: any[] = []
  for (const ln of recentLines) {
    try { events.push(JSON.parse(ln)) } catch {}
  }
  const filtered = events.filter(e => {
    const ts = Date.parse(e?.ts || e?.createdAt || '')
    if (!(Number.isFinite(ts) && ts >= since)) return false
    if (!typeFilter) return true
    const t = String(e?.type || '').toLowerCase()
    return t.includes(typeFilter)
  })
  const sliced = filtered.sort((a,b) => (Date.parse(b.ts || b.createdAt || '') - Date.parse(a.ts || a.createdAt || ''))).slice(0, limit)
  return ok({ events: sliced })
}
