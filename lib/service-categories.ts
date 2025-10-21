// Service categories and subcategories for HotelSaver.ng
// Organized for Nigerian market preferences

export type ServiceCategory = {
  id: string
  name: string
  icon: string
  color: string
  subcategories: ServiceSubcategory[]
}

export type ServiceSubcategory = {
  id: string
  name: string
  description: string
  icon: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    icon: '💄',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    subcategories: [
      { id: 'hair', name: 'Hair Services', description: 'Professional styling, braiding, treatments', icon: '💇‍♀️' },
      { id: 'nails', name: 'Nail Care', description: 'Manicure, pedicure, nail art', icon: '💅' },
      { id: 'makeup', name: 'Makeup & Skincare', description: 'Professional makeup, facial treatments', icon: '💋' },
      { id: 'braiding', name: 'Hair Braiding', description: 'Traditional and modern braiding styles', icon: '🪄' },
      { id: 'spa', name: 'Spa Services', description: 'Relaxation and rejuvenation treatments', icon: '🧖‍♀️' },
      { id: 'massage', name: 'Massage Therapy', description: 'Therapeutic and relaxation massage', icon: '💆‍♀️' }
    ]
  },
  {
    id: 'hire',
    name: 'Equipment & Venue Hire',
    icon: '🎪',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    subcategories: [
      { id: 'canopy-hire', name: 'Canopy Hire', description: 'Tents and canopies for events', icon: '⛺' },
      { id: 'chair-hire', name: 'Chair Hire', description: 'Plastic, wooden, and luxury seating', icon: '🪑' },
      { id: 'mc-hire', name: 'MC Services', description: 'Master of ceremonies for events', icon: '🎤' },
      { id: 'cooler-hire', name: 'Cooler Hire', description: 'Industrial and party coolers', icon: '🧊' },
      { id: 'sound-hire', name: 'Sound Equipment', description: 'PA systems, microphones, speakers', icon: '🔊' },
      { id: 'decoration-hire', name: 'Decoration Items', description: 'Event decoration and setup', icon: '🎈' }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment Services',
    icon: '🎭',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    subcategories: [
      { id: 'dj-services', name: 'DJ Services', description: 'Professional DJs for events', icon: '🎧' },
      { id: 'live-band', name: 'Live Bands', description: 'Musicians and live entertainment', icon: '🎸' },
      { id: 'photographer', name: 'Photography', description: 'Event and portrait photography', icon: '📸' },
      { id: 'videographer', name: 'Videography', description: 'Professional video production', icon: '🎬' },
      { id: 'comedian', name: 'Comedians', description: 'Stand-up comedy and entertainment', icon: '😄' },
      { id: 'dancer', name: 'Dancers', description: 'Traditional and modern dance performances', icon: '💃' }
    ]
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: '🚗',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    subcategories: [
      { id: 'car-hire', name: 'Car Rental', description: 'Private cars with or without driver', icon: '🚙' },
      { id: 'bus-hire', name: 'Bus Services', description: 'Group transportation and shuttles', icon: '🚌' },
      { id: 'bike-hire', name: 'Motorcycle Services', description: 'Okada and dispatch services', icon: '🏍️' },
      { id: 'luxury-car', name: 'Luxury Vehicles', description: 'Premium cars for special occasions', icon: '🚘' },
      { id: 'airport-transfer', name: 'Airport Transfers', description: 'Reliable airport pickup and drop-off', icon: '✈️' }
    ]
  },
  {
    id: 'home-services',
    name: 'Home & Lifestyle',
    icon: '🏠',
    color: 'bg-green-50 border-green-200 text-green-800',
    subcategories: [
      { id: 'cleaning', name: 'House Cleaning', description: 'Professional home and office cleaning', icon: '🧹' },
      { id: 'laundry', name: 'Laundry Services', description: 'Washing, ironing, and dry cleaning', icon: '👔' },
      { id: 'security', name: 'Security Services', description: 'Personal and property security', icon: '🛡️' },
      { id: 'babysitting', name: 'Childcare', description: 'Professional babysitting and nanny services', icon: '👶' },
      { id: 'pet-care', name: 'Pet Services', description: 'Pet grooming and care services', icon: '🐕' },
      { id: 'gardening', name: 'Gardening', description: 'Landscaping and garden maintenance', icon: '🌱' }
    ]
  },
  {
    id: 'food-services',
    name: 'Food & Catering',
    icon: '🍽️',
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    subcategories: [
      { id: 'catering', name: 'Event Catering', description: 'Full-service catering for events', icon: '🍛' },
      { id: 'chef', name: 'Private Chef', description: 'Personal cooking services at home', icon: '👨‍🍳' },
      { id: 'food-delivery', name: 'Food Delivery', description: 'Restaurant and home-cooked meals', icon: '🛵' },
      { id: 'baking', name: 'Baking Services', description: 'Custom cakes and pastries', icon: '🍰' },
      { id: 'bar-service', name: 'Bar Services', description: 'Professional bartending for events', icon: '🍹' }
    ]
  },
  {
    id: 'professional',
    name: 'Professional Services',
    icon: '💼',
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    subcategories: [
      { id: 'translation', name: 'Translation', description: 'Language translation and interpretation', icon: '🗣️' },
      { id: 'tutoring', name: 'Training & Tutoring', description: 'Educational and skill training', icon: '📚' },
      { id: 'legal', name: 'Legal Services', description: 'Legal consultation and documentation', icon: '⚖️' },
      { id: 'accounting', name: 'Accounting', description: 'Bookkeeping and financial services', icon: '📊' },
      { id: 'it-support', name: 'IT Support', description: 'Computer and technical support', icon: '💻' }
    ]
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Livestock',
    icon: '🐄',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    subcategories: [
      { id: 'livestock', name: 'Livestock Supply', description: 'Goats, cows, and other livestock', icon: '🐐' },
      { id: 'farming', name: 'Farming Services', description: 'Agricultural services and consulting', icon: '🚜' },
      { id: 'veterinary', name: 'Veterinary Services', description: 'Animal health and care', icon: '🩺' },
      { id: 'produce', name: 'Fresh Produce', description: 'Farm-fresh fruits and vegetables', icon: '🥬' }
    ]
  }
]

