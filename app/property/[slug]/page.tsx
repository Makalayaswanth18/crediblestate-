import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import InquiryForm from '@/components/InquiryForm'
import PropertyMap from '@/components/PropertyMap'
import { formatPrice, buildWaLink } from '@/lib/format'

export const revalidate = 300 // 5 min

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from('properties')
    .select('title, description, locality, city, price, listing_type, bedrooms, area_sqft, images, property_type')
    .eq('slug', slug)
    .eq('status', 'verified')
    .single()

  if (!data) return { title: 'Property — CredibleState' }

  const p = data as Property
  const priceStr =
    p.price >= 10_000_000 ? `₹${(p.price / 10_000_000).toFixed(1)} Cr` :
    p.price >= 100_000   ? `₹${(p.price / 100_000).toFixed(1)} L` :
    `₹${p.price.toLocaleString('en-IN')}`
  const suffix = p.listing_type === 'rent' ? '/mo' : ''

  const title = `${p.title} — ${priceStr}${suffix} · ${p.locality}, ${p.city}`
  const desc = p.description?.slice(0, 155) ||
    `Verified ${p.bedrooms ? `${p.bedrooms} BHK ` : ''}${p.property_type} for ${p.listing_type} in ${p.locality}, ${p.city}. ${priceStr}${suffix}. Zero brokerage on CredibleState.`

  return {
    title,
    description: desc,
    keywords: [
      `${p.locality} ${p.bedrooms ? `${p.bedrooms} BHK` : p.property_type}`,
      `${p.locality} ${p.listing_type}`,
      `${p.locality} ${p.property_type}`,
      `${p.bedrooms ? `${p.bedrooms} BHK` : ''} ${p.city}`.trim(),
      `verified property ${p.city}`,
      'zero brokerage Hyderabad',
    ],
    openGraph: {
      title,
      description: desc,
      url: `https://crediblestate.com/property/${slug}`,
      type: 'article',
      images: p.images && p.images.length > 0 ? [{ url: p.images[0], width: 1200, height: 630 }] : [],
    },
    alternates: { canonical: `https://crediblestate.com/property/${slug}` },
  }
}

