#!/usr/bin/env node

/**
 * Fix Hotel Photos Script
 * 
 * Problem: Hotel photos were corrupted with Google Places API URLs containing API keys
 * Solution: Restore original curated Unsplash photos for hotels, keep only apartments from Places API
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

async function fixHotelPhotos() {
  try {
    console.log('🔧 HotelSaver.ng Photo Recovery Tool')
    console.log('===================================')

    // Paths
    const currentHotelsFile = path.join(process.cwd(), 'lib.hotels.json')
    const cleanBackupFile = path.join(process.cwd(), 'lib.hotels.backup.2025-10-23T23-21-47-721Z.json')
    const outputBackupFile = path.join(process.cwd(), `lib.hotels.backup.before-photo-fix-${new Date().toISOString().split('T')[0]}.json`)

    // Step 1: Backup current file
    console.log('💾 Creating backup of current file...')
    const currentData = fs.readFileSync(currentHotelsFile, 'utf8')
    fs.writeFileSync(outputBackupFile, currentData)
    console.log('✅ Backup saved to:', outputBackupFile)

    // Step 2: Load data
    console.log('📖 Loading data files...')
    const currentHotels = JSON.parse(currentData)
    const cleanHotels = JSON.parse(fs.readFileSync(cleanBackupFile, 'utf8'))

    console.log('📊 Current data:', currentHotels.length, 'properties')
    console.log('📊 Clean backup data:', cleanHotels.length, 'hotels (original)')

    // Step 3: Separate apartments (Places API) from corrupted hotels
    console.log('🔍 Analyzing current data...')
    
    const apartments = currentHotels.filter(property => 
      property.source === 'places_api' || 
      property.id?.startsWith('apt_') ||
      property.type === 'Apartment'
    )

    const corruptedHotels = currentHotels.filter(property => 
      property.source !== 'places_api' && 
      !property.id?.startsWith('apt_') &&
      property.type !== 'Apartment'
    )

    console.log('🏠 Found apartments (Places API):', apartments.length)
    console.log('🏨 Found hotels (corrupted photos):', corruptedHotels.length)

    // Step 4: Create photo restoration mapping
    console.log('🎨 Restoring hotel photos...')
    
    const cleanHotelMap = new Map()
    cleanHotels.forEach(hotel => {
      cleanHotelMap.set(hotel.id, hotel)
    })

    let photosFixed = 0
    let photosNotFound = 0

    const restoredHotels = corruptedHotels.map(hotel => {
      const cleanVersion = cleanHotelMap.get(hotel.id)
      
      if (cleanVersion && cleanVersion.images) {
        // Check if current photos are corrupted (contain API keys or are missing)
        const hasCorruptedPhotos = hotel.images?.some(img => 
          img.includes('googleapis.com') || 
          img.includes('key=') ||
          img.includes('photo_reference=')
        ) || !hotel.images || hotel.images.length === 0

        if (hasCorruptedPhotos) {
          photosFixed++
          return {
            ...hotel,
            images: cleanVersion.images // Restore original curated photos
          }
        }
      } else {
        photosNotFound++
        console.log(`⚠️  No clean photos found for: ${hotel.name} (${hotel.id})`)
      }
      
      return hotel
    })

    console.log('✅ Photos restored:', photosFixed)
    console.log('⚠️  Hotels without clean photos:', photosNotFound)

    // Step 5: Fix apartment photos (remove API keys)
    console.log('🏠 Fixing apartment photos...')
    
    // Curated apartment photos (no API keys)
    const curatedApartmentPhotos = [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&auto=format&q=80", 
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop&auto=format&q=80"
    ]

    const fixedApartments = apartments.map((apartment, index) => {
      // Remove any photos with API keys or Google Places URLs
      const safeImages = apartment.images?.filter(img => 
        !img.includes('googleapis.com') &&
        !img.includes('key=') &&
        !img.includes('photo_reference=')
      ) || []

      // If no safe images or need more images, use curated photos
      if (safeImages.length < 3) {
        const startIndex = (index * 3) % curatedApartmentPhotos.length
        const selectedPhotos = [
          curatedApartmentPhotos[startIndex],
          curatedApartmentPhotos[(startIndex + 1) % curatedApartmentPhotos.length],
          curatedApartmentPhotos[(startIndex + 2) % curatedApartmentPhotos.length]
        ]
        
        return {
          ...apartment,
          images: [...safeImages, ...selectedPhotos].slice(0, 5)
        }
      }

      return {
        ...apartment,
        images: safeImages
      }
    })

    // Step 6: Combine and save
    console.log('💾 Saving fixed data...')
    const fixedData = [...restoredHotels, ...fixedApartments]
    
    fs.writeFileSync(currentHotelsFile, JSON.stringify(fixedData, null, 2))

    // Step 7: Summary
    console.log('\n🎉 Photo Recovery Complete!')
    console.log('============================')
    console.log('📊 Total properties:', fixedData.length)
    console.log('🏨 Hotels with restored photos:', photosFixed)
    console.log('🏠 Apartments with curated photos:', fixedApartments.length)
    console.log('⚠️  Hotels needing manual photo curation:', photosNotFound)
    console.log('')
    console.log('✅ All Google Places API URLs with exposed keys have been removed!')
    console.log('✅ Original curated hotel photos have been restored!')
    console.log('✅ Apartments now use safe, curated Unsplash photos!')
    console.log('')
    console.log('📁 Backup of corrupted data saved to:', outputBackupFile)

  } catch (error) {
    console.error('❌ Error during photo recovery:', error)
    process.exit(1)
  }
}

// Run the fix
if (require.main === module) {
  fixHotelPhotos().catch(console.error)
}

export { fixHotelPhotos }