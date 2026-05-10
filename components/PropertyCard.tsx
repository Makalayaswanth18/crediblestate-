import Link from 'next/link'
import type { Property } from '@/lib/supabase'
import { formatPrice, buildWaLink } from '@/lib/format'

export default function PropertyCard({ p }: { p: Property }) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '0.5px solid #DDD7CF',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <Link href={`/property/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            height: '200px',
            background: 'linear-gradient(135deg,#1A120A,#2C1A0E)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {p.images && p.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.images[0]}
              alt={p.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '56px', opacity: 0.22 }}>
              {p.property_type === 'villa' ? '🏡' : p.property_type === 'pg' ? '🛏️' : p.property_type === 'plot' ? '🌳' : p.property_type === 'commercial' ? '🏬' : '🏢'}
            </span>
          )}

          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(30,77,53,0.92)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            ✓ VERIFIED
          </div>
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: p.listing_type === 'rent' ? 'rgba(184,74,30,0.92)' : 'rgba(30,77,53,0.92)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {p.listing_type === 'rent' ? 'RENT' : 'SALE'}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 16px 14px',
              background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', color: '#fff', fontWeight: 400 }}>
              {formatPrice(Number(p.price))}
              {p.listing_type === 'rent' && <span style={{ fontSize: '12px', opacity: 0.7 }}>/mo</span>}
            </div>
            {p.area_sqft && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{p.area_sqft} sqft</div>}
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', marginBottom: '5px', lineHeight: 1.3 }}>
            {p.title}
          </h3>
          <p style={{ fontSize: '12px', color: '#9C9488', marginBottom: '12px' }}>
            📍 {p.locality}, {p.city}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {p.bedrooms != null && <span style={chip}>{p.bedrooms} BHK</span>}
            {p.has_parking && <span style={chip}>Parking</span>}
            {p.is_gated && <span style={{ ...chip, background: '#EBF5EF', color: '#1E4D35' }}>Gated</span>}
            {p.is_furnished && <span style={chip}>Furnished</span>}
          </div>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
        <Link
          href={`/property/${p.slug}`}
          style={{
            flex: 1,
            background: '#F0EBE3',
            color: '#B84A1E',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          View Details
        </Link>
        <a
          href={buildWaLink(p.whatsapp || p.phone, p.title)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            background: '#25D366',
            color: '#fff',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          💬 WhatsApp
        </a>
      </div>
    </article>
  )
}

const chip: React.CSSProperties = {
  background: '#F0EBE3',
  color: '#4A4238',
  padding: '3px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 500,
}
