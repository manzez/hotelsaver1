// Sample services for new categories - to be added to lib.services.json

const newServices = [
  // Canopy Hire
  {
    id: "svc-lagos-canopy-hire",
    city: "Lagos",
    category: "Canopy Hire",
    title: "Event Canopy & Tent Rental (Lagos)",
    provider: "Event Pro Rentals",
    summary: "Quality canopies and tents for weddings, parties, and corporate events. Various sizes available.",
    rating: 4.8,
    reviews: 67,
    prices: [
      { name: "Small Canopy (20x20ft)", amountNGN: 25000, duration: "1 day" },
      { name: "Large Canopy (40x60ft)", amountNGN: 65000, duration: "1 day" }
    ],
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 48h before event."
  },
  
  // Chair Hire
  {
    id: "svc-abuja-chair-hire", 
    city: "Abuja",
    category: "Chair Hire",
    title: "Premium Chair Rental Service (Abuja)",
    provider: "Capital Events",
    summary: "Plastic, wooden, and luxury chairs for all events. Clean, comfortable, and professionally delivered.",
    rating: 4.7,
    reviews: 89,
    prices: [
      { name: "Plastic Chairs (per 50)", amountNGN: 15000, duration: "1 day" },
      { name: "Luxury Chairs (per 50)", amountNGN: 35000, duration: "1 day" }
    ],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 24h before."
  },

  // MC Services
  {
    id: "svc-lagos-mc-services",
    city: "Lagos", 
    category: "MC Services",
    title: "Professional Master of Ceremonies (Lagos)",
    provider: "MC Excellence",
    summary: "Experienced MCs for weddings, corporate events, and parties. Bilingual services available.",
    rating: 4.9,
    reviews: 124,
    prices: [
      { name: "Wedding MC", amountNGN: 80000, duration: "Full day" },
      { name: "Corporate Event MC", amountNGN: 120000, duration: "Full day" }
    ],
    images: [
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 7 days before."
  },

  // Cooler Hire
  {
    id: "svc-portharcourt-cooler-hire",
    city: "Port Harcourt",
    category: "Cooler Hire", 
    title: "Industrial Cooler Rental (Port Harcourt)",
    provider: "Cool Rentals PH",
    summary: "Large capacity coolers for events and parties. Keeps drinks ice-cold all day long.",
    rating: 4.6,
    reviews: 43,
    prices: [
      { name: "Medium Cooler (100L)", amountNGN: 12000, duration: "1 day" },
      { name: "Large Cooler (200L)", amountNGN: 20000, duration: "1 day" }
    ],
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 24h before."
  },

  // Sound Equipment Hire
  {
    id: "svc-owerri-sound-hire",
    city: "Owerri",
    category: "Sound Equipment",
    title: "Professional Sound System Rental (Owerri)", 
    provider: "Sound Masters",
    summary: "Complete PA systems, microphones, and speakers for events. Technical support included.",
    rating: 4.8,
    reviews: 56,
    prices: [
      { name: "Basic Sound Package", amountNGN: 45000, duration: "1 day" },
      { name: "Premium Sound Package", amountNGN: 85000, duration: "1 day" }
    ],
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 48h before."
  },

  // DJ Services
  {
    id: "svc-lagos-dj-services",
    city: "Lagos",
    category: "DJ Services", 
    title: "Professional DJ & Entertainment (Lagos)",
    provider: "Beat Masters",
    summary: "Top-rated DJs for weddings, parties, and corporate events. Latest music and professional equipment.",
    rating: 4.9,
    reviews: 178,
    prices: [
      { name: "Party DJ (4 hours)", amountNGN: 60000, duration: "4h" },
      { name: "Wedding DJ (8 hours)", amountNGN: 120000, duration: "8h" }
    ],
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 7 days before."
  },

  // Bus Services
  {
    id: "svc-abuja-bus-hire",
    city: "Abuja",
    category: "Bus Services",
    title: "Group Transportation & Bus Hire (Abuja)",
    provider: "Capital Transport",
    summary: "Clean, air-conditioned buses for group transportation. Perfect for corporate events and weddings.",
    rating: 4.7,
    reviews: 94,
    prices: [
      { name: "18-Seater Bus", amountNGN: 35000, duration: "4h" },
      { name: "50-Seater Bus", amountNGN: 65000, duration: "4h" }
    ],
    images: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 24h before."
  },

  // Live Band
  {
    id: "svc-lagos-live-band",
    city: "Lagos", 
    category: "Live Band",
    title: "Live Music Band for Events (Lagos)",
    provider: "Melody Makers",
    summary: "Professional live bands for weddings and parties. Multiple genres including Afrobeats, Highlife, and Jazz.",
    rating: 4.8,
    reviews: 67,
    prices: [
      { name: "4-Piece Band (4 hours)", amountNGN: 180000, duration: "4h" },
      { name: "8-Piece Band (4 hours)", amountNGN: 320000, duration: "4h" }
    ],
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&auto=format&q=80"
    ],
    cancellation: "Free cancellation up to 14 days before."
  }
]

console.log(JSON.stringify(newServices, null, 2))