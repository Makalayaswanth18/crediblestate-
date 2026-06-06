import type { Metadata } from 'next'
import PropertyTypeHub, { type HubConfig } from '@/components/PropertyTypeHub'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'PG / Hostels in Hyderabad — Verified, Zero Brokerage | CredibleState',
  description:
    'Find verified PGs and hostels across every area in Hyderabad — Ameerpet, Kondapur, Madhapur, Gachibowli and more. Zero brokerage. Direct owner contact. Live counts updated daily.',
  keywords: [
    'PG in Hyderabad',
    'PG near me Hyderabad',
    'PG in Ameerpet',
    'PG in Kondapur',
    'PG in Madhapur',
    'PG in Gachibowli',
    'cheap PG Hyderabad',
    'PG for boys Hyderabad',
    'PG for girls Hyderabad',
  ],
  alternates: { canonical: 'https://www.crediblestate.com/pg' },
  openGraph: {
    title: 'PG / Hostels in Hyderabad — Verified, Zero Brokerage',
    description: 'Browse PGs in every Hyderabad area with live counts and price ranges.',
    url: 'https://www.crediblestate.com/pg',
    type: 'website',
  },
}

const PG_CONFIG: HubConfig = {
  type: 'pg',
  badgeLabel: 'PGs & Hostels',
  badgeEmoji: '🛏️',
  heroHeading: { lead: 'PGs in', em: 'every Hyderabad area' },
  heroSubtitle: (
    <>
      Verified PGs near every IT corridor, college, and metro station in Hyderabad.
      <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
        {' '}Zero brokerage. Direct owner contact.
      </strong>
    </>
  ),
  itemSingular: 'PG',
  itemPlural: 'PGs',
  priceSuffix: '/mo',
  emptyHeading: 'No PG listings yet',
  emptyDesc: "We're onboarding PG owners across Hyderabad. Check back soon, or list yours below.",
  ctaTitle: 'Own a PG? List it free.',
  ctaDesc: 'We physically verify your PG within 48 hours and start sending you real tenant inquiries. Zero brokerage charged from tenants — ever.',
  ctaButton: 'List your PG free',
  faqHeading: 'Common questions about PGs in Hyderabad',
  faq: [
    [
      'Is the brokerage really zero for PG tenants?',
      'Yes. CredibleState never charges a single rupee from PG tenants. The owner pays nothing too — we make the platform free for everyone. If any owner asks for brokerage, report them to us at hello@crediblestate.com and we ban them permanently.',
    ],
    [
      'Are these PGs physically verified?',
      "Every PG you see has been physically visited by our team within 48 hours of listing. We photograph the actual rooms (not stock photos), verify the owner's identity, and check that the facilities match what was claimed. Listings that fail are removed instantly.",
    ],
    [
      'Which area is best for students?',
      'Ameerpet is the classic student / coaching-hub area with the cheapest PGs. For engineering students, Madhapur and Kondapur are popular due to proximity to IT companies. JNTU students prefer Kukatpur. Banjara Hills and Jubilee Hills are for premium budgets.',
    ],
    [
      'Can I visit the PG before booking?',
      'Absolutely. Use the "Suggest a visit" button inside the conversation with the owner to pick a date and time. The owner confirms or counter-proposes — everything tracked in the chat thread.',
    ],
    [
      'How quickly do owners respond?',
      'Most verified owners respond within 4 hours during the day. You also get a WhatsApp button on every listing for instant contact.',
    ],
  ],
}

export default function PgHubPage() {
  return <PropertyTypeHub config={PG_CONFIG} />
}
