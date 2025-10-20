#!/usr/bin/env python3
"""
Simple Hotel Photo Updater - No API Keys Required
Updates hotel photos using web scraping and improved fallback images
"""

import json
import requests
import time
import random
from typing import List, Dict

def get_enhanced_hotel_images(hotel_name: str, city: str, hotel_type: str, stars: int) -> List[str]:
    """Get enhanced curated images based on hotel characteristics"""
    
    # High-quality hotel images categorized by type and rating
    luxury_hotels = [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop&auto=format&q=80"
    ]
    
    business_hotels = [
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1559599189-95f32f16b150?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1562790351-d273a961e0e4?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d56?w=800&h=600&fit=crop&auto=format&q=80"
    ]
    
    apartment_suites = [
        "https://images.unsplash.com/photo-1507138451611-3001135909b3?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1560185008-b033106afc83?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80"
    ]
    
    resort_hotels = [
        "https://images.unsplash.com/photo-1625244724120-1fd1d34d00ba?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1552902865-b72c031ac5a9?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop&auto=format&q=80",
        "https://images.unsplash.com/photo-1625244724120-1fd1d34d00ba?w=800&h=600&fit=crop&auto=format&q=80"
    ]
    
    # Determine hotel category
    name_lower = hotel_name.lower()
    
    # 5-star luxury hotels
    if stars >= 5 or any(word in name_lower for word in [
        'marriott', 'hilton', 'sheraton', 'continental', 'presidential', 
        'palace', 'grand', 'royal', 'luxury', 'international', 'swiss'
    ]):
        selected_images = luxury_hotels
    
    # Apartments and suites
    elif hotel_type.lower() in ['apartment', 'suite'] or any(word in name_lower for word in [
        'suites', 'apartment', 'residence', 'villa'
    ]):
        selected_images = apartment_suites
    
    # Resorts
    elif hotel_type.lower() == 'resort' or any(word in name_lower for word in [
        'resort', 'spa', 'retreat'
    ]):
        selected_images = resort_hotels
    
    # Business/standard hotels
    else:
        selected_images = business_hotels
    
    # Return 5 random images from the selected category
    return random.sample(selected_images, min(5, len(selected_images)))

def try_scrape_hotel_website(hotel_name: str, website_url: str) -> List[str]:
    """Try to scrape real photos from hotel website"""
    if not website_url or website_url in ['nan', '', 'N/A']:
        return []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(website_url, headers=headers, timeout=5)
        if response.status_code != 200:
            return []
        
        # Simple image extraction (without BeautifulSoup dependency)
        content = response.text.lower()
        
        # Look for common hotel image patterns in HTML
        image_urls = []
        
        # This is a very basic approach - in production you'd use BeautifulSoup
        import re
        
        # Find image URLs
        img_patterns = [
            r'src=["\']([^"\']*(?:hotel|room|lobby|pool)[^"\']*\.(?:jpg|jpeg|png|webp))["\']',
            r'data-src=["\']([^"\']*(?:hotel|room|lobby|pool)[^"\']*\.(?:jpg|jpeg|png|webp))["\']'
        ]
        
        for pattern in img_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if match.startswith('http'):
                    image_urls.append(match)
                elif match.startswith('/'):
                    from urllib.parse import urljoin
                    image_urls.append(urljoin(website_url, match))
        
        # Remove duplicates and limit
        unique_urls = list(dict.fromkeys(image_urls))[:3]
        return unique_urls
        
    except Exception as e:
        print(f"Could not scrape {hotel_name}: {e}")
        return []

def update_hotel_photos():
    """Update all hotel photos with better images"""
    
    # Load existing hotels
    with open('lib.hotels.json', 'r') as f:
        hotels = json.load(f)
    
    print(f"Updating photos for {len(hotels)} hotels...")
    
    updated_count = 0
    scraped_count = 0
    
    for i, hotel in enumerate(hotels):
        try:
            hotel_name = hotel['name']
            city = hotel['city']
            hotel_type = hotel.get('type', 'Hotel')
            stars = hotel.get('stars', 3)
            website = hotel.get('website', '')
            
            # Try to get real photos from website first
            real_photos = []
            if website:
                real_photos = try_scrape_hotel_website(hotel_name, website)
                if real_photos:
                    scraped_count += 1
            
            # Get curated fallback images
            fallback_images = get_enhanced_hotel_images(hotel_name, city, hotel_type, stars)
            
            # Combine real photos with fallbacks
            all_photos = real_photos + fallback_images
            
            # Update hotel images (limit to 5)
            hotel['images'] = all_photos[:5]
            updated_count += 1
            
            # Progress update
            if (i + 1) % 20 == 0:
                print(f"Updated {i + 1}/{len(hotels)} hotels...")
            
            # Small delay to be respectful to websites
            time.sleep(0.1)
            
        except Exception as e:
            print(f"Error updating {hotel.get('name', 'Unknown')}: {e}")
    
    # Save updated hotels
    with open('lib.hotels.json', 'w') as f:
        json.dump(hotels, f, indent=2)
    
    print(f"\n✅ Photo Update Complete!")
    print(f"- Updated: {updated_count} hotels")
    print(f"- Real photos scraped: {scraped_count} hotels")
    print(f"- All hotels now have high-quality curated images")

if __name__ == "__main__":
    update_hotel_photos()