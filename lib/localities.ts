// Top Hyderabad localities for SEO landing pages
// Each gets a static page at /rent/[slug]
// Add or remove as needed.

export type Locality = {
  slug: string
  name: string
  blurb: string
  highlights: string[]
}

export const POPULAR_LOCALITIES: Locality[] = [
  {
    slug: 'kondapur',
    name: 'Kondapur',
    blurb: 'Just a 5-minute drive from HITEC City, Kondapur is the most popular rental locality for IT professionals. Wide roads, good metro connectivity, and a mix of premium and affordable housing.',
    highlights: ['Walking distance to Hitech City', 'Metro Line', 'IT professional hub', 'Wide rental range'],
  },
  {
    slug: 'gachibowli',
    name: 'Gachibowli',
    blurb: 'Home to Microsoft, Amazon, Google, and ISB. Premium gated communities with world-class amenities. Best for senior IT professionals and families.',
    highlights: ['Big tech offices', 'Premium apartments', 'Top schools nearby', 'Financial District access'],
  },
  {
    slug: 'madhapur',
    name: 'Madhapur',
    blurb: 'Heart of HITEC City. Walking distance to Inorbit Mall, Cyber Towers, and the metro. Perfect for working professionals who want zero commute.',
    highlights: ['HITEC City core', 'Inorbit Mall', 'Walkable to offices', 'Bustling nightlife'],
  },
  {
    slug: 'hitech-city',
    name: 'HITEC City',
    blurb: 'The IT capital of Hyderabad. Microsoft, Wipro, Tech Mahindra, and Accenture campuses surround this zone. Premium rentals and apartments dominate.',
    highlights: ['IT zone', 'Premium rentals', 'Metro connectivity', 'Cafes and coworking'],
  },
  {
    slug: 'banjara-hills',
    name: 'Banjara Hills',
    blurb: 'Upscale and historic Hyderabad. Premium villas, luxury apartments, top hospitals (Apollo, KIMS), and the finest schools. For families and HNIs.',
    highlights: ['Premium luxury', 'Top hospitals', 'Elite schools', 'Historic charm'],
  },
  {
    slug: 'jubilee-hills',
    name: 'Jubilee Hills',
    blurb: 'Hyderabad\'s most prestigious address. Independent villas, celebrity homes, fine dining, and proximity to Film Nagar. The pinnacle of luxury living.',
    highlights: ['Luxury villas', 'Celebrity neighborhood', 'Fine dining', 'Film Nagar nearby'],
  },
  {
    slug: 'miyapur',
    name: 'Miyapur',
    blurb: 'Affordable rentals with excellent metro connectivity. Last stop of the Red Line, but well-connected to everywhere. Best value for money in West Hyderabad.',
    highlights: ['Metro Red Line', 'Affordable rents', 'Family-friendly', 'Growing neighborhood'],
  },
  {
    slug: 'ameerpet',
    name: 'Ameerpet',
    blurb: 'Coaching capital and budget-friendly rentals. Loved by students, freshers, and PG seekers. Central location with great public transport.',
    highlights: ['PG hub', 'Student-friendly', 'Coaching institutes', 'Central location'],
  },
  {
    slug: 'financial-district',
    name: 'Financial District',
    blurb: 'Newest premium IT corridor. Microsoft, Amazon, Salesforce campuses. Brand new high-rise apartments with infinity pools and 5-star amenities.',
    highlights: ['New construction', 'Premium amenities', 'IT corridor', 'Investment grade'],
  },
  {
    slug: 'secunderabad',
    name: 'Secunderabad',
    blurb: 'The twin city of Hyderabad. Mature neighborhoods, established markets, lower rentals than west Hyderabad. Perfect for families seeking community.',
    highlights: ['Mature areas', 'Lower rents', 'Family-friendly', 'Twin city character'],
  },
  {
    slug: 'tellapur',
    name: 'Tellapur',
    blurb: 'Fast-growing suburb on the western edge. Premium gated villa communities, schools, and IT-corridor connectivity via ORR. Future appreciation potential.',
    highlights: ['Villa communities', 'ORR access', 'Investment potential', 'Quiet living'],
  },
  {
    slug: 'shamshabad',
    name: 'Shamshabad',
    blurb: 'Near Hyderabad airport. Mix of farmhouse plots, residential apartments, and emerging gated communities. Great for plot investment and airport-area work.',
    highlights: ['Near airport', 'Plot investments', 'Emerging area', 'NH44 access'],
  },
]

export function getLocalityBySlug(slug: string): Locality | undefined {
  return POPULAR_LOCALITIES.find(l => l.slug === slug.toLowerCase())
}
