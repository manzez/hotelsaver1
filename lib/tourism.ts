export type TourismDestination = {
  slug: string
  name: string
  category: 'Natural Wonders' | 'Cultural & Historical Sites'
  state: string
  address: string
  lat?: number
  lng?: number
  heroImage: string
  gallery?: string[]
  highlights: string[]
  description: string
  significance: string
}

export const TOURISM_DESTINATIONS: TourismDestination[] = [
  {
    slug: 'obudu-mountain-resort',
    name: 'Obudu Mountain Resort',
    category: 'Natural Wonders',
    state: 'Cross River State',
    address: 'Obanliku LGA, Cross River, Nigeria',
    lat: 6.3867,
    lng: 9.3673,
    heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop&auto=format&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&h=800&fit=crop&auto=format&q=80'
    ],
    highlights: [
      'Picturesque plateau over 5,200 ft high',
      'Cable car rides and mountain hiking',
      'Cool climate and panoramic views'
    ],
    description:
      'Obudu Mountain Resort is a scenic highland getaway famed for its rolling green hills, crisp mountain air, and sweeping views. Popular activities include hiking, canopy walks, and relaxing at the hilltop ranch.',
    significance:
      'A flagship eco‑tourism site that showcases Nigeria’s diverse landscapes and supports local communities through sustainable travel.'
  },
  {
    slug: 'yankari-game-reserve',
    name: 'Yankari Game Reserve',
    category: 'Natural Wonders',
    state: 'Bauchi State',
    address: 'Yankari, Bauchi, Nigeria',
    lat: 9.7492,
    lng: 10.5016,
    heroImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1600&h=900&fit=crop&auto=format&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=1200&h=800&fit=crop&auto=format&q=80'
    ],
    highlights: [
      "Nigeria's most popular wildlife park",
      'Elephants, baboons, and antelopes',
      'Wiki Warm Spring (31°C all year)'
    ],
    description:
      'Yankari is a major wildlife sanctuary offering safari drives, rich birdlife, and the crystal‑clear Wiki Warm Spring for a refreshing dip after a day of exploration.',
    significance:
      'A cornerstone for wildlife conservation and nature education in West Africa.'
  },
  {
    slug: 'idanre-hill',
    name: 'Idanre Hill',
    category: 'Natural Wonders',
    state: 'Ondo State',
    address: 'Idanre, Ondo, Nigeria',
    lat: 7.0911,
    lng: 5.1100,
    heroImage: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'Historic hilltop settlement at 3,000 ft',
      'Ancient palace, shrines, and inscriptions',
      'Epic stairways and viewpoints'
    ],
    description:
      'Idanre Hill blends dramatic geology with Yoruba heritage. Visitors climb stone stairways through lush vegetation to discover relics of an old hilltop community.',
    significance:
      'A cultural landscape that preserves spiritual traditions and early settlement history.'
  },
  {
    slug: 'zuma-rock',
    name: 'Zuma Rock',
    category: 'Natural Wonders',
    state: 'Niger State',
    address: 'Madalla, Niger State (near Abuja), Nigeria',
    lat: 9.1204,
    lng: 7.2200,
    heroImage: 'https://images.unsplash.com/photo-1501785888050-3aa8e0f2d7c2?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      '725‑meter monolith with “human face” contours',
      'Icon featured on the 100 Naira note',
      'Sunset photography hotspot'
    ],
    description:
      'Standing guard at the gateway to Abuja, Zuma Rock is a colossal granite inselberg revered in local folklore and a striking landmark for travelers.',
    significance:
      'A national icon that symbolizes strength and heritage in Nigeria.'
  },
  {
    slug: 'gurara-waterfalls',
    name: 'Gurara Waterfalls',
    category: 'Natural Wonders',
    state: 'Niger State',
    address: 'Gurara, Niger State, Nigeria',
    lat: 9.2646,
    lng: 7.1570,
    heroImage: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      '200m‑wide cascade',
      'Gentle pools in dry season',
      'Thunderous flows in rainy months'
    ],
    description:
      'Gurara offers seasonal drama—from tranquil, picnic‑friendly pools to roaring curtains of water—making it a favorite for day trips from Abuja.',
    significance:
      'An accessible nature escape that boosts eco‑tourism in North‑Central Nigeria.'
  },
  {
    slug: 'osun-osogbo-sacred-grove',
    name: 'Osun‑Osogbo Sacred Grove',
    category: 'Cultural & Historical Sites',
    state: 'Osun State',
    address: 'Osogbo, Osun, Nigeria',
    lat: 7.7714,
    lng: 4.5560,
    heroImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'UNESCO World Heritage sacred forest',
      'Shrines and monumental sculptures',
      'Annual Osun‑Osogbo festival'
    ],
    description:
      'A living sacred forest on the banks of the Osun River, celebrated for its art, spirituality, and community rituals.',
    significance:
      'A global heritage site protecting Yoruba spirituality, art, and identity.'
  },
  {
    slug: 'olumo-rock',
    name: 'Olumo Rock',
    category: 'Cultural & Historical Sites',
    state: 'Ogun State',
    address: 'Ikija, Abeokuta, Ogun, Nigeria',
    lat: 7.1608,
    lng: 3.3480,
    heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'Ancient granite outcrop & fortress',
      'Panoramic city views',
      'Rock‑hewn pathways and folklore'
    ],
    description:
      'Olumo Rock sheltered the Egba people in the 19th century and remains a cultural beacon with sweeping vistas over Abeokuta.',
    significance:
      'A symbol of resilience and a key stop on the Southwest heritage trail.'
  },
  {
    slug: 'ancient-city-of-kano',
    name: 'Ancient City of Kano',
    category: 'Cultural & Historical Sites',
    state: 'Kano State',
    address: 'Kano, Nigeria',
    lat: 12.0000,
    lng: 8.5167,
    heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'Ancient city walls and gates',
      'Great Mosque and Emir’s Palace',
      'Vibrant craft and dyeing traditions'
    ],
    description:
      'Among West Africa’s oldest urban centers, Kano thrived on trans‑Saharan trade and craftsmanship, leaving a rich architectural legacy.',
    significance:
      'A testament to centuries of commerce, scholarship, and urban life in the Sahel.'
  },
  {
    slug: 'badagry-heritage-museum',
    name: 'Badagry Heritage Museum',
    category: 'Cultural & Historical Sites',
    state: 'Lagos State',
    address: 'Badagry, Lagos, Nigeria',
    lat: 6.4150,
    lng: 2.8813,
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'Slave trade route history',
      'Museums and memorial sites',
      'Coastal town atmosphere'
    ],
    description:
      'Badagry preserves poignant stories from the trans‑Atlantic slave era through museums, relics, and guided education programs.',
    significance:
      'Essential for remembrance, dialogue, and human rights education.'
  },
  {
    slug: 'ogbunike-caves',
    name: 'Ogbunike Caves',
    category: 'Natural Wonders',
    state: 'Anambra State',
    address: 'Ogbunike, Anambra, Nigeria',
    lat: 6.1613,
    lng: 6.8993,
    heroImage: 'https://images.unsplash.com/photo-1574263867128-6b50b6ac1f4c?w=1600&h=900&fit=crop&auto=format&q=80',
    highlights: [
      'Network of caves and tunnels',
      'Lush forest setting',
      'Cultural rites and nature walks'
    ],
    description:
      'A labyrinth of caves carved by nature, offering cool chambers, streams, and sacred narratives tied to the local community.',
    significance:
      'Blends geology with living traditions—an immersive eco‑spiritual site.'
  }
]

export function getTourismBySlug(slug: string) {
  return TOURISM_DESTINATIONS.find(d => d.slug === slug)
}

export function heroPicks(): TourismDestination[] {
  // Top 5 visually stunning natural spots for the homepage strip
  const picks = ['obudu-mountain-resort','yankari-game-reserve','idanre-hill','zuma-rock','gurara-waterfalls']
  return TOURISM_DESTINATIONS.filter(d => picks.includes(d.slug))
}
