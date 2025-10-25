#!/usr/bin/env node
/*
  Update lib.hotels.json image arrays using a mapping file produced by collect-hotel-photos.js
  Usage:
    node scripts/update-hotel-photos.js scripts/output/hotel-photo-map.Owerri.u80.json --mode=replace

  Modes:
    replace (default): replace images with collected set
    prepend: put collected images before existing images
    append: put collected images after existing images
*/

const fs = require('fs')
const path = require('path')

function parseArgs(){
  const args = process.argv.slice(2)
  const out = { files: [] }
  for (const a of args) {
    if (!a.startsWith('--')) out.files.push(a)
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

const args = parseArgs()
const MAP_FILE = args.files[0]
if (!MAP_FILE) {
  console.error('Provide mapping file. Example: node scripts/update-hotel-photos.js scripts/output/hotel-photo-map.Owerri.u80.json')
  process.exit(1)
}
const MODE = (args.mode || 'replace')

const ROOT = path.resolve(__dirname, '..')
const DATA_FILE = path.resolve(ROOT, 'lib.hotels.json')
const BACKUP_FILE = path.resolve(ROOT, `lib.hotels.backup.${new Date().toISOString().slice(0,10)}.json`)

if (!fs.existsSync(DATA_FILE)) {
  console.error('Could not find lib.hotels.json at project root')
  process.exit(1)
}

const mapping = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
const hotels = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))

// backup
fs.copyFileSync(DATA_FILE, BACKUP_FILE)
console.log('Backup created:', BACKUP_FILE)

let updated = 0
for (const h of hotels) {
  if (!mapping[h.id]) continue
  const urls = mapping[h.id]
  if (!Array.isArray(urls) || urls.length === 0) continue
  if (!Array.isArray(h.images)) h.images = []

  if (MODE === 'replace') {
    h.images = urls
  } else if (MODE === 'prepend') {
    h.images = [...urls, ...h.images]
  } else if (MODE === 'append') {
    h.images = [...h.images, ...urls]
  } else {
    h.images = urls
  }
  updated++
}

fs.writeFileSync(DATA_FILE, JSON.stringify(hotels, null, 2))
console.log('Updated', updated, 'hotels. Wrote', DATA_FILE)
