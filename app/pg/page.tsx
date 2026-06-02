import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase, type Property } from '@/lib/supabase'
import { POPULAR_LOCALITIES } from '@/lib/localities'
import { formatPrice } from '@/lib/format'

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

type AreaStats = {
  slug: string
  name: string
  blurb: string
  pgCount: number
  minPrice: number | null
  maxPrice: number | null
}

export default async function PgHubPage() {
  // Single query: pull all verified PGs with their locality + price
  // (much cheaper than 12 separate counts per locality)
  const { data: pgsRaw } = await supabase
    .from('properties')
    .select('locality, price')
    .eq('status', 'verified')
    .eq('property_type', 'pg')

  const pgs = (pgsRaw as Pick<Property, 'locality' | 'price'>[]) ?? []

  // Aggregate per locality (case-insensitive match on locality name)
  const stats: AreaStats[] = POPULAR_LOCALITIES.map((loc) => {
    const matches = pgs.filter(
      (p) => p.locality.toLowerCase().includes(loc.name.toLowerCase()),
    )
    const prices = matches.map((p) => Number(p.price)).filter((n) => n > 0)
    return {
      slug: loc.slug,
      name: loc.name,
      blurb: loc.blurb,
      pgCount: matches.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    }
  })

  // Sort: areas with PGs first (most first), then empty areas alphabetically
  stats.sort((a, b) => {
    if (a.pgCount > 0 && b.pgCount === 0) return -1
    if (a.pgCount === 0 && b.pgCount > 0) return 1
    if (a.pgCount !== b.pgCount) return b.pgCount - a.pgCount
    return a.name.localeCompare(b.name)
  })

  const totalPgs = pgs.length
  const areasWithPgs = stats.filter((s) => s.pgCount > 0).length

  return (
    <>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '80px 5vw 64px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(184,74,30,0.2),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            🛏️ PGs & Hostels
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(34px,6vw,56px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '720px' }}>
            PGs in <em style={{ color: '#E8732F', fontStyle: 'italic' }}>every Hyderabad area</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: '560px' }}>
            Verified PGs near every IT corridor, college, and metro station in Hyderabad.
            <strong style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}> Zero brokerage. Direct owner contact.</strong>
          </p>

          {/* live stats */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '36px', flexWrap: 'wrap' }}>
            {[
              [String(totalPgs), 'Verified PGs'],
              [String(areasWithPgs), 'Areas covered'],
              ['₹0', 'Brokerage'],
            ].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '34px', color: '#fff', fontWeight: 400, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AREA GRID */}
      <section style={{ padding: '64px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, color: '#100E0B', marginBottom: '6px' }}>
                Browse PGs by area
              </h2>
              <p style={{ fontSize: '14px', color: '#9C9488' }}>
                Click any area to see live PG listings. Counts update in real time.
              </p>
            </div>
            <Link href="/rent?property_type=pg" style={{ background: '#100E0B', color: '#fff', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              View all PGs →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {stats.map((area) => (
              <AreaCard key={area.slug} area={area} />
            ))}
          </div>

          {totalPgs === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 30px', background: '#fff', borderRadius: '16px', border: '2px dashed #DDD7CF', marginTop: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>🛏️</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, marginBottom: '8px' }}>No PG listings yet</h3>
              <p style={{ fontSize: '13px', color: '#9C9488', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                We&apos;re onboarding PG owners across Hyderabad. Check back soon, or list yours below.
              </p>
              <Link href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '10px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                List your PG free
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* PG-specific FAQ for SEO */}
      <section style={{ background: '#fff', padding: '64px 5vw', borderTop: '0.5px solid #EEEAE3' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 400, color: '#100E0B', marginBottom: '28px', textAlign: 'center' }}>
            Common questions about PGs in Hyderabad
          </h2>
          <div style={{ display: 'grid', gap: '18px' }}>
            {FAQ.map(([q, a]) => (
              <div key={q} style={{ background: '#FAF7F2', padding: '18px 22px', borderRadius: '12px', border: '0.5px solid #EEEAE3' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', marginBottom: '6px' }}>{q}</h3>
                <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#B84A1E', padding: '64px 5vw', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(26px,4vw,38px)', color: '#fff', fontWeight: 400, marginBottom: '14px', lineHeight: 1.15 }}>
            Own a PG? List it free.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.65 }}>
            We physically verify your PG within 48 hours and start sending you real tenant inquiries. Zero brokerage charged from tenants — ever.
          </p>
          <Link href="/list" style={{ background: '#fff', color: '#B84A1E', padding: '13px 28px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            List your PG free →
          </Link>
        </div>
      </section>
    </>
  )
}

function AreaCard({ area }: { area: AreaStats }) {
  const hasListings = area.pgCount > 0
  const href = `/rent/${area.slug}?property_type=pg`

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: '#fff',
        border: '0.5px solid #DDD7CF',
        borderRadius: '14px',
        padding: '20px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.15s, box-shadow 0.15s',
        opacity: hasListings ? 1 : 0.65,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', letterSpacing: '-0.01em' }}>
          {area.name}
        </h3>
        <span style={{
          background: hasListings ? '#FBF0EB' : '#F0EBE3',
          color: hasListings ? '#B84A1E' : '#9C9488',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
        }}>
          {area.pgCount} {area.pgCount === 1 ? 'PG' : 'PGs'}
        </span>
      </div>

      {hasListings && area.minPrice != null && area.maxPrice != null ? (
        <p style={{ fontSize: '13px', color: '#4A4238', marginBottom: '10px' }}>
          {area.minPrice === area.maxPrice
            ? <>From <strong>{formatPrice(area.minPrice)}/mo</strong></>
            : <>{formatPrice(area.minPrice)} – {formatPrice(area.maxPrice)}<span style={{ color: '#9C9488' }}>/mo</span></>}
        </p>
      ) : (
        <p style={{ fontSize: '13px', color: '#9C9488', marginBottom: '10px', fontStyle: 'italic' }}>
          No PGs listed yet
        </p>
      )}

      <p style={{ fontSize: '12px', color: '#9C9488', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {area.blurb}
      </p>

      <div style={{ marginTop: '12px', fontSize: '12px', color: hasListings ? '#B84A1E' : '#9C9488', fontWeight: 600 }}>
        {hasListings ? 'View PGs →' : 'List the first PG here →'}
      </div>
    </Link>
  )
}

const FAQ: [string, string][] = [
  [
    'Is the brokerage really zero for PG tenants?',
    'Yes. CredibleState never charges a single rupee from PG tenants. The owner pays nothing too — we make the platform free for everyone. If any owner asks for brokerage, report them to us at hello@crediblestate.com and we ban them permanently.',
  ],
  [
    'Are these PGs physically verified?',
    'Every PG you see has been physically visited by our team within 48 hours of listing. We photograph the actual rooms (not stock photos), verify the owner&apos;s identity, and check that the facilities match what was claimed. Listings that fail are removed instantly.',
  ],
  [
    'Which area is best for students?',
    'Ameerpet is the classic student / coaching-hub area with the cheapest PGs. For engineering students, Madhapur and Kondapur are popular due to proximity to IT companies. JNTU students prefer Kukatpur. Banjara Hills and Jubilee Hills are for premium budgets.',
  ],
  [
    'Can I visit the PG before booking?',
    'Absolutely. Use the &ldquo;Suggest a visit&rdquo; button inside the conversation with the owner to pick a date and time. The owner confirms or counter-proposes — everything tracked in the chat thread.',
  ],
  [
    'How quickly do owners respond?',
    'Most verified owners respond within 4 hours during the day. You also get a WhatsApp button on every listing for instant contact.',
  ],
]
