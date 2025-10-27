import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Only allow Google Maps API images for security
    if (!imageUrl.includes('maps.googleapis.com')) {
      return NextResponse.json({ error: 'Invalid image source' }, { status: 403 })
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'HotelSaver/1.0 (Next.js App)',
        'Accept': 'image/*',
      },
    })

    if (!response.ok) {
      // If Google Maps API fails, return a hotel-themed fallback image
      const fallbackResponse = await fetch('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80')
      
      if (fallbackResponse.ok) {
        const fallbackBuffer = await fallbackResponse.arrayBuffer()
        return new NextResponse(fallbackBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } else {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })
      }
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Image proxy error:', error)
    
    // Return fallback image on any error
    try {
      const fallbackResponse = await fetch('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80')
      if (fallbackResponse.ok) {
        const fallbackBuffer = await fallbackResponse.arrayBuffer()
        return new NextResponse(fallbackBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    } catch (fallbackError) {
      console.error('Fallback image error:', fallbackError)
    }
    
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 })
  }
}