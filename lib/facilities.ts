export type FacilityKey =
  // Popular, high-level
  | 'swimming_pool'
  | 'playground'
  | 'gym'
  | 'bar'
  | 'car_park'
  | 'wifi'
  | 'restaurant'
  | 'spa'
  | 'airport_shuttle'
  | 'conference_room'
  | 'security'
  | 'room_service'
  | 'non_smoking'
  | 'family_rooms'
  // Detailed groups per pasted list
  | 'parking_free_private_on_site'
  | 'wifi_all_areas_free'
  | 'child_high_chair'
  | 'dining_table'
  | 'cleaning_products'
  | 'toaster'
  | 'stovetop'
  | 'oven'
  | 'kitchenware'
  | 'electric_kettle'
  | 'kitchen'
  | 'dishwasher'
  | 'microwave'
  | 'refrigerator'
  | 'linen'
  | 'toilet_paper'
  | 'towels'
  | 'bath_or_shower'
  | 'toilet'
  | 'free_toiletries'
  | 'hairdryer'
  | 'bath'
  | 'shower'
  | 'dining_area'
  | 'sofa'
  | 'fireplace'
  | 'seating_area'
  | 'flat_screen_tv'
  | 'radio'
  | 'tv'
  | 'socket_near_bed'
  | 'sofa_bed'
  | 'drying_rack'
  | 'clothes_rack'
  | 'private_entrance'
  | 'carpeted'
  | 'heating'
  | 'fan'
  | 'iron'
  | 'pets_allowed_charges_may_apply'
  | 'entire_unit_ground_floor'
  | 'outdoor_furniture'
  | 'outdoor_dining_area'
  | 'patio'
  | 'terrace'
  | 'garden'
  | 'tea_coffee_maker'
  | 'inner_courtyard_view'
  | 'garden_view'
  | 'luggage_storage'
  | 'board_games_puzzles'
  | 'kids_media'
  | 'non_smoking_throughout'
  | 'carbon_monoxide_detector'
  | 'english'

export type FacilityInfo = {
  key: FacilityKey
  label: string
  icon?: string // simple emoji/icon for now
}

