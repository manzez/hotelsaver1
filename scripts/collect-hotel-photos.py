#!/usr/bin/env python3
"""
Hotel Photo Collection Script
Collects real hotel photos from multiple free sources
"""

import json
import requests
import time
import os
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HotelPhotoCollector:
    def __init__(self):
        self.google_api_key = os.getenv('GOOGLE_PLACES_API_KEY')  # Set in environment
        self.collected_photos = {}
        
    def search_google_places_photos(self, hotel_name: str, city: str) -> List[str]:
        """Search for hotel photos using Google Places API"""
        if not self.google_api_key:
            logger.warning("Google Places API key not found")
            return []
            
        try:
            # Step 1: Find the place
            search_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
            params = {
                'input': f"{hotel_name} {city} Nigeria",
                'inputtype': 'textquery',
                'fields': 'photos,place_id,name',
                'key': self.google_api_key
            }
            
            response = requests.get(search_url, params=params)
            data = response.json()
            
            if not data.get('candidates'):
                logger.info(f"No Google Places results for {hotel_name}")
                return []
                
            place = data['candidates'][0]
            photos = place.get('photos', [])
            
            if not photos:
                logger.info(f"No photos found for {hotel_name}")
                return []
            
            # Step 2: Get photo URLs
            photo_urls = []
            for photo in photos[:5]:  # Limit to 5 photos
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo['photo_reference']}&key={self.google_api_key}"
                photo_urls.append(photo_url)
            
            logger.info(f"Found {len(photo_urls)} photos for {hotel_name}")
            return photo_urls
            
        except Exception as e:
            logger.error(f"Error searching Google Places for {hotel_name}: {e}")
            return []
    
    def search_website_photos(self, hotel_name: str, website_url: str) -> List[str]:
        """Scrape photos from hotel website"""
        if not website_url or website_url == 'nan':
            return []
            
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            response = requests.get(website_url, headers=headers, timeout=10)
            
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for hotel images
            images = []
            
            # Common hotel image selectors
            selectors = [
                'img[alt*="hotel"]',
                'img[alt*="room"]',
                'img[src*="hotel"]',
                'img[src*="room"]',
                '.gallery img',
                '.hotel-images img',
                '.room-gallery img'
            ]
            
            for selector in selectors:
                img_tags = soup.select(selector)
                for img in img_tags:
                    src = img.get('src') or img.get('data-src')
                    if src:
                        # Convert relative URLs to absolute
                        if src.startswith('/'):
                            from urllib.parse import urljoin
                            src = urljoin(website_url, src)
                        images.append(src)
            
            # Remove duplicates and limit to 3 images
            unique_images = list(dict.fromkeys(images))[:3]
            logger.info(f"Found {len(unique_images)} images from {hotel_name} website")
            return unique_images
            
        except Exception as e:
            logger.error(f"Error scraping {hotel_name} website: {e}")
            return []
    
    def get_fallback_images(self, hotel_name: str, city: str, hotel_type: str) -> List[str]:
        """Get curated fallback images based on hotel characteristics"""
        
        # Curated hotel images by type and city
        fallback_images = {
            'luxury': [
                "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&auto=format&q=80"
            ],
            'business': [
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&h=600&fit=crop&auto=format&q=80"
            ],
            'apartment': [
                "https://images.unsplash.com/photo-1559599189-95f32f16b150?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1562790351-d273a961e0e4?w=800&h=600&fit=crop&auto=format&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80"
            ]
        }
        
        # Determine category
        name_lower = hotel_name.lower()
        if any(word in name_lower for word in ['luxury', 'grand', 'royal', 'marriott', 'hilton']):
            category = 'luxury'
        elif hotel_type.lower() == 'apartment':
            category = 'apartment'
        else:
            category = 'business'
        
        return fallback_images[category]
    
    def collect_photos_for_hotel(self, hotel: Dict) -> Dict:
        """Collect photos for a single hotel"""
        hotel_name = hotel['name']
        city = hotel['city']
        website = hotel.get('website', '')
        hotel_type = hotel.get('type', 'Hotel')
        
        logger.info(f"Collecting photos for {hotel_name} in {city}")
        
        all_photos = []
        
        # 1. Try Google Places first (best quality)
        google_photos = self.search_google_places_photos(hotel_name, city)
        all_photos.extend(google_photos)
        
        # 2. Try hotel website if we need more photos
        if len(all_photos) < 3 and website:
            website_photos = self.search_website_photos(hotel_name, website)
            all_photos.extend(website_photos)
        
        # 3. Use curated fallbacks if still not enough
        if len(all_photos) < 5:
            fallback_photos = self.get_fallback_images(hotel_name, city, hotel_type)
            needed = 5 - len(all_photos)
            all_photos.extend(fallback_photos[:needed])
        
        # Update hotel data
        updated_hotel = hotel.copy()
        updated_hotel['images'] = all_photos[:5]  # Limit to 5 images
        
        # Rate limiting for API calls
        time.sleep(0.1)
        
        return updated_hotel
    
    def process_all_hotels(self, input_file: str, output_file: str):
        """Process all hotels and collect photos"""
        
        with open(input_file, 'r') as f:
            hotels = json.load(f)
        
        logger.info(f"Processing {len(hotels)} hotels...")
        
        updated_hotels = []
        
        for i, hotel in enumerate(hotels):
            try:
                updated_hotel = self.collect_photos_for_hotel(hotel)
                updated_hotels.append(updated_hotel)
                
                # Progress update
                if (i + 1) % 10 == 0:
                    logger.info(f"Processed {i + 1}/{len(hotels)} hotels")
                
            except Exception as e:
                logger.error(f"Error processing {hotel.get('name', 'Unknown')}: {e}")
                updated_hotels.append(hotel)  # Keep original if error
        
        # Save updated hotels
        with open(output_file, 'w') as f:
            json.dump(updated_hotels, f, indent=2)
        
        logger.info(f"Saved updated hotels to {output_file}")
        
        # Generate report
        self.generate_report(updated_hotels)
    
    def generate_report(self, hotels: List[Dict]):
        """Generate a report of photo collection results"""
        
        total_hotels = len(hotels)
        hotels_with_real_photos = 0
        hotels_with_fallback_only = 0
        
        for hotel in hotels:
            images = hotel.get('images', [])
            has_real_photos = any('googleapis.com' in img or hotel.get('website', '') in img for img in images)
            
            if has_real_photos:
                hotels_with_real_photos += 1
            else:
                hotels_with_fallback_only += 1
        
        report = f"""
HOTEL PHOTO COLLECTION REPORT
============================

Total Hotels: {total_hotels}
Hotels with Real Photos: {hotels_with_real_photos} ({hotels_with_real_photos/total_hotels*100:.1f}%)
Hotels with Fallback Only: {hotels_with_fallback_only} ({hotels_with_fallback_only/total_hotels*100:.1f}%)

To improve real photo coverage:
1. Set GOOGLE_PLACES_API_KEY environment variable
2. Contact hotels directly for photo permissions
3. Use hotel booking APIs (Booking.com, Expedia)
"""
        
        print(report)
        
        with open('photo-collection-report.txt', 'w') as f:
            f.write(report)

def main():
    collector = HotelPhotoCollector()
    
    # Process hotels
    collector.process_all_hotels(
        input_file='lib.hotels.json',
        output_file='lib.hotels.updated.json'
    )

if __name__ == "__main__":
    main()