#!/usr/bin/env node
/*
  Audit image coverage for hotels and apartments.
  Reports properties with insufficient images (default: < 3).
  Usage: node scripts/audit-hotel-photos.js [--min=3]
*/

const fs = require('fs')
const path = require('path')

function parseArgs(){
  const args = process.argv.slice(2)
  const out = { min: 3 }
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) {
      if (m[1] === 'min') out.min = Number(m[2]) || 3
    }
  }
  return out
}

const args = parseArgs()
const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.resolve(ROOT, 'lib.hotels.json')

if (!fs.existsSync(DATA_FILE)) {
  console.error('Could not find lib.hotels.json at project root')
  process.exit(1)
}

const hotels = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
const byCity = {}
let totalInsufficient = 0

for (const h of hotels) {
  const imgs = Array.isArray(h.images) ? h.images : []
  const ok = imgs.filter(Boolean).length >= args.min
  if (!ok) {
    totalInsufficient++
    const city = h.city || 'Unknown'
    if (!byCity[city]) byCity[city] = { Hotel: [], Apartment: [], Unknown: [] }
    const t = h.type || 'Unknown'
    if (!byCity[city][t]) byCity[city][t] = []
    byCity[city][t].push({ id: h.id, name: h.name, images: imgs.length })
  }
}

console.log('Min images threshold:', args.min)
console.log('Total properties:', hotels.length)
console.log('Insufficient images:', totalInsufficient)
console.log()

for (const [city, groups] of Object.entries(byCity)) {
  const count = Object.values(groups).reduce((a, arr) => a + arr.length, 0)
  if (count === 0) continue
  console.log('City:', city)
  for (const [type, list] of Object.entries(groups)) {
    if (!list.length) continue
    console.log(`  ${type}: ${list.length}`)
    for (const item of list.slice(0, 10)) {
      console.log(`    - ${item.id} (${item.images} imgs) ${item.name}`)
    }
    if (list.length > 10) console.log(`    ... +${list.length - 10} more`)
  }
  console.log()
}

if (totalInsufficient === 0) {
  console.log('All properties meet the minimum image count.')
}