export const FACILITY_CATALOG: Record<FacilityKey, FacilityInfo> = {
  swimming_pool: { key: 'swimming_pool', label: 'Swimming pool', icon: '🏊' },
  playground: { key: 'playground', label: 'Playground', icon: '🛝' },
  gym: { key: 'gym', label: 'Gym', icon: '🏋️' },
  bar: { key: 'bar', label: 'Bar', icon: '🍸' },
  car_park: { key: 'car_park', label: 'Car park', icon: '🅿️' },
  wifi: { key: 'wifi', label: 'Free Wi‑Fi', icon: '📶' },
  restaurant: { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  spa: { key: 'spa', label: 'Spa', icon: '💆' },
  airport_shuttle: { key: 'airport_shuttle', label: 'Airport shuttle', icon: '🚌' },
  conference_room: { key: 'conference_room', label: 'Conference room', icon: '🏢' },
  security: { key: 'security', label: '24/7 security', icon: '🛡️' },
  room_service: { key: 'room_service', label: 'Room service', icon: '🛎️' },
  non_smoking: { key: 'non_smoking', label: 'Non‑smoking rooms', icon: '🚭' },
  family_rooms: { key: 'family_rooms', label: 'Family rooms', icon: '👨‍👩‍👧‍👦' },
  parking_free_private_on_site: { key: 'parking_free_private_on_site', label: 'Free private parking on site', icon: '🅿️' },
  wifi_all_areas_free: { key: 'wifi_all_areas_free', label: 'WiFi in all areas (free)', icon: '📶' },
  child_high_chair: { key: 'child_high_chair', label: "Children's high chair" },
  dining_table: { key: 'dining_table', label: 'Dining table' },
  cleaning_products: { key: 'cleaning_products', label: 'Cleaning products' },
  toaster: { key: 'toaster', label: 'Toaster' },
  stovetop: { key: 'stovetop', label: 'Stovetop' },
  oven: { key: 'oven', label: 'Oven' },
  kitchenware: { key: 'kitchenware', label: 'Kitchenware' },
  electric_kettle: { key: 'electric_kettle', label: 'Electric kettle', icon: '🔌' },
  kitchen: { key: 'kitchen', label: 'Kitchen', icon: '🍳' },
  dishwasher: { key: 'dishwasher', label: 'Dishwasher', icon: '🧼' },
  microwave: { key: 'microwave', label: 'Microwave', icon: '🍲' },
  refrigerator: { key: 'refrigerator', label: 'Refrigerator', icon: '🧊' },
  linen: { key: 'linen', label: 'Linen' },
  toilet_paper: { key: 'toilet_paper', label: 'Toilet paper' },
  towels: { key: 'towels', label: 'Towels' },
  bath_or_shower: { key: 'bath_or_shower', label: 'Bath or shower', icon: '🛁' },
  toilet: { key: 'toilet', label: 'Toilet' },
  free_toiletries: { key: 'free_toiletries', label: 'Free toiletries' },
  hairdryer: { key: 'hairdryer', label: 'Hairdryer' },
  bath: { key: 'bath', label: 'Bath' },
  shower: { key: 'shower', label: 'Shower', icon: '🚿' },
  dining_area: { key: 'dining_area', label: 'Dining area' },
  sofa: { key: 'sofa', label: 'Sofa' },
  fireplace: { key: 'fireplace', label: 'Fireplace' },
  seating_area: { key: 'seating_area', label: 'Seating area' },
  flat_screen_tv: { key: 'flat_screen_tv', label: 'Flat-screen TV', icon: '📺' },
  radio: { key: 'radio', label: 'Radio' },
  tv: { key: 'tv', label: 'TV' },
  socket_near_bed: { key: 'socket_near_bed', label: 'Socket near the bed' },
  sofa_bed: { key: 'sofa_bed', label: 'Sofa bed' },
  drying_rack: { key: 'drying_rack', label: 'Drying rack for clothing' },
  clothes_rack: { key: 'clothes_rack', label: 'Clothes rack' },
  private_entrance: { key: 'private_entrance', label: 'Private entrance' },
  carpeted: { key: 'carpeted', label: 'Carpeted' },
  heating: { key: 'heating', label: 'Heating' },
  fan: { key: 'fan', label: 'Fan' },
  iron: { key: 'iron', label: 'Iron' },
  pets_allowed_charges_may_apply: { key: 'pets_allowed_charges_may_apply', label: 'Pets allowed (charges may apply)' },
  entire_unit_ground_floor: { key: 'entire_unit_ground_floor', label: 'Entire unit located on ground floor' },
  outdoor_furniture: { key: 'outdoor_furniture', label: 'Outdoor furniture', icon: '🪑' },
  outdoor_dining_area: { key: 'outdoor_dining_area', label: 'Outdoor dining area', icon: '🍽️' },
  patio: { key: 'patio', label: 'Patio', icon: '🏡' },
  terrace: { key: 'terrace', label: 'Terrace', icon: '🌿' },
  garden: { key: 'garden', label: 'Garden', icon: '🌳' },
  tea_coffee_maker: { key: 'tea_coffee_maker', label: 'Tea/Coffee maker', icon: '☕' },
  inner_courtyard_view: { key: 'inner_courtyard_view', label: 'Inner courtyard view' },
  garden_view: { key: 'garden_view', label: 'Garden view' },
  luggage_storage: { key: 'luggage_storage', label: 'Luggage storage', icon: '🧳' },
  board_games_puzzles: { key: 'board_games_puzzles', label: 'Board games/puzzles', icon: '🎲' },
  kids_media: { key: 'kids_media', label: 'Books, DVDs, or music for children' },
  non_smoking_throughout: { key: 'non_smoking_throughout', label: 'Non-smoking throughout', icon: '🚭' },
  carbon_monoxide_detector: { key: 'carbon_monoxide_detector', label: 'Carbon monoxide detector', icon: '🚨' },
  english: { key: 'english', label: 'English', icon: '🇬🇧' }
}

// Group definition for admin UI and detailed rendering
export type FacilityGroup = {
  id: string
  label: string
  items: FacilityKey[]
}

export const FACILITY_GROUPS: FacilityGroup[] = [
  { id: 'parking', label: 'Parking', items: ['parking_free_private_on_site', 'car_park'] },
  { id: 'internet', label: 'Internet', items: ['wifi_all_areas_free', 'wifi'] },
  { id: 'kitchen', label: 'Kitchen', items: ['child_high_chair','dining_table','cleaning_products','toaster','stovetop','oven','kitchenware','electric_kettle','kitchen','dishwasher','microwave','refrigerator'] },
  { id: 'bedroom', label: 'Bedroom', items: ['linen'] },
  { id: 'bathroom', label: 'Bathroom', items: ['toilet_paper','towels','bath_or_shower','toilet','free_toiletries','hairdryer','bath','shower'] },
  { id: 'living_area', label: 'Living Area', items: ['dining_area','sofa','fireplace','seating_area'] },
  { id: 'media_tech', label: 'Media & Technology', items: ['flat_screen_tv','radio','tv'] },
  { id: 'room_amenities', label: 'Room Amenities', items: ['socket_near_bed','sofa_bed','drying_rack','clothes_rack','private_entrance','carpeted','heating','fan','iron'] },
  { id: 'pets', label: 'Pets', items: ['pets_allowed_charges_may_apply'] },
  { id: 'accessibility', label: 'Accessibility', items: ['entire_unit_ground_floor'] },
  { id: 'outdoors', label: 'Outdoors', items: ['outdoor_furniture','outdoor_dining_area','patio','terrace','garden'] },
  { id: 'food_drink', label: 'Food & Drink', items: ['tea_coffee_maker','restaurant','bar'] },
  { id: 'outdoor_view', label: 'Outdoor & View', items: ['inner_courtyard_view','garden_view'] },
  { id: 'reception', label: 'Reception services', items: ['luggage_storage'] },
  { id: 'entertainment_family', label: 'Entertainment and family services', items: ['board_games_puzzles','kids_media','playground'] },
  { id: 'misc', label: 'Miscellaneous', items: ['non_smoking_throughout','non_smoking','family_rooms'] },
  { id: 'safety_security', label: 'Safety & security', items: ['carbon_monoxide_detector','security'] },
  { id: 'languages', label: 'Languages spoken', items: ['english'] },
  // Popular extras
  { id: 'wellness', label: 'Wellness', items: ['swimming_pool','spa','gym'] },
  { id: 'business', label: 'Business', items: ['conference_room'] },
  { id: 'services', label: 'Services', items: ['room_service','airport_shuttle'] }
]

export const POPULAR_KEYS: FacilityKey[] = ['swimming_pool','gym','wifi','car_park','bar','restaurant']

// Default minimal baseline used ONLY when a hotel has no declared facilities yet.
// This list comes from the product requirements: swimming pool, playground, gym, bar, car park.
export const DEFAULT_FACILITIES: FacilityKey[] = [
  'swimming_pool',
  'playground',
  'gym',
  'bar',
  'car_park'
]

// Optional per‑hotel overrides mapping by hotel id (slug). Maintained in a JSON file for easy updates.
import overridesJson from './facilities-overrides.json'
const FACILITY_OVERRIDES = overridesJson as Record<string, FacilityKey[]>

// Map new hotel facilities structure to existing FacilityKey system
function mapHotelFacilitiesToKeys(hotelFacilities: any): FacilityKey[] {
  if (!hotelFacilities || typeof hotelFacilities !== 'object') return DEFAULT_FACILITIES
  
  const keys: FacilityKey[] = []
  
  // Check parking facilities
  if (hotelFacilities.parking) {
    if (hotelFacilities.parking['Free parking'] || hotelFacilities.parking['Parking garage']) {
      keys.push('car_park')
    }
  }
  
  // Check room facilities  
  if (hotelFacilities.rooms) {
    if (hotelFacilities.rooms['Free WiFi']) keys.push('wifi')
    if (hotelFacilities.rooms['Family rooms']) keys.push('family_rooms')
    if (hotelFacilities.rooms['Flat-screen TV']) keys.push('flat_screen_tv')
    if (hotelFacilities.rooms['Private bathroom']) keys.push('bath_or_shower')
    if (hotelFacilities.rooms['Hairdryer']) keys.push('hairdryer')
    if (hotelFacilities.rooms['Towels']) keys.push('towels')
    if (hotelFacilities.rooms['Free toiletries']) keys.push('free_toiletries')
    if (hotelFacilities.rooms['Toilet paper']) keys.push('toilet_paper')
    if (hotelFacilities.rooms['Room service']) keys.push('room_service')
    if (hotelFacilities.rooms['Non-smoking rooms']) keys.push('non_smoking')
  }
  
  // Check dining facilities
  if (hotelFacilities.dining) {
    if (hotelFacilities.dining['Restaurant']) keys.push('restaurant')
    if (hotelFacilities.dining['Bar']) keys.push('bar')
    if (hotelFacilities.dining['Tea/Coffee maker']) keys.push('tea_coffee_maker')
  }
  
  // Check kitchen facilities
  if (hotelFacilities.kitchen) {
    if (hotelFacilities.kitchen['Electric kettle']) keys.push('electric_kettle')
    if (hotelFacilities.kitchen['Refrigerator']) keys.push('refrigerator')
  }
  
  // Check outdoor facilities
  if (hotelFacilities.outdoors) {
    if (hotelFacilities.outdoors['Outdoor swimming pool']) keys.push('swimming_pool')
    if (hotelFacilities.outdoors['Outdoor furniture']) keys.push('outdoor_furniture')
  }
  
  // Check reception services
  if (hotelFacilities.reception) {
    if (hotelFacilities.reception['24-hour front desk']) keys.push('security')
  }
  
  // Check general facilities
  if (hotelFacilities.general) {
    if (hotelFacilities.general['Airport shuttle']) keys.push('airport_shuttle')
    if (hotelFacilities.general['Non-smoking throughout']) keys.push('non_smoking_throughout')
  }
  
  // Check business facilities
  if (hotelFacilities.business) {
    if (hotelFacilities.business['Meeting/banquet facilities']) keys.push('conference_room')
  }
  
  // Always include some default facilities if none were mapped
  if (keys.length === 0) {
    keys.push('wifi', 'restaurant', 'car_park')
  }
  
  return keys
}

export function getFacilitiesFor(hotelId: string | undefined | null): FacilityKey[] {
  if (!hotelId) return DEFAULT_FACILITIES
  
  const k = String(hotelId)
  
  // First try override system for backward compatibility
  const overrideList = FACILITY_OVERRIDES[k]
  if (Array.isArray(overrideList) && overrideList.length > 0) return overrideList
  
  // Try to get facilities from hotel data structure
  try {
    const { HOTELS } = require('./data')
    const hotel = HOTELS.find((h: any) => h.id === k)
    if (hotel && hotel.facilities) {
      return mapHotelFacilitiesToKeys(hotel.facilities)
    }
  } catch (error) {
    console.warn('Could not load hotel facilities data:', error)
  }
  
  return DEFAULT_FACILITIES
}

export function facilityLabel(k: FacilityKey): string {
  return FACILITY_CATALOG[k]?.label || k
}

export function facilityIcon(k: FacilityKey): string | undefined {
  return FACILITY_CATALOG[k]?.icon
}
