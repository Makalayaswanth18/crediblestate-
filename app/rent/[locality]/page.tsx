import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import { getLocalityBySlug, POPULAR_LOCALITIES } from '@/lib/localities'

export const revalidate = 300 // 5 min

export async function generateStaticParams() {
  return POPULAR_LOCALITIES.map(l => ({ locality: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locality: string }>
}): Promise<Metadata> {
  const { locality } = await params
  const loc = getLocalityBySlug(locality)
  if (!loc) return { title: 'Properties in Hyderabad — CredibleState' }

  return {
    title: `Verified Properties in ${loc.name}, Hyderabad — CredibleState`,
    description: `Find verified flats, PGs, and villas for rent and sale in ${loc.name}, Hyderabad. Zero brokerage. 100% verified listings. ${loc.blurb}`,
    keywords: [
      `${loc.name} rent`,
      `${loc.name} flat`,
      `${loc.name} PG`,
      `${loc.name} apartment`,
      `2BHK ${loc.name}`,
      `3BHK ${loc.name}`,
      `${loc.name} property`,
      'Hyderabad verified rental',
      'zero brokerage Hyderabad',
    ],
    openGraph: {
      title: `Verified Properties in ${loc.name}, Hyderabad`,
      description: `${loc.blurb} Zero brokerage. 100% verified.`,
      url: `https://crediblestate.com/rent/${loc.slug}`,
    },
    alternates: {
      canonical: `https://crediblestate.com/rent/${loc.slug}`,
    },
  }
}

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ locality: string }>
}) {
  const { locality } = await params
  const loc = getLocalityBySlug(locality)
  if (!loc) notFound()

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'verified')
    .ilike('locality', `%${loc.name}%`)
    .order('created_at', { ascending: false })

  const properties = (data as Property[]) || []

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '80px 5vw 60px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(184,74,30,0.18),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <nav style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/rent" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Browse</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#fff' }}>{loc.name}</span>
          </nav>

          <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: '18px' }}>
            Hyderabad Locality
          </span>

          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(34px,6vw,60px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Verified Properties in <em style={{ color: '#E8732F', fontStyle: 'italic' }}>{loc.name}</em>
          </h1>

          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', maxWidth: '720px', lineHeight: 1.65, marginBottom: '28px' }}>
            {loc.blurb}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {loc.highlights.map(h => (
              <span key={h} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>
                {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section style={{ padding: '60px 5vw 80px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 400, color: '#100E0B' }}>
              {properties.length > 0 ? `${properties.length} verified ${properties.length === 1 ? 'property' : 'properties'}` : 'Onboarding listings'} in {loc.name}
            </h2>
            <Link href={`/rent?locality=${encodeURIComponent(loc.name)}`} style={{ fontSize: '13px', color: '#B84A1E', textDecoration: 'none', fontWeight: 600 }}>
              Advanced filters →
            </Link>
          </div>

          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, marginBottom: '10px' }}>Listings in {loc.name} coming soon</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.6, marginBottom: '20px' }}>
                We&apos;re verifying agents in {loc.name} right now. Subscribe to get notified.
              </p>
              <Link href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Own a property in {loc.name}? List free →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {properties.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Other localities */}
      <section style={{ background: '#fff', padding: '64px 5vw', borderTop: '0.5px solid #EEEAE3' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 400, marginBottom: '24px', textAlign: 'center' }}>
            Explore other Hyderabad <em style={{ color: '#E8732F', fontStyle: 'italic' }}>localities</em>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {POPULAR_LOCALITIES.filter(l => l.slug !== loc.slug).map(l => (
              <Link
                key={l.slug}
                href={`/rent/${l.slug}`}
                style={{ background: '#FAF7F2', color: '#100E0B', padding: '9px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '0.5px solid #DDD7CF' }}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