// Helper functions
export function getCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(cat => cat.id === id)
}

export function getSubcategoryById(categoryId: string, subcategoryId: string): ServiceSubcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories.find(sub => sub.id === subcategoryId)
}

export function getAllSubcategories(): ServiceSubcategory[] {
  return SERVICE_CATEGORIES.flatMap(cat => cat.subcategories)
}

// Map legacy category names to new structure
export function mapLegacyCategory(legacyCategory: string): { categoryId: string; subcategoryId: string } | null {
  const mapping: Record<string, { categoryId: string; subcategoryId: string }> = {
    // Beauty & Wellness
    'Hair': { categoryId: 'beauty', subcategoryId: 'hair' },
    'Nails': { categoryId: 'beauty', subcategoryId: 'nails' },
    'Makeup': { categoryId: 'beauty', subcategoryId: 'makeup' },
    'Braiding': { categoryId: 'beauty', subcategoryId: 'braiding' },
    'Spa': { categoryId: 'beauty', subcategoryId: 'spa' },
    'Massage': { categoryId: 'beauty', subcategoryId: 'massage' },
    
    // Equipment & Venue Hire
    'Canopy Hire': { categoryId: 'hire', subcategoryId: 'canopy-hire' },
    'Chair Hire': { categoryId: 'hire', subcategoryId: 'chair-hire' },
    'MC Services': { categoryId: 'hire', subcategoryId: 'mc-hire' },
    'Cooler Hire': { categoryId: 'hire', subcategoryId: 'cooler-hire' },
    'Sound Equipment': { categoryId: 'hire', subcategoryId: 'sound-hire' },
    'Decoration Items': { categoryId: 'hire', subcategoryId: 'decoration-hire' },
    
    // Entertainment
    'DJ Services': { categoryId: 'entertainment', subcategoryId: 'dj-services' },
    'Live Band': { categoryId: 'entertainment', subcategoryId: 'live-band' },
    'Photography': { categoryId: 'entertainment', subcategoryId: 'photographer' },
    'Videography': { categoryId: 'entertainment', subcategoryId: 'videographer' },
    'Comedy': { categoryId: 'entertainment', subcategoryId: 'comedian' },
    'Dancing': { categoryId: 'entertainment', subcategoryId: 'dancer' },
    
    // Transportation
    'Car hire': { categoryId: 'transport', subcategoryId: 'car-hire' },
    'Bus Services': { categoryId: 'transport', subcategoryId: 'bus-hire' },
    'Motorcycle': { categoryId: 'transport', subcategoryId: 'bike-hire' },
    'Luxury Car': { categoryId: 'transport', subcategoryId: 'luxury-car' },
    'Airport Transfer': { categoryId: 'transport', subcategoryId: 'airport-transfer' },
    'Guide': { categoryId: 'transport', subcategoryId: 'car-hire' },
    
    // Home & Lifestyle
    'Cleaning': { categoryId: 'home-services', subcategoryId: 'cleaning' },
    'Laundry': { categoryId: 'home-services', subcategoryId: 'laundry' },
    'Dry Cleaning': { categoryId: 'home-services', subcategoryId: 'laundry' },
    'Security': { categoryId: 'home-services', subcategoryId: 'security' },
    'Babysitting': { categoryId: 'home-services', subcategoryId: 'babysitting' },
    'Pet grooming': { categoryId: 'home-services', subcategoryId: 'pet-care' },
    'Gardening': { categoryId: 'home-services', subcategoryId: 'gardening' },
    
    // Food & Catering
    'Catering': { categoryId: 'food-services', subcategoryId: 'catering' },
    'Chef': { categoryId: 'food-services', subcategoryId: 'chef' },
    'Food Delivery': { categoryId: 'food-services', subcategoryId: 'food-delivery' },
    'Baking': { categoryId: 'food-services', subcategoryId: 'baking' },
    'Bar Service': { categoryId: 'food-services', subcategoryId: 'bar-service' },
    
    // Professional Services
    'Translation': { categoryId: 'professional', subcategoryId: 'translation' },
    'Training': { categoryId: 'professional', subcategoryId: 'tutoring' },
    'Legal': { categoryId: 'professional', subcategoryId: 'legal' },
    'Accounting': { categoryId: 'professional', subcategoryId: 'accounting' },
    'IT Support': { categoryId: 'professional', subcategoryId: 'it-support' },
    
    // Agriculture & Livestock
    'Livestock': { categoryId: 'agriculture', subcategoryId: 'livestock' },
    'Farming': { categoryId: 'agriculture', subcategoryId: 'farming' },
    'Veterinary': { categoryId: 'agriculture', subcategoryId: 'veterinary' },
    'Fresh Produce': { categoryId: 'agriculture', subcategoryId: 'produce' }
  }
  
  return mapping[legacyCategory] || null
}