export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'verified')
    .single()

  if (!property) notFound()

  const p = property as Property

  // Agent profile + rating (verified badge, public profile link, star avg)
  const [{ data: agentProfile }, { data: ratingSummary }, { data: similarRaw }] = await Promise.all([
    p.agent_id
      ? supabase.from('profiles').select('id, full_name, is_verified_agent').eq('id', p.agent_id).maybeSingle()
      : Promise.resolve({ data: null }),
    p.agent_id
      ? supabase.from('agent_rating_summary').select('*').eq('agent_id', p.agent_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('properties')
      .select('*')
      .eq('status', 'verified')
      .eq('listing_type', p.listing_type)
      .neq('id', p.id)
      .limit(3),
  ])

  const agent = agentProfile as { id: string; full_name: string | null; is_verified_agent: boolean } | null
  const rating = ratingSummary as { rating_avg: number | null; review_count: number } | null
  const similar = (similarRaw as Property[]) || []
  const heroImg = p.images && p.images.length > 0 ? p.images[0] : null
  const galleryImgs = p.images && p.images.length > 1 ? p.images.slice(1, 5) : []

  // JSON-LD structured data for rich Google results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': p.listing_type === 'rent' ? 'RealEstateListing' : 'Product',
    name: p.title,
    description: p.description || `${p.bedrooms ? `${p.bedrooms} BHK ` : ''}${p.property_type} for ${p.listing_type} in ${p.locality}, ${p.city}`,
    url: `https://crediblestate.com/property/${p.slug}`,
    image: p.images && p.images.length > 0 ? p.images : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.locality,
      addressRegion: 'Telangana',
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: p.bedrooms ?? undefined,
    floorSize: p.area_sqft ? { '@type': 'QuantitativeValue', value: p.area_sqft, unitCode: 'FTK' } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <section
        style={{
          background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)',
          padding: '40px 5vw 0',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <nav style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/rent" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Browse</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#fff' }}>{p.title}</span>
          </nav>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(30,77,53,0.92)', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>✓ VERIFIED</span>
            <span style={{ background: p.listing_type === 'rent' ? 'rgba(184,74,30,0.92)' : 'rgba(30,77,53,0.92)', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
              FOR {p.listing_type.toUpperCase()}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(24px,5vw,42px)', fontWeight: 400, lineHeight: 1.15, marginBottom: '12px', letterSpacing: '-0.01em' }}>
            {p.title}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            📍 {p.address || `${p.locality}, ${p.city}`}
          </p>

          {/* Image gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: galleryImgs.length > 0 ? '2fr 1fr' : '1fr', gap: '8px', marginBottom: '-60px' }}>
            <div style={{ aspectRatio: '16/10', borderRadius: '20px', background: 'linear-gradient(135deg,#2C1A0E,#1A120A)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImg} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '120px', opacity: 0.3 }}>
                  {p.property_type === 'villa' ? '🏡' : p.property_type === 'pg' ? '🛏️' : p.property_type === 'plot' ? '🌳' : p.property_type === 'commercial' ? '🏬' : '🏢'}
                </span>
              )}
            </div>
            {galleryImgs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', gap: '8px' }}>
                {galleryImgs.slice(0, 2).map((img, i) => (
                  <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: '#1A120A' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '100px 5vw 120px', background: '#FAF7F2' }}>
        <div className="property-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)', gap: '40px', alignItems: 'start' }}>

          {/* LEFT — Details */}
          <div>
            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '32px', background: '#fff', padding: '20px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
              <Stat label="Price" value={`${formatPrice(Number(p.price))}${p.listing_type === 'rent' ? '/mo' : ''}`} />
              {p.bedrooms != null && <Stat label="Bedrooms" value={`${p.bedrooms} BHK`} />}
              {p.bathrooms != null && <Stat label="Bathrooms" value={`${p.bathrooms}`} />}
              {p.area_sqft && <Stat label="Carpet area" value={`${p.area_sqft} sqft`} />}
              <Stat label="Type" value={p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1)} />
            </div>

            {/* Description */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid #DDD7CF', marginBottom: '24px' }}>
              <h2 style={sectionHeading}>About this property</h2>
              <p style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {p.description || 'No description available.'}
              </p>
            </div>

            {/* Amenities */}
            {p.amenities && p.amenities.length > 0 && (
              <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid #DDD7CF', marginBottom: '24px' }}>
                <h2 style={sectionHeading}>Amenities</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {p.amenities.map((a) => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#4A4238' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#EBF5EF', color: '#1E4D35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>✓</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid #DDD7CF', marginBottom: '24px' }}>
              <h2 style={sectionHeading}>Property highlights</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {p.has_parking && <Highlight>🚗 Parking</Highlight>}
                {p.is_gated && <Highlight>🔒 Gated Community</Highlight>}
                {p.is_furnished && <Highlight>🛋️ Furnished</Highlight>}
                <Highlight>✓ Verified</Highlight>
                <Highlight>₹0 Brokerage</Highlight>
              </div>
            </div>

            {/* Map */}
            <PropertyMap
              locality={p.locality}
              city={p.city}
              address={p.address}
            />
          </div>

          {/* RIGHT — Contact card */}
          <aside className="property-aside" style={{ position: 'sticky', top: '84px', background: '#fff', padding: '24px', borderRadius: '20px', border: '0.5px solid #DDD7CF', boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '0.5px solid #EEEAE3' }}>
              <div style={{ fontSize: '12px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>Listed by</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#B84A1E,#E8732F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                  {((agent?.full_name ?? p.agent_name) || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {agent ? (
                      <Link href={`/agent/${agent.id}`} style={{ color: '#100E0B', textDecoration: 'none' }}>
                        {agent.full_name || p.agent_name || 'Agent'}
                      </Link>
                    ) : (
                      <span>{p.agent_name || 'Verified Agent'}</span>
                    )}
                    {agent?.is_verified_agent && (
                      <span title="KYC verified agent" style={{ background: '#EBF5EF', color: '#1E4D35', padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>
                        ✓ KYC
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9C9488' }}>
                    {rating?.rating_avg != null
                      ? `★ ${rating.rating_avg.toFixed(1)} · ${rating.review_count} review${rating.review_count === 1 ? '' : 's'}`
                      : 'Responds in 4h · Direct owner'}
                  </div>
                </div>
              </div>
            </div>

            <a
              href={buildWaLink(p.whatsapp || p.phone, p.title)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: '#25D366', color: '#fff', padding: '14px', borderRadius: '11px', textAlign: 'center', fontSize: '15px', fontWeight: 600, textDecoration: 'none', marginBottom: '10px' }}
            >
              💬 WhatsApp Owner
            </a>
            {p.phone && (
              <a
                href={`tel:${p.phone}`}
                style={{ display: 'block', background: '#100E0B', color: '#fff', padding: '14px', borderRadius: '11px', textAlign: 'center', fontSize: '15px', fontWeight: 600, textDecoration: 'none', marginBottom: '16px' }}
              >
                📞 Call Now
              </a>
            )}

            <InquiryForm propertyId={p.id} propertyTitle={p.title} />

            <div style={{ background: '#FBF0EB', borderRadius: '12px', padding: '14px', fontSize: '12px', color: '#4A4238', lineHeight: 1.55, marginTop: '14px' }}>
              <strong style={{ color: '#B84A1E' }}>🛡️ CredibleState Promise:</strong> This listing is physically verified. Owner responds within 4 hours. Zero brokerage charged.
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '80px auto 0' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '28px', fontWeight: 400, marginBottom: '24px', color: '#100E0B' }}>
              Similar Properties
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {similar.map((sp) => <PropertyCard key={sp.id} p={sp} />)}
            </div>
          </div>
        )}
      </section>

      {/* MOBILE STICKY CTA BAR */}
      <div className="mobile-cta-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '0.5px solid #DDD7CF',
        padding: '12px 16px',
        display: 'none',
        gap: '8px',
        zIndex: 50,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.1)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, color: '#100E0B', lineHeight: 1 }}>
            {formatPrice(Number(p.price))}<span style={{ fontSize: '12px', color: '#9C9488' }}>{p.listing_type === 'rent' ? '/mo' : ''}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9C9488' }}>{p.locality} · {p.bedrooms ? `${p.bedrooms} BHK` : p.property_type}</div>
        </div>
        {p.phone && (
          <a href={`tel:${p.phone}`} style={{ background: '#100E0B', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📞
          </a>
        )}
        <a href={buildWaLink(p.whatsapp || p.phone, p.title)} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          💬 WhatsApp
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .property-grid { grid-template-columns: 1fr !important; }
          .property-aside { position: static !important; }
          .mobile-cta-bar { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B' }}>{value}</div>
    </div>
  )
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: '#F0EBE3', color: '#4A4238', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>
      {children}
    </span>
  )
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), serif',
  fontSize: '22px',
  fontWeight: 400,
  marginBottom: '16px',
  color: '#100E0B',
}
