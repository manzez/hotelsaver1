// app/api/admin/hotels/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { HOTELS } from '@/lib/data'
import fs from 'fs'
import path from 'path'

function authorize(req: NextRequest): NextResponse | null {
  const key = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  if (!expected || key !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

type UpdateItem = { id: string; basePriceNGN: number }

export async function POST(req: NextRequest) {
  const auth = authorize(req)
  if (auth) return auth

  try {
    const body = await req.json()
    const updates: UpdateItem[] = Array.isArray(body?.updates) ? body.updates : []
    const apply: boolean = Boolean(body?.apply)

    if (!updates.length) {
      return NextResponse.json({ ok: false, error: 'no-updates' }, { status: 400 })
    }

    // Build lookup of updates
    const byId = new Map<string, number>()
    const invalidPrices: Array<{ id: string; price: unknown }> = []
    for (const u of updates) {
      const price = Number(u?.basePriceNGN)
      if (!u?.id || !Number.isFinite(price) || price <= 0) {
        invalidPrices.push({ id: String(u?.id || ''), price: u?.basePriceNGN })
        continue
      }
      byId.set(String(u.id), Math.round(price))
    }

    const missingIds: string[] = []
    const preview: Array<{ id: string; from: number; to: number }> = []

    for (const [id, newPrice] of byId.entries()) {
      const h: any = HOTELS.find((x: any) => x.id === id)
      if (!h) {
        missingIds.push(id)
        continue
      }
      const current = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0)
      preview.push({ id, from: current, to: newPrice })
    }

    // If apply requested, only allow outside production (Vercel is read-only)
    let applied = false
    let backupPath: string | null = null
    if (apply) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({
          ok: false,
          error: 'read-only-environment',
          message: 'Cannot write in production. Export CSV and run `npm run update:prices <file>` locally, then redeploy.'
        }, { status: 400 })
      }

      // Load and write lib.hotels.json from filesystem
      const projectRoot = path.resolve(process.cwd())
      const hotelsJsonPath = path.join(projectRoot, 'lib.hotels.json')
      if (!fs.existsSync(hotelsJsonPath)) {
        return NextResponse.json({ ok: false, error: 'file-not-found', path: hotelsJsonPath }, { status: 500 })
      }

      const hotels = JSON.parse(fs.readFileSync(hotelsJsonPath, 'utf8'))
      const backupsDir = path.join(projectRoot, 'backups')
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir)
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      backupPath = path.join(backupsDir, `lib.hotels.json.backup.${ts}.json`)
      fs.writeFileSync(backupPath, JSON.stringify(hotels, null, 2))

      let updated = 0
      for (const h of hotels) {
        const np = byId.get(h.id)
        if (typeof np === 'number') {
          h.basePriceNGN = np
          if (typeof h.price === 'number') h.price = np
          updated++
        }
      }

      fs.writeFileSync(hotelsJsonPath, JSON.stringify(hotels, null, 2))
      applied = true
    }

    return NextResponse.json({
      ok: true,
      invalidPrices,
      missingIds,
      preview,
      applied,
      backupPath,
      note: applied
        ? 'Prices updated locally. Rebuild and redeploy to publish.'
        : 'Dry-run only. To apply in production, export CSV and run the local update script before deploy.'
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 })
  }
}
