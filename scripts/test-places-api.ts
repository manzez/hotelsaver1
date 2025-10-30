// Test script to verify Google Places API key works
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function testPlacesAPI() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  
  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in environment')
    return
  }

  console.log('🔍 Testing Google Places API...')
  console.log('🗝️ API Key found:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND')
  console.log('🔍 Full key length:', apiKey ? apiKey.length : 'N/A')

  try {
    // Test with a simple nearby search in Lagos
    const testUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=6.5244,3.3792&` +  // Lagos coordinates
      `radius=10000&` +             // 10km radius
      `type=lodging&` +             // Hotels/accommodation
      `key=${apiKey}`

    console.log('📡 Making test API request to Places API...')
    
    const response = await fetch(testUrl)
    const data = await response.json()

    console.log('📊 API Response Status:', data.status)
    
    if (data.status === 'OK') {
      console.log('✅ API Key is working!')
      console.log('🏨 Found', data.results?.length || 0, 'places')
      
      if (data.results && data.results.length > 0) {
        console.log('📍 Sample places:')
        data.results.slice(0, 3).forEach((place: any, i: number) => {
          console.log(`   ${i + 1}. ${place.name} (${place.rating || 'No rating'} stars)`)
        })
      }
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('❌ API Request Denied')
      console.error('💡 This usually means:')
      console.error('   - API key restrictions are too strict')
      console.error('   - Places API is not enabled')
      console.error('   - Billing is not set up')
      console.error('🔧 Error message:', data.error_message)
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('❌ API Quota exceeded')
    } else {
      console.error('❌ API Error:', data.status)
      if (data.error_message) {
        console.error('🔧 Error message:', data.error_message)
      }
    }

  } catch (error) {
    console.error('❌ Network/Request Error:', error)
  }
}

// Run the test
testPlacesAPI().catch(console.error)