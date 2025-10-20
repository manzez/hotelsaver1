# Hotel Photo Collection Guide

## Free Methods to Get Real Hotel Photos

### 1. **Google Places API (Recommended - FREE)**

**Setup:**
```bash
# Get free API key from Google Cloud Console
# 25,000+ requests per month free
# https://console.cloud.google.com/apis/library/places-backend.googleapis.com

export GOOGLE_PLACES_API_KEY="your_api_key_here"
```

**Benefits:**
- ✅ Real photos uploaded by hotels and customers
- ✅ High quality images (up to 1600px)
- ✅ 25,000+ free requests monthly
- ✅ Already cropped and optimized
- ✅ Most reliable source

### 2. **Web Scraping Hotel Websites**

**Setup:**
```bash
pip install requests beautifulsoup4 lxml
```

**Benefits:**
- ✅ Official hotel photos
- ✅ Professional quality
- ✅ Unlimited (if respectful)
- ❌ Requires legal compliance

### 3. **Hotel Direct Outreach (Best Quality)**

**Email Template:**
```
Subject: Partnership Opportunity - HotelSaver.ng

Dear [Hotel Name] Team,

We're building Nigeria's leading hotel booking platform, HotelSaver.ng, 
featuring over 250 hotels across Lagos, Abuja, Port Harcourt, and Owerri.

We'd love to feature your property with professional photos to drive 
bookings directly to you.

Could you share:
- 3-5 high-resolution photos (exterior, rooms, amenities)
- Permission to use them on our platform
- Logo/branding materials

In return, we'll:
✅ Drive qualified booking inquiries to you
✅ Feature your hotel prominently in search results
✅ Provide proper photo attribution
✅ Share booking analytics monthly

Ready to partner with us?

Best regards,
[Your Name]
HotelSaver.ng Team
```

### 4. **Booking APIs (Free Tiers)**

**TripAdvisor Content API:**
- Free tier: 500 requests/day
- Real traveler photos
- Hotel information and reviews

**Booking.com Partner Hub:**
- Apply for partner program
- Access to hotel photos and content
- Revenue sharing model

### 5. **Social Media Scraping**

**Instagram/Facebook:**
```python
# Search for hotel hashtags and location tags
hashtags = [
    f"#{hotel_name.replace(' ', '')}",
    f"#{city}hotels",
    f"#{hotel_name}{city}"
]

# Use Instagram Basic Display API (free)
# https://developers.facebook.com/docs/instagram-basic-display-api
```

## Implementation Steps

### Step 1: Run the Photo Update Script

```bash
cd /Users/mac/Downloads/hotelsaver-ng-v9
python3 scripts/update-hotel-photos.py
```

### Step 2: Set Up Google Places API (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Places API
4. Create API key
5. Set usage limits (25,000/month free)

```bash
export GOOGLE_PLACES_API_KEY="your_key_here"
python3 scripts/collect-hotel-photos.py
```

### Step 3: Contact Hotels Directly

Create a spreadsheet from your hotel data:

```python
import json
import csv

with open('lib.hotels.json', 'r') as f:
    hotels = json.load(f)

with open('hotel-contacts.csv', 'w') as f:
    writer = csv.writer(f)
    writer.writerow(['Hotel Name', 'City', 'Email', 'Phone', 'Website'])
    
    for hotel in hotels:
        writer.writerow([
            hotel['name'],
            hotel['city'],
            hotel.get('email', ''),
            hotel.get('phone', ''),
            hotel.get('website', '')
        ])
```

### Step 4: Legal Compliance

**Create Terms for Photo Usage:**
```
Photo Usage Terms:
- Photos used only for hotel booking purposes
- Proper attribution provided
- No commercial licensing/resale
- Removal upon hotel request
- Fair use for booking platform
```

## Expected Results

### Current State (After Running Scripts):
- ✅ All 258 hotels have high-quality curated images
- ✅ Images matched to hotel type and star rating
- ✅ Professional appearance maintained

### With Google Places API:
- 🎯 60-80% real hotel photos
- 📸 3-5 authentic images per hotel
- ⚡ Automated collection process

### With Hotel Outreach:
- 🎯 90%+ real hotel photos
- 📸 Professional marketing materials
- 🤝 Direct hotel partnerships
- 📈 Better booking conversion rates

### With Combined Approach:
- 🎯 95%+ real hotel photos
- 📸 Multiple angles and room types
- 🏆 Premium platform appearance
- 💰 Increased booking revenue

## Cost Analysis

| Method | Cost | Real Photo Rate | Time Investment |
|--------|------|-----------------|-----------------|
| Current Curated | $0 | 0% | 1 hour |
| Google Places API | $0 | 70% | 2 hours |
| Web Scraping | $0 | 40% | 4 hours |
| Hotel Outreach | $0 | 90% | 20 hours |
| Booking APIs | $0-$50/month | 80% | 8 hours |

## Next Steps

1. **Immediate:** Run the photo update script ✅
2. **This week:** Set up Google Places API
3. **This month:** Contact top 50 hotels directly
4. **Ongoing:** Monitor photo quality and update regularly

## Legal Notes

- ✅ Unsplash images: Free for commercial use
- ✅ Google Places photos: Allowed for booking platforms
- ⚠️ Website scraping: Check robots.txt and terms
- ⚠️ Hotel photos: Get permission when possible
- ✅ Fair use: Educational/booking purposes generally allowed

## ROI Impact

**With Real Photos:**
- 📈 40% higher click-through rates
- 💰 25% better conversion rates
- 🎯 Improved user trust and engagement
- 🏆 Professional platform credibility