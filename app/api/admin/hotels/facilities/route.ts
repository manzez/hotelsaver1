import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { FACILITY_CATALOG, FACILITY_GROUPS, type FacilityKey } from '@/lib/facilities'

// Simple in-memory rate limiter for write operations (best-effort; per-instance)
const writeWindowMs = 60_000
const writeLimit = 10 // max writes per window per hotel
const writeLog = new Map<string, number[]>()

function allowWrite(key: string) {
  const now = Date.now()
  const arr = (writeLog.get(key) || []).filter(t => now - t < writeWindowMs)
  if (arr.length >= writeLimit) return false
  arr.push(now)
  writeLog.set(key, arr)
  return true
}

type AuthResult = { ok: true; mode: 'admin' | 'hotel'; hotelId?: string } | { ok: false; res: NextResponse }

function authorize(req: NextRequest): AuthResult {
  // 1) Company admin via x-admin-key
  const adminKey = req.headers.get('x-admin-key') || ''
  const expected = process.env.ADMIN_API_KEY || ''
  if (expected && adminKey && adminKey === expected) {
    return { ok: true, mode: 'admin' }
  }

  // 2) Hotel admin via x-hotel-id + x-hotel-key, matched against env var HOTEL_ADMIN_KEY_<HOTELID>
  const hotelId = (req.headers.get('x-hotel-id') || '').trim()
  const hotelKey = (req.headers.get('x-hotel-key') || '').trim()
  if (hotelId && hotelKey) {
    const envKeyName = 'HOTEL_ADMIN_KEY_' + hotelId.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const expectedHotelKey = process.env[envKeyName]
    if (expectedHotelKey && hotelKey === expectedHotelKey) {
      return { ok: true, mode: 'hotel', hotelId }
    }
  }

  return { ok: false, res: NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 }) }
}

const overridesFile = path.join(process.cwd(), 'lib', 'facilities-overrides.json')

async function readOverrides(): Promise<Record<string, FacilityKey[]>> {
  try {
    const raw = await fs.readFile(overridesFile, 'utf8')
    const json = JSON.parse(raw)
    return json as Record<string, FacilityKey[]>
  } catch (e) {
    return {}
  }
}

async function writeOverrides(data: Record<string, FacilityKey[]>) {
  const text = JSON.stringify(data, null, 2)
  await fs.writeFile(overridesFile, text, 'utf8')
}

export async function GET(req: NextRequest) {
  const auth = authorize(req)
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const hotelIdParam = searchParams.get('hotelId') || ''
  const overrides = await readOverrides()
  const catalog = Object.values(FACILITY_CATALOG).map(({ key, label, icon }) => ({ key, label, icon }))
  const groups = FACILITY_GROUPS.map(g => ({ id: g.id, label: g.label, items: g.items.map(k => ({ key: k, label: FACILITY_CATALOG[k]?.label || k })) }))

  // If hotel-mode, force the hotelId to the authenticated one
  const hotelId = auth.mode === 'hotel' ? (auth.hotelId || '') : hotelIdParam
  if (hotelId) {
    return NextResponse.json({ ok: true, hotelId, facilities: overrides[hotelId] || [], catalog, groups })
  }
  // Only admins can list all overrides
  if (auth.mode !== 'admin') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }
  return NextResponse.json({ ok: true, overrides, catalog, groups })
}

export async function PUT(req: NextRequest) {
  const auth = authorize(req)
  if (!auth.ok) return auth.res

  try {
    const payload = await req.json()
  let hotelId = String(payload.hotelId || '')
    const facilities = Array.isArray(payload.facilities) ? payload.facilities as FacilityKey[] : []
    if (!hotelId) return NextResponse.json({ ok: false, error: 'invalid-hotelId' }, { status: 400 })
  // If hotel-mode, force hotelId to authenticated one
  if (auth.mode === 'hotel') hotelId = auth.hotelId || ''
  if (!hotelId) return NextResponse.json({ ok: false, error: 'invalid-hotelId' }, { status: 400 })
    // Rate limit per hotelId
    if (!allowWrite(`facilities:${hotelId}`)) {
      return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 })
    }
    // Validate keys
    const validKeys = new Set(Object.keys(FACILITY_CATALOG))
    const cleaned = Array.from(new Set(facilities.filter((k) => validKeys.has(k)))) as FacilityKey[]
    if (cleaned.length > 200) {
      return NextResponse.json({ ok: false, error: 'too-many-keys' }, { status: 400 })
    }

    const overrides = await readOverrides()
    overrides[hotelId] = cleaned
    await writeOverrides(overrides)
    return NextResponse.json({ ok: true, hotelId, facilities: cleaned })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 })
  }
}
