#!/usr/bin/env node

/**
 * Google Places API Real Hotel Photos Fetcher
 * 
 * This script fetches real photos from Google Places API for all hotels
 * Replaces the current Unsplash stock images with actual hotel photos
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

interface Hotel {
  id: string;
  name: string;
  city: string;
  type: string;
  basePriceNGN: number;
  stars: number;
  images: string[];
  [key: string]: any;
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

// Nigerian city coordinates for Places API searches
const NIGERIAN_CITIES = {
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Abuja': { lat: 9.0765, lng: 7.3986 },
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'Owerri': { lat: 5.4840, lng: 7.0335 }
};

async function searchHotelOnGoogle(hotelName: string, city: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.log('❌ No Google Places API key found in environment');
    return [];
  }

  try {
    // Step 1: Search for the hotel using Text Search API
    const searchQuery = `${hotelName} hotel ${city} Nigeria`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    console.log(`🔍 Searching for: ${searchQuery}`);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json() as { results: PlaceSearchResult[] };
    
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`❌ No search results for ${hotelName} in ${city}`);
      return [];
    }

    // Find the best match (first result is usually most relevant)
    const hotel = searchData.results[0];
    console.log(`✅ Found: ${hotel.name} (Place ID: ${hotel.place_id})`);

    // Step 2: Get place details including photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${hotel.place_id}&fields=photos&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json() as { result: { photos?: Array<{ photo_reference: string }> } };

    if (!detailsData.result.photos || detailsData.result.photos.length === 0) {
      console.log(`❌ No photos found for ${hotel.name}`);
      return [];
    }

    // Step 3: Generate photo URLs (up to 5 photos)
    const photoUrls = detailsData.result.photos.slice(0, 5).map(photo => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`;
    });

    console.log(`📸 Found ${photoUrls.length} photos for ${hotel.name}`);
    return photoUrls;

  } catch (error) {
    console.error(`❌ Error fetching photos for ${hotelName}:`, error);
    return [];
  }
}

async function updateHotelPhotos() {
  try {
    console.log('🏨 Google Places API Real Hotel Photos Fetcher');
    console.log('===============================================');

    // Check for API key
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.log('❌ GOOGLE_PLACES_API_KEY not found in environment variables');
      console.log('💡 Please add your Google Places API key to .env.local:');
      console.log('   GOOGLE_PLACES_API_KEY="your_api_key_here"');
      return;
    }

    // Load current hotels data
    const hotelsFile = path.join(process.cwd(), 'lib.hotels.json');
    const backupFile = path.join(process.cwd(), `lib.hotels.backup.${new Date().toISOString().split('T')[0]}.json`);
    
    console.log('📖 Loading hotels data...');
    const hotelsData = fs.readFileSync(hotelsFile, 'utf8');
    const hotels: Hotel[] = JSON.parse(hotelsData);
    
    // Create backup
    console.log('💾 Creating backup...');
    fs.writeFileSync(backupFile, hotelsData);
    console.log(`✅ Backup saved: ${backupFile}`);

    console.log(`📊 Processing ${hotels.length} hotels...`);

    // Process hotels in batches to respect API rate limits
    const batchSize = 5;
    const updatedHotels = [...hotels];
    let processedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < hotels.length; i += batchSize) {
      const batch = hotels.slice(i, i + batchSize);
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(hotels.length / batchSize)}`);
      
      const promises = batch.map(async (hotel, batchIndex) => {
        const hotelIndex = i + batchIndex;
        
        try {
          // Skip if it's not a hotel or already has Google Photos
          if (hotel.type !== 'Hotel' || hotel.images?.[0]?.includes('googleapis.com')) {
            console.log(`⏭️  Skipping ${hotel.name} (${hotel.type})`);
            return;
          }

          console.log(`\n📍 Processing: ${hotel.name} in ${hotel.city}`);
          
          const realPhotos = await searchHotelOnGoogle(hotel.name, hotel.city);
          
          if (realPhotos.length > 0) {
            updatedHotels[hotelIndex] = {
              ...hotel,
              images: realPhotos,
              photoSource: 'google_places_api',
              photoUpdatedAt: new Date().toISOString()
            };
            updatedCount++;
            console.log(`✅ Updated ${hotel.name} with ${realPhotos.length} real photos`);
          } else {
            console.log(`⚠️  Keeping original photos for ${hotel.name}`);
          }
          
          processedCount++;
          
        } catch (error) {
          console.error(`❌ Error processing ${hotel.name}:`, error);
        }
      });

      await Promise.all(promises);
      
      // Rate limiting - wait 1 second between batches
      if (i + batchSize < hotels.length) {
        console.log('⏱️  Waiting 1 second for rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Save updated data
    console.log('\n💾 Saving updated hotels data...');
    fs.writeFileSync(hotelsFile, JSON.stringify(updatedHotels, null, 2));
    
    console.log('\n🎉 Photo update complete!');
    console.log('========================');
    console.log(`📊 Total hotels: ${hotels.length}`);
    console.log(`✅ Updated with real photos: ${updatedCount}`);
    console.log(`⏭️  Skipped/unchanged: ${processedCount - updatedCount}`);
    console.log(`💾 Backup saved: ${backupFile}`);
    
    if (updatedCount > 0) {
      console.log('\n🚀 Hotels now have real photos from Google Places API!');
    } else {
      console.log('\n⚠️  No photos were updated. Check API key and internet connection.');
    }

  } catch (error) {
    console.error('❌ Error in photo update process:', error);
  }
}

// Run the script
updateHotelPhotos();