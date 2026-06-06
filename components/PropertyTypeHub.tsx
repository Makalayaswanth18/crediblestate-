import Link from 'next/link'
import { supabase, type Property } from '@/lib/supabase'
import { POPULAR_LOCALITIES } from '@/lib/localities'
import { formatPrice } from '@/lib/format'

/**
 * Property-type hub page (e.g., /pg, /flats, /villas).
 * Same shape, different config — keeps SEO copy + counts unique per type.
 */
export type HubConfig = {
  /** DB enum value: 'flat' | 'villa' | 'pg' | 'plot' | 'commercial' */
  type: Property['property_type']
  /** "PGs & Hostels" — used in the hero badge */
  badgeLabel: string
  badgeEmoji: string
  /** Big H1: "PGs in every Hyderabad area" */
  heroHeading: { lead: string; em: string }
  heroSubtitle: React.ReactNode
  /** "PG" / "Flat" / "Villa" / "Commercial space" / "Plot" — singular noun */
  itemSingular: string
  itemPlural: string
  /** Price suffix: "/mo" for rentals, "" for plots (sale only) */
  priceSuffix: string
  emptyHeading: string
  emptyDesc: string
  ctaTitle: string
  ctaDesc: string
  ctaButton: string
  /** Used in the FAQ section heading */
  faqHeading: string
  faq: [string, string][]
}

type AreaStats = {
  slug: string
  name: string
  blurb: string
  count: number
  minPrice: number | null
  maxPrice: number | null
}

export default async function PropertyTypeHub({ config }: { config: HubConfig }) {
  // One query — all verified properties of this type
  const { data: rows } = await supabase
    .from('properties')
    .select('locality, price')
    .eq('status', 'verified')
    .eq('property_type', config.type)

  const items = (rows as Pick<Property, 'locality' | 'price'>[]) ?? []

  const stats: AreaStats[] = POPULAR_LOCALITIES.map((loc) => {
    const matches = items.filter((p) =>
      p.locality.toLowerCase().includes(loc.name.toLowerCase()),
    )
    const prices = matches.map((p) => Number(p.price)).filter((n) => n > 0)
    return {
      slug: loc.slug,
      name: loc.name,
      blurb: loc.blurb,
      count: matches.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    }
  })

  // Areas with inventory first, then empty ones alphabetically
  stats.sort((a, b) => {
    if (a.count > 0 && b.count === 0) return -1
    if (a.count === 0 && b.count > 0) return 1
    if (a.count !== b.count) return b.count - a.count
    return a.name.localeCompare(b.name)
  })

  const total = items.length
  const areasWithItems = stats.filter((s) => s.count > 0).length

  // JSON-LD ItemList structured data — tells Google this is a navigable hub
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${config.itemPlural} in Hyderabad by locality`,
    numberOfItems: areasWithItems,
    itemListElement: stats
      .filter((s) => s.count > 0)
      .map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${config.itemPlural} in ${s.name}`,
        url: `https://www.crediblestate.com/rent/${s.slug}?property_type=${config.type}`,
      })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '80px 5vw 64px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(184,74,30,0.2),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            {config.badgeEmoji} {config.badgeLabel}
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(34px,6vw,56px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '720px' }}>
            {config.heroHeading.lead} <em style={{ color: '#E8732F', fontStyle: 'italic' }}>{config.heroHeading.em}</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: '560px' }}>
            {config.heroSubtitle}
          </p>

          {/* live stats */}
          <div style={{ display: 'flex', gap: '40px', marginTop: '36px', flexWrap: 'wrap' }}>
            {[
              [String(total), `Verified ${config.itemPlural}`],
              [String(areasWithItems), 'Areas covered'],
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
                Browse {config.itemPlural} by area
              </h2>
              <p style={{ fontSize: '14px', color: '#9C9488' }}>
                Click any area to see live {config.itemSingular.toLowerCase()} listings. Counts update in real time.
              </p>
            </div>
            <Link href={`/rent?property_type=${config.type}`} style={{ background: '#100E0B', color: '#fff', padding: '12px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              View all {config.itemPlural} →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {stats.map((area) => (
              <AreaCard key={area.slug} area={area} config={config} />
            ))}
          </div>

          {total === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 30px', background: '#fff', borderRadius: '16px', border: '2px dashed #DDD7CF', marginTop: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>{config.badgeEmoji}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, marginBottom: '8px' }}>{config.emptyHeading}</h3>
              <p style={{ fontSize: '13px', color: '#9C9488', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                {config.emptyDesc}
              </p>
              <Link href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '10px 20px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                List your {config.itemSingular.toLowerCase()} free
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ — SEO-rich, type-specific */}
      <section style={{ background: '#fff', padding: '64px 5vw', borderTop: '0.5px solid #EEEAE3' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 400, color: '#100E0B', marginBottom: '28px', textAlign: 'center' }}>
            {config.faqHeading}
          </h2>
          <div style={{ display: 'grid', gap: '18px' }}>
            {config.faq.map(([q, a]) => (
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
            {config.ctaTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.65 }}>
            {config.ctaDesc}
          </p>
          <Link href="/list" style={{ background: '#fff', color: '#B84A1E', padding: '13px 28px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
            {config.ctaButton} →
          </Link>
        </div>
      </section>
    </>
  )
}

function AreaCard({ area, config }: { area: AreaStats; config: HubConfig }) {
  const has = area.count > 0
  const href = `/rent/${area.slug}?property_type=${config.type}`

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
        opacity: has ? 1 : 0.65,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', letterSpacing: '-0.01em' }}>
          {area.name}
        </h3>
        <span style={{
          background: has ? '#FBF0EB' : '#F0EBE3',
          color: has ? '#B84A1E' : '#9C9488',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700,
        }}>
          {area.count} {area.count === 1 ? config.itemSingular : config.itemPlural}
        </span>
      </div>

      {has && area.minPrice != null && area.maxPrice != null ? (
        <p style={{ fontSize: '13px', color: '#4A4238', marginBottom: '10px' }}>
          {area.minPrice === area.maxPrice
            ? <>From <strong>{formatPrice(area.minPrice)}{config.priceSuffix}</strong></>
            : <>{formatPrice(area.minPrice)} – {formatPrice(area.maxPrice)}<span style={{ color: '#9C9488' }}>{config.priceSuffix}</span></>}
        </p>
      ) : (
        <p style={{ fontSize: '13px', color: '#9C9488', marginBottom: '10px', fontStyle: 'italic' }}>
          No {config.itemPlural.toLowerCase()} listed yet
        </p>
      )}

      <p style={{ fontSize: '12px', color: '#9C9488', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {area.blurb}
      </p>

      <div style={{ marginTop: '12px', fontSize: '12px', color: has ? '#B84A1E' : '#9C9488', fontWeight: 600 }}>
        {has ? `View ${config.itemPlural} →` : `List the first ${config.itemSingular.toLowerCase()} here →`}
      </div>
    </Link>
  )
}
