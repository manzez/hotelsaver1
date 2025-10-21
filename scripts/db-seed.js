/*
  Seeds the Postgres database from lib.hotels.json using Prisma models.
  - Maps cities to Prisma enum City
  - Creates Hotel + HotelImage records
  - Sets shelfPriceNGN from basePriceNGN/price

  Usage:
    # Ensure DATABASE_URL is set and migrations have been applied
    npm run db:deploy
    npm run db:seed
*/

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function toSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function mapCity(city) {
  const c = String(city || '').toLowerCase().replace(/\s+/g, '')
  if (c === 'lagos') return 'Lagos'
  if (c === 'abuja') return 'Abuja'
  if (c === 'portharcourt' || c === 'port-harcourt' || c === 'ph' || c === 'p-harcourt') return 'PortHarcourt'
  if (c === 'owerri') return 'Owerri'
  throw new Error(`Unsupported city: ${city}`)
}

async function main() {
  const hotelsPath = path.join(process.cwd(), 'lib.hotels.json')
  const raw = fs.readFileSync(hotelsPath, 'utf8')
  const list = JSON.parse(raw)

  let created = 0, skipped = 0

  for (const h of list) {
    try {
      const name = h.name || h.title || 'Hotel'
      // Prefer existing JSON id to preserve client propertyId compatibility
      const slug = (typeof h.id === 'string' && h.id.trim())
        ? h.id.trim()
        : (h.slug || toSlug(`${name}-${h.city || ''}`))
      const city = mapCity(h.city)
      const type = (String(h.type || 'Hotel').toLowerCase() === 'apartment') ? 'Apartment' : 'Hotel'
      const stars = Number(h.stars || 4)
      const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0)
      if (!base || base < 0) throw new Error('Invalid base price')

      const exists = await prisma.hotel.findUnique({ where: { slug } })
      if (exists) {
        skipped++
        continue
      }

      const createdHotel = await prisma.hotel.create({
        data: {
          slug,
          name,
          city,
          type,
          stars,
          shelfPriceNGN: Math.round(base),
          negotiationEnabled: true,
          images: {
            create: Array.isArray(h.images) ? h.images.slice(0, 6).map((url, idx) => ({ url, sortOrder: idx })) : []
          }
        }
      })

      created++
    } catch (err) {
      console.error('Seed error for record', h && h.id, err.message)
    }
  }

  console.log(`Seed complete. Created: ${created}, Skipped (existing): ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
