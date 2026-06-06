import type { Metadata } from 'next'
import PropertyTypeHub, { type HubConfig } from '@/components/PropertyTypeHub'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Plots & Land for Sale in Hyderabad — Verified Listings by Area | CredibleState',
  description:
    'Verified plots and residential land across Hyderabad — HMDA / DTCP approved, gated layouts, investment plots. Real photos, zero brokerage, direct from owners.',
  keywords: [
    'plots in Hyderabad',
    'plot for sale Hyderabad',
    'HMDA plots Hyderabad',
    'DTCP plots',
    'plot in Shamshabad',
    'plot in Tellapur',
    'plot in Maheshwaram',
    'investment plot Hyderabad',
    'residential plot Hyderabad',
    'gated layout plot',
  ],
  alternates: { canonical: 'https://www.crediblestate.com/plots' },
  openGraph: {
    title: 'Plots & Land for Sale in Hyderabad — Verified Listings',
    description: 'HMDA / DTCP approved plots and residential land across every Hyderabad area.',
    url: 'https://www.crediblestate.com/plots',
    type: 'website',
  },
}

const PLOTS_CONFIG: HubConfig = {
  type: 'plot',
  badgeLabel: 'Plots & Land',
  badgeEmoji: '🌳',
  heroHeading: { lead: 'Plots in', em: 'every Hyderabad area' },
  heroSubtitle: (
    <>
      HMDA / DTCP approved plots, gated layouts, and residential land across Hyderabad.
      <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
        {' '}Real photos. Zero brokerage. Direct owner contact.
      </strong>
    </>
  ),
  itemSingular: 'plot',
  itemPlural: 'plots',
  priceSuffix: '',
  emptyHeading: 'No plot listings yet',
  emptyDesc: "We're onboarding plot owners across Hyderabad. Check back soon, or list yours below.",
  ctaTitle: 'Own a plot or layout? List it free.',
  ctaDesc: 'We physically verify your plot within 48 hours and confirm document status. Then we send you serious buyer inquiries directly — no broker chain, no commission.',
  ctaButton: 'List your plot free',
  faqHeading: 'Common questions about plots in Hyderabad',
  faq: [
    [
      'What does HMDA / DTCP approved mean?',
      'HMDA (Hyderabad Metropolitan Development Authority) and DTCP (Director of Town and Country Planning) approvals confirm the plot is legally permitted for residential use, has proper road access, drainage, and is not encroached. Always insist on these approvals before buying — listings on CredibleState are marked with their approval status.',
    ],
    [
      'Which areas have the best plot investments right now?',
      'Shamshabad (near airport, future growth), Tellapur (premium gated layouts, IT-corridor adjacent), Maheshwaram (affordable, fast-growing), and Adibatla (e-city corridor, IT companies expanding). Banjara Hills and Jubilee Hills are stable but very high-priced.',
    ],
    [
      'What documents must I verify before buying?',
      'Title deed (mother deed), encumbrance certificate (last 30 years), HMDA / DTCP approval, link documents, latest property tax receipts, NOC from layout developer, and a recent survey sketch. Hire a property lawyer for ₹5,000-15,000 — it\'s the cheapest insurance you\'ll ever buy.',
    ],
    [
      'Can I visit the plot before paying any token?',
      'Yes — and you must. Use the "Suggest a visit" button inside the conversation. The owner confirms a time and meets you on-site. Walk the boundaries, check road access, look at neighboring development. Never pay even a token amount without a physical visit.',
    ],
    [
      'Is brokerage really zero for plot buyers?',
      "Yes, forever. CredibleState never charges buyers any brokerage. If the seller's agent demands commission from you (which is illegal in this context), report them — we ban them permanently.",
    ],
  ],
}

export default function PlotsHubPage() {
  return <PropertyTypeHub config={PLOTS_CONFIG} />
}
