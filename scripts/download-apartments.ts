#!/usr/bin/env node

/**
 * Script to download apartment data from Google Places API
 * and integrate it with existing hotel data
 * 
 * Usage:
 * npm run download-apartments
 * 
 * Requirements:
 * - GOOGLE_PLACES_API_KEY environment variable must be set
 * - Internet connection
 * - Google Places API enabled with sufficient quota
 */

// Load environment variables from .env.local
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { downloadAllApartments, convertApartmentsToHotelData } from '../lib/places-api'
import fs from 'fs'

// Configuration
const OUTPUT_DIR = path.join(process.cwd())
const HOTELS_FILE = path.join(OUTPUT_DIR, 'lib.hotels.json')
const APARTMENTS_BACKUP_FILE = path.join(OUTPUT_DIR, `apartments-backup-${new Date().toISOString().split('T')[0]}.json`)

async function main() {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.error('❌ Error: GOOGLE_PLACES_API_KEY environment variable is required')
      console.log('📋 To fix this:')
      console.log('1. Get a Google Places API key from Google Cloud Console')
      console.log('2. Enable the Places API for your project')
      console.log('3. Set the environment variable: export GOOGLE_PLACES_API_KEY="your_api_key_here"')
      process.exit(1)
    }

    console.log('🏠 HotelSaver.ng Apartment Data Download')
    console.log('=====================================')
    console.log(`📍 Target cities: Lagos, Abuja, Port Harcourt, Owerri`)
    console.log(`📊 API: Google Places API`)
    console.log('')

    // Step 1: Download apartment data
    console.log('🔍 Starting apartment data download...')
    const apartmentData = await downloadAllApartments()

    // Step 2: Convert to hotel data format
    console.log('\n🔄 Converting apartment data to hotel format...')
    const allApartments = Object.values(apartmentData).flat()
    const convertedApartments = convertApartmentsToHotelData(allApartments)

    // Step 3: Backup current hotels data
    console.log('💾 Creating backup of current hotel data...')
    if (fs.existsSync(HOTELS_FILE)) {
      const currentData = fs.readFileSync(HOTELS_FILE, 'utf8')
      fs.writeFileSync(APARTMENTS_BACKUP_FILE, currentData)
      console.log(`✅ Backup saved to: ${APARTMENTS_BACKUP_FILE}`)
    }

    // Step 4: Read existing hotels data
    let existingHotels = []
    if (fs.existsSync(HOTELS_FILE)) {
      const existingData = JSON.parse(fs.readFileSync(HOTELS_FILE, 'utf8'))
      existingHotels = Array.isArray(existingData) ? existingData : (existingData.hotels || [])
    }

    // Step 5: Remove any existing Places API apartments to avoid duplicates
    const filteredExisting = existingHotels.filter((hotel: any) => 
      hotel.source !== 'places_api' && !hotel.id?.startsWith('apt_')
    )

    // Step 6: Merge data
    const mergedHotels = [...filteredExisting, ...convertedApartments]

    // Step 7: Save updated hotels data
    console.log('\n💾 Saving merged hotel and apartment data...')
    fs.writeFileSync(HOTELS_FILE, JSON.stringify(mergedHotels, null, 2))

    // Step 8: Save apartment-only data for reference
    const apartmentOnlyFile = path.join(OUTPUT_DIR, `apartments-${new Date().toISOString().split('T')[0]}.json`)
    fs.writeFileSync(apartmentOnlyFile, JSON.stringify({
      downloadDate: new Date().toISOString(),
      totalApartments: convertedApartments.length,
      byCity: Object.entries(apartmentData).reduce((acc, [city, apts]) => {
        acc[city] = apts.length
        return acc
      }, {} as Record<string, number>),
      apartments: convertedApartments
    }, null, 2))

    // Summary
    console.log('\n🎉 Apartment download complete!')
    console.log('================================')
    console.log(`📊 Total apartments downloaded: ${convertedApartments.length}`)
    console.log(`🏨 Existing hotels preserved: ${filteredExisting.length}`)
    console.log(`📈 Total properties now: ${mergedHotels.length}`)
    console.log('')
    
    // City breakdown
    Object.entries(apartmentData).forEach(([city, apartments]) => {
      console.log(`🏠 ${city}: ${apartments.length} apartments`)
    })

    console.log('')
    console.log(`📁 Files updated:`)
    console.log(`   - ${HOTELS_FILE} (merged data)`)
    console.log(`   - ${apartmentOnlyFile} (apartments only)`)
    console.log(`   - ${APARTMENTS_BACKUP_FILE} (backup)`)

    console.log('')
    console.log('✅ Ready to deploy! The apartments are now available in search results.')

  } catch (error) {
    console.error('❌ Error during apartment download:', error)
    
    // Restore backup if something went wrong
    if (fs.existsSync(APARTMENTS_BACKUP_FILE)) {
      try {
        const backupData = fs.readFileSync(APARTMENTS_BACKUP_FILE, 'utf8')
        fs.writeFileSync(HOTELS_FILE, backupData)
        console.log('🔄 Restored original hotels data from backup')
      } catch (restoreError) {
        console.error('❌ Failed to restore backup:', restoreError)
      }
    }
    
    process.exit(1)
  }
}

// Handle CLI execution
if (require.main === module) {
  main().catch(console.error)
}

export { main as downloadApartmentsMain }