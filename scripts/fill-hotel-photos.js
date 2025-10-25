#!/usr/bin/env node
/*
  Fill missing/short image arrays with curated Unsplash sets by city/type.
  Usage:
    node scripts/fill-hotel-photos.js [--min=3] [--mode=append|prepend|replace]

  Behavior:
    - Creates a timestamped backup of lib.hotels.json
    - For each property with fewer than --min images, assigns a curated set
      according to city/type, merged using --mode (default: prepend)
*/

const fs = require('fs')
const path = require('path')

function parseArgs(){
  const args = process.argv.slice(2)
  const out = { min: 3, mode: 'prepend' }
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  out.min = Number(out.min || 3)
  return out
}

// Curated fallbacks per city/type (keep neutral/realistic interiors)
// You can expand these lists or tailor them further per city.
const curated = {
  Lagos: {
    Hotel: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=1200&auto=format&q=80'
    ],
    Apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1613977257593-9c3d287261c1?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1616596878575-9dd3b79d1df1?w=1200&auto=format&q=80'
    ]
  },
  Abuja: {
    Hotel: [
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1562790351-d273a961e0e4?w=1200&auto=format&q=80'
    ],
    Apartment: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d56?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1559599189-95f32f16b150?w=1200&auto=format&q=80'
    ]
  },
  'Port Harcourt': {
    Hotel: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5a9?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&q=80'
    ],
    Apartment: [
      'https://images.unsplash.com/photo-1611892440481-1e6f6f0938ac?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1586105251261-72a756497a12?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&auto=format&q=80'
    ]
  },
  Owerri: {
    Hotel: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&q=80'
    ],
    Apartment: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1616596878575-9dd3b79d1df1?w=1200&auto=format&q=80',
      'https://images.unsplash.com/photo-1613977257593-9c3d287261c1?w=1200&auto=format&q=80'
    ]
  }
}

function pickFallback(city, type, needed){
  const byCity = curated[city] || curated['Lagos']
  const list = (byCity && byCity[type]) || byCity?.Hotel || []
  if (!needed || needed <= 0) return []
  // Repeat if needed to reach count
  const out = []
  while (out.length < needed) {
    out.push(list[out.length % list.length])
    if (list.length === 0) break
  }
  return out
}

const args = parseArgs()
const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.resolve(ROOT, 'lib.hotels.json')
const BACKUP_FILE = path.resolve(ROOT, `lib.hotels.backup.${new Date().toISOString().replace(/[:.]/g,'-')}.json`)

if (!fs.existsSync(DATA_FILE)) {
  console.error('Could not find lib.hotels.json at project root')
  process.exit(1)
}

const hotels = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
fs.copyFileSync(DATA_FILE, BACKUP_FILE)
console.log('Backup created:', BACKUP_FILE)

let updated = 0
for (const h of hotels) {
  const imgs = Array.isArray(h.images) ? h.images.filter(Boolean) : []
  const need = Math.max(0, args.min - imgs.length)
  if (need <= 0) continue

  const fallback = pickFallback(h.city || 'Lagos', h.type || 'Hotel', need)
  if (!fallback.length) continue

  if (args.mode === 'replace') {
    h.images = fallback
  } else if (args.mode === 'append') {
    h.images = [...imgs, ...fallback]
  } else { // prepend default
    h.images = [...fallback, ...imgs]
  }
  updated++
}

fs.writeFileSync(DATA_FILE, JSON.stringify(hotels, null, 2))
console.log('Updated', updated, 'properties to have at least', args.min, 'images.')
