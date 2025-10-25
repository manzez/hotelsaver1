#!/usr/bin/env node
/*
  Collect hotel photos using Google Places API.
  Usage:
    GOOGLE_PLACES_API_KEY=... node scripts/collect-hotel-photos.js --city=Owerri --budget=u80 --limit=20

  Output:
    scripts/output/hotel-photo-map.<city>.<budget>.json
*/

const fs = require('fs')
const path = require('path')

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_GOOGLE_PLACES_API_KEY
if (!API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY. Export it before running.')
  process.exit(1)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

const args = parseArgs()
const CITY = args.city || 'ALL' // ALL = process all cities
const BUDGET = args.budget || '' // optional budget filter
const LIMIT = Number(args.limit || '50')

const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.resolve(ROOT, 'lib.hotels.json')
const OUT_DIR = path.resolve(__dirname, 'output')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
const OUT_FILE = path.resolve(OUT_DIR, `hotel-photo-map.${CITY}.${BUDGET}.json`)

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)) }

async function textSearch(q) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', q)
  url.searchParams.set('key', API_KEY)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`textsearch http ${res.status}`)
  return res.json()
}

function photoUrl(photo_reference, maxwidth=1200) {
  const u = new URL('https://maps.googleapis.com/maps/api/place/photo')
  u.searchParams.set('maxwidth', String(maxwidth))
  u.searchParams.set('photo_reference', photo_reference)
  u.searchParams.set('key', API_KEY)
  return u.toString()
}

async function main(){
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const hotelsAll = raw.filter(h => h.type === 'Hotel' || h.type === 'Apartment')
  let hotels = CITY === 'ALL' ? hotelsAll : hotelsAll.filter(h => h.city === CITY)
  let filtered = hotels
  if (BUDGET === 'u80') {
    filtered = hotels.filter(h => Number(h.basePriceNGN || h.price || 0) < 80000)
  } else if (BUDGET === '80_130') {
    filtered = hotels.filter(h => Number(h.basePriceNGN || h.price || 0) >= 80000 && Number(h.basePriceNGN || h.price || 0) < 130000)
  } else if (BUDGET === '130_200') {
    filtered = hotels.filter(h => Number(h.basePriceNGN || h.price || 0) >= 130000 && Number(h.basePriceNGN || h.price || 0) < 200000)
  } else if (BUDGET === '200p') {
    filtered = hotels.filter(h => Number(h.basePriceNGN || h.price || 0) >= 200000)
  }
  filtered = filtered.slice(0, LIMIT)

  const map = {}
  for (const h of filtered) {
    const query = `${h.name}, ${h.city}, Nigeria`
    try {
      const data = await textSearch(query)
      const candidate = data.results && data.results[0]
      if (!candidate || !candidate.photos || candidate.photos.length === 0) {
        console.warn('No photos for', h.id, '-', h.name)
        continue
      }
      const picks = candidate.photos.slice(0, 4).map(p => photoUrl(p.photo_reference))
      map[h.id] = picks
      console.log('✓', h.id, picks.length, 'photos')
    } catch (e) {
      console.warn('ERR', h.id, e.message)
    }
    // Be polite with API
    await sleep(250)
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(map, null, 2))
  console.log('\nSaved mapping to', OUT_FILE)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
