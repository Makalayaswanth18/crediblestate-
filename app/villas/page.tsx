import type { Metadata } from 'next'
import PropertyTypeHub, { type HubConfig } from '@/components/PropertyTypeHub'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Villas in Hyderabad — Premium Verified Listings by Area | CredibleState',
  description:
    'Verified independent villas and gated community villas across Hyderabad — Jubilee Hills, Banjara Hills, Tellapur, Financial District. Real photos, zero brokerage, direct owner contact.',
  keywords: [
    'villas in Hyderabad',
    'villa for rent Hyderabad',
    'villa for sale Hyderabad',
    'villa in Jubilee Hills',
    'villa in Banjara Hills',
    'villa in Tellapur',
    'gated community villa Hyderabad',
    'independent villa Hyderabad',
    'luxury villa Hyderabad',
  ],
  alternates: { canonical: 'https://www.crediblestate.com/villas' },
  openGraph: {
    title: 'Villas in Hyderabad — Premium Verified Listings',
    description: 'Browse independent and gated community villas across every Hyderabad area.',
    url: 'https://www.crediblestate.com/villas',
    type: 'website',
  },
}

const VILLAS_CONFIG: HubConfig = {
  type: 'villa',
  badgeLabel: 'Villas & Independent Houses',
  badgeEmoji: '🏡',
  heroHeading: { lead: 'Villas in', em: 'every Hyderabad area' },
  heroSubtitle: (
    <>
      Independent villas, duplex houses, and premium gated community villas across Hyderabad.
      <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
        {' '}Real photos. Zero brokerage. Direct owner contact.
      </strong>
    </>
  ),
  itemSingular: 'villa',
  itemPlural: 'villas',
  priceSuffix: '',
  emptyHeading: 'No villa listings yet',
  emptyDesc: "We're onboarding villa owners across Hyderabad. Check back soon, or list yours below.",
  ctaTitle: 'Own a villa? List it free.',
  ctaDesc: 'We physically verify your villa within 48 hours and start sending you real, qualified buyer and tenant inquiries. Zero brokerage from the demand side — ever.',
  ctaButton: 'List your villa free',
  faqHeading: 'Common questions about villas in Hyderabad',
  faq: [
    [
      'What\'s the difference between an independent villa and a gated community villa?',
      'Independent villas are standalone houses on their own plot — you own the land outright, full privacy, but maintenance, security, and amenities are your responsibility. Gated community villas (in projects like Tellapur, Financial District, Jubilee Heights) share common amenities — pool, gym, clubhouse, 24/7 security — with shared maintenance fees.',
    ],
    [
      'Which area is best for luxury villas in Hyderabad?',
      'Jubilee Hills and Banjara Hills are the historic premium addresses — independent villas, celebrity neighborhoods, top schools. For modern gated community villas with amenities, Tellapur, Financial District, and Kondapur are top picks. Shamshabad is emerging for investment.',
    ],
    [
      'Can I see the title documents before paying any token?',
      'Yes, absolutely — and you should. On CredibleState you contact the owner directly through the chat, request a copy of the title deed, encumbrance certificate, and approved plans, and review them with a lawyer before any payment. Never pay a token amount without seeing documents.',
    ],
    [
      'How do site visits work for villas?',
      'Use the "Suggest a visit" button inside your conversation with the owner. Pick a date and time — the owner confirms or counter-proposes. For gated villas, the owner arranges your gate pass.',
    ],
    [
      'Why is the brokerage zero?',
      "CredibleState makes money from optional services for owners and agents in the future (we'll always give 30 days' notice before any change). Buyers and renters never pay anything. If any agent or owner demands brokerage from you, report them and we ban them permanently.",
    ],
  ],
}

export default function VillasHubPage() {
  return <PropertyTypeHub config={VILLAS_CONFIG} />
}
