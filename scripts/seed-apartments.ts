#!/usr/bin/env ts-node
import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'lib.hotels.json')

// Cities to ensure at least 20 apartments each
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'] as const

const sampleImages = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1507138451611-3001135909b3?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1560185008-b033106afc83?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&auto=format&q=80'
]

function slugifyCity(c: string) {
  return c.toLowerCase().replace(/\s+/g, '-')
}

function loadJson(): any[] {
  const raw = fs.readFileSync(file, 'utf8')
  return JSON.parse(raw)
}

function saveJson(data: any[]) {
  const text = JSON.stringify(data, null, 2)
  fs.writeFileSync(file, text, 'utf8')
}

function ensureApartments(data: any[]): { added: number } {
  let added = 0
  for (const city of cities) {
    const current = data.filter(h => String(h.city) === city && String(h.type || 'Hotel') === 'Apartment')
    if (current.length >= 20) continue
    const need = 20 - current.length
    const baseIndex = current.length

    for (let i = 1; i <= need; i++) {
      const idx = baseIndex + i
      const id = `apt-${slugifyCity(city)}-${idx}`
      const name = `City Apartment ${idx} · ${city}`
      const price = city === 'Lagos' ? 160000 + idx * 1000
        : city === 'Abuja' ? 140000 + idx * 1000
        : city === 'Port Harcourt' ? 120000 + idx * 1000
        : 90000 + idx * 1000
      const stars = 4
      const images = sampleImages
      data.push({ id, name, city, type: 'Apartment', basePriceNGN: price, stars, images })
      added++
    }
  }
  return { added }
}

(function main(){
  const data = loadJson()
  const { added } = ensureApartments(data)
  saveJson(data)
  console.log(`Added ${added} apartments across cities.`)
})()
