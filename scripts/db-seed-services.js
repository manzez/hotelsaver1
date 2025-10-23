/*
  Seeds the Postgres database Services from lib.services.json using Prisma models.
  - Maps cities to Prisma enum City
  - Maps legacy category strings to ServiceCategory enum
  - Creates Service records with images[] and a baseline amountNGN from first price tier

  Usage:
    # Ensure DATABASE_URL is set and migrations have been applied
    npm run db:deploy
    node scripts/db-seed-services.js
*/

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function mapCity(city) {
  const c = String(city || '').toLowerCase().replace(/\s+/g, '')
  if (c === 'lagos') return 'Lagos'
  if (c === 'abuja') return 'Abuja'
  if (c === 'portharcourt' || c === 'port-harcourt' || c === 'ph' || c === 'p-harcourt') return 'PortHarcourt'
  if (c === 'owerri') return 'Owerri'
  throw new Error(`Unsupported city: ${city}`)
}

function mapCategory(cat) {
  const c = String(cat || '').toLowerCase().trim()
  // Direct matches
  if (c === 'hair') return 'Hair'
  if (c === 'nails') return 'Nails'
  if (c === 'massage') return 'Massage'
  if (c === 'cleaning') return 'Cleaning'
  if (c === 'security') return 'Security'
  if (c === 'catering') return 'Catering'
  if (c === 'chef') return 'Chef'
  if (c === 'photography') return 'Photography'
  if (c === 'livestock') return 'Livestock'
  if (c === 'braiding') return 'Braiding'

  // Variants and grouped categories
  if (c === 'car hire' || c === 'carhire' || c === 'car-hire') return 'CarHire'
  if (c === 'guide' || c === 'tour guide' || c === 'tour-guide') return 'Guide'
  if (c === 'dry cleaning' || c === 'dry-cleaning' || c === 'laundry') return 'DryCleaningAndWashServices'
  if (c === 'sound equipment' || c === 'sound & light rentals' || c === 'sound and light rentals') return 'SoundAndLightRentals'
  if (c === 'entertainment' || c === 'dj services' || c === 'mc services') return 'EntertainmentServices'
  if (c === 'event transportation' || c === 'bus services' || c === 'bus hire') return 'EventTransportation'
  if (c === 'furniture rentals' || c === 'furniture') return 'FurnitureRentals'

  // Unsupported categories (e.g., Makeup) -> return null to skip for now
  return null
}

async function main() {
  const servicesPath = path.join(process.cwd(), 'lib.services.json')
  const raw = fs.readFileSync(servicesPath, 'utf8')
  const list = JSON.parse(raw)

  let created = 0, skipped = 0, ignored = 0

  for (const s of list) {
    try {
      const id = String(s.id || '').trim()
      const title = String(s.title || '').trim()
      const city = mapCity(s.city)
      const category = mapCategory(s.category)
      if (!category) {
        ignored++
        continue
      }

      const exists = await prisma.service.findUnique({ where: { id } })
      if (exists) {
        skipped++
        continue
      }

      const amount = Array.isArray(s.prices) && s.prices.length > 0
        ? Math.round(Number(s.prices[0].amountNGN || 0))
        : Math.round(Number(s.amountNGN || 0))

      await prisma.service.create({
        data: {
          id, // preserve legacy id for URL compatibility
          title,
          city,
          category,
          provider: String(s.provider || 'Provider'),
          description: String(s.summary || ''),
          amountNGN: amount > 0 ? amount : 0,
          rating: typeof s.rating === 'number' ? s.rating : 4.5,
          images: Array.isArray(s.images) ? s.images.slice(0, 6) : [],
          type: 'SERVICE',
          active: true,
        }
      })

      created++
    } catch (err) {
      console.error('Service seed error for record', s && s.id, err.message)
    }
  }

  console.log(`Service seed complete. Created: ${created}, Skipped: ${skipped}, Ignored (unsupported category): ${ignored}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
