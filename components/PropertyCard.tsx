import Link from 'next/link'
import type { Property } from '@/lib/supabase'
import { formatPrice, buildWaLink } from '@/lib/format'
import FavoriteButton from './FavoriteButton'

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Just listed'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'} ago`
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? '' : 's'} ago`
}

/**
 * A property card can optionally be told whether the listing's agent is KYC-verified.
 * Callers that join `profiles` into their property query should pass this through;
 * otherwise we just rely on the existing "✓ VERIFIED" listing badge.
 */
export default function PropertyCard({ p, isAgentVerified }: { p: Property; isAgentVerified?: boolean }) {
  const isFresh = (Date.now() - new Date(p.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000

  return (
    <article
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '0.5px solid #DDD7CF',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
    >
      <Link href={`/property/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div
          style={{
            height: '220px',
            background: 'linear-gradient(135deg,#1A120A,#2C1A0E)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {p.images && p.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.images[0]}
              alt={p.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '64px', opacity: 0.22 }}>
              {p.property_type === 'villa' ? '🏡' : p.property_type === 'pg' ? '🛏️' : p.property_type === 'plot' ? '🌳' : p.property_type === 'commercial' ? '🏬' : '🏢'}
            </span>
          )}

          {/* Top badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
            <span style={{ background: 'rgba(30,77,53,0.95)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', backdropFilter: 'blur(8px)' }}>
              ✓ VERIFIED
            </span>
            {isFresh && (
              <span style={{ background: 'rgba(184,74,30,0.95)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', backdropFilter: 'blur(8px)' }}>
                NEW
              </span>
            )}
          </div>

          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FavoriteButton propertyId={p.id} />
            <span style={{ background: p.listing_type === 'rent' ? 'rgba(184,74,30,0.95)' : 'rgba(30,77,53,0.95)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', backdropFilter: 'blur(8px)' }}>
              {p.listing_type === 'rent' ? 'RENT' : 'SALE'}
            </span>
          </div>

          {/* Bottom price overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '40px 16px 14px',
              background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 60%,transparent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', color: '#fff', fontWeight: 400, lineHeight: 1 }}>
                {formatPrice(Number(p.price))}
                {p.listing_type === 'rent' && <span style={{ fontSize: '13px', opacity: 0.7, marginLeft: '2px' }}>/mo</span>}
              </div>
              {p.area_sqft && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{p.area_sqft} sqft</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', marginBottom: '4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.title}
          </h3>
          <p style={{ fontSize: '12px', color: '#9C9488', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📍</span> {p.locality}, {p.city}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', minHeight: '22px' }}>
            {p.bedrooms != null && <span style={chip}>{p.bedrooms} BHK</span>}
            {p.bathrooms != null && <span style={chip}>{p.bathrooms} Bath</span>}
            {p.has_parking && <span style={chip}>🚗</span>}
            {p.is_gated && <span style={{ ...chip, background: '#EBF5EF', color: '#1E4D35' }}>Gated</span>}
            {p.is_furnished && <span style={chip}>Furnished</span>}
          </div>
          <div style={{ fontSize: '11px', color: '#9C9488', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              by {p.agent_name || 'CredibleState'}
              {isAgentVerified && (
                <span title="Verified agent" style={{ color: '#1E4D35', fontSize: '11px' }}>✓</span>
              )}
            </span>
            <span>{timeAgo(p.created_at)}</span>
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
