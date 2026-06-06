import type { Metadata } from 'next'
import PropertyTypeHub, { type HubConfig } from '@/components/PropertyTypeHub'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Commercial Property in Hyderabad — Verified Office, Shop & Showroom Listings | CredibleState',
  description:
    'Verified commercial properties across Hyderabad — office spaces, retail shops, showrooms, coworking. Real photos, zero brokerage, direct from owners. Live counts by locality.',
  keywords: [
    'commercial property Hyderabad',
    'office space for rent Hyderabad',
    'shop for rent Hyderabad',
    'showroom Hyderabad',
    'commercial space Banjara Hills',
    'office space Gachibowli',
    'shop Madhapur',
    'commercial Kondapur',
    'retail space Hyderabad',
  ],
  alternates: { canonical: 'https://www.crediblestate.com/commercial' },
  openGraph: {
    title: 'Commercial Property in Hyderabad — Verified Listings',
    description: 'Office spaces, shops, and showrooms across every Hyderabad area.',
    url: 'https://www.crediblestate.com/commercial',
    type: 'website',
  },
}

const COMMERCIAL_CONFIG: HubConfig = {
  type: 'commercial',
  badgeLabel: 'Commercial & Retail',
  badgeEmoji: '🏬',
  heroHeading: { lead: 'Commercial spaces in', em: 'every Hyderabad area' },
  heroSubtitle: (
    <>
      Verified offices, retail shops, showrooms, and coworking spaces across Hyderabad.
      <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
        {' '}Real photos. Zero brokerage. Direct owner contact.
      </strong>
    </>
  ),
  itemSingular: 'space',
  itemPlural: 'spaces',
  priceSuffix: '',
  emptyHeading: 'No commercial listings yet',
  emptyDesc: "We're onboarding commercial owners across Hyderabad. Check back soon, or list your space below.",
  ctaTitle: 'Own commercial space? List it free.',
  ctaDesc: 'We physically verify your space within 48 hours and start sending you qualified business inquiries. Zero brokerage charged from the tenant — ever.',
  ctaButton: 'List your space free',
  faqHeading: 'Common questions about commercial property in Hyderabad',
  faq: [
    [
      'What kinds of commercial spaces are listed?',
      'Office spaces (small cabins to full floors), retail shops, showrooms, restaurant/cafe spaces, coworking desks, and standalone commercial buildings. Filter by area to find what matches your business need.',
    ],
    [
      'Which area is best for an office in Hyderabad?',
      'For IT and tech offices: HITEC City, Gachibowli, and Financial District (closest to talent + biggest companies). For client-facing offices: Banjara Hills and Jubilee Hills (premium address, parking). For lower-cost startups: Madhapur, Kondapur, and Begumpet are good value.',
    ],
    [
      'How is rent typically structured for commercial space?',
      'Most commercial leases in Hyderabad are 3, 5, or 9 year terms with built-in escalations (typically 5% annually or 15% every 3 years). Deposit is usually 6–12 months. Always negotiate lock-in period, fit-out time, and GST handling directly with the owner — you can chat with them inside CredibleState.',
    ],
    [
      'What documents should I check?',
      'Building approval (HMDA / GHMC), occupancy certificate, fire NOC for the building, and the owner\'s title document. For ground-floor retail, check zoning permits. Always review with a lawyer before signing the lease.',
    ],
    [
      'Why zero brokerage?',
      "CredibleState never charges brokerage from tenants. Owners list free too. If anyone asks for commission, report them at hello@crediblestate.com.",
    ],
  ],
}

export default function CommercialHubPage() {
  return <PropertyTypeHub config={COMMERCIAL_CONFIG} />
}
