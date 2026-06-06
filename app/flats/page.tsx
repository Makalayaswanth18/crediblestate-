import type { Metadata } from 'next'
import PropertyTypeHub, { type HubConfig } from '@/components/PropertyTypeHub'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Flats in Hyderabad — Verified 1/2/3 BHK by Area | CredibleState',
  description:
    'Verified flats and apartments across every Hyderabad area — 1BHK, 2BHK, 3BHK for rent and sale. Real photos, zero brokerage, direct owner contact. Live counts by locality.',
  keywords: [
    'flats in Hyderabad',
    'flat for rent Hyderabad',
    '2BHK in Kondapur',
    '3BHK in Gachibowli',
    'flat in Madhapur',
    'apartment Hyderabad',
    'verified flats Hyderabad',
    'zero brokerage flat',
    'flats for sale Hyderabad',
  ],
  alternates: { canonical: 'https://www.crediblestate.com/flats' },
  openGraph: {
    title: 'Flats in Hyderabad — Verified, Zero Brokerage',
    description: 'Browse 1/2/3 BHK flats in every Hyderabad area. Real photos, direct from owners.',
    url: 'https://www.crediblestate.com/flats',
    type: 'website',
  },
}

const FLATS_CONFIG: HubConfig = {
  type: 'flat',
  badgeLabel: 'Flats & Apartments',
  badgeEmoji: '🏢',
  heroHeading: { lead: 'Flats in', em: 'every Hyderabad area' },
  heroSubtitle: (
    <>
      Verified 1BHK, 2BHK, and 3BHK flats across every Hyderabad locality.
      <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
        {' '}Real photos. Zero brokerage. Direct owner contact.
      </strong>
    </>
  ),
  itemSingular: 'flat',
  itemPlural: 'flats',
  priceSuffix: '/mo',
  emptyHeading: 'No flat listings yet',
  emptyDesc: "We're onboarding flat owners across Hyderabad. Check back soon, or list yours below.",
  ctaTitle: 'Own a flat? List it free.',
  ctaDesc: "We physically verify your flat within 48 hours and start sending you real buyer and tenant inquiries. Zero brokerage charged from the demand side — ever.",
  ctaButton: 'List your flat free',
  faqHeading: 'Common questions about flats in Hyderabad',
  faq: [
    [
      'How does CredibleState verify flats?',
      'A member of our team physically visits every flat within 48 hours of submission. We photograph the actual rooms (not stock photos), verify the owner\'s identity and ownership documents, and confirm that amenities match the listing. Anything that fails is removed instantly.',
    ],
    [
      'Which area is best for IT professionals?',
      'Kondapur and Madhapur are the closest to HITEC City and offer the widest range of 1-3BHK options. Gachibowli is preferred for senior professionals (premium gated communities, top schools). Financial District is newest with the best amenities. Miyapur offers the best value-for-money on the Metro Red Line.',
    ],
    [
      'Are deposits negotiable?',
      'Standard Hyderabad practice is 10x monthly rent as deposit (sometimes 6x or 8x). On CredibleState you talk to the owner directly inside the platform — there\'s no broker forcing fixed terms, so deposits, lock-in periods, and rent revision are all negotiable.',
    ],
    [
      'Can I see the actual flat before paying anything?',
      'Yes — always. Use the "Suggest a visit" button inside the chat thread to pick a date and time. The owner confirms or counter-proposes. Never pay any deposit before you\'ve physically seen the flat.',
    ],
    [
      'Is the brokerage really zero?',
      'Yes, for renters and buyers, forever. CredibleState never charges a single rupee from the demand side. Owners and agents also list free right now. If anyone — owner, agent, or platform — asks you for brokerage, report it to hello@crediblestate.com immediately.',
    ],
  ],
}

export default function FlatsHubPage() {
  return <PropertyTypeHub config={FLATS_CONFIG} />
}
