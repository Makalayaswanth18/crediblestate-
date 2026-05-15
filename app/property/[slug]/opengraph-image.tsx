import { ImageResponse } from 'next/og'
import { supabase, type Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'

export const alt = 'Verified property on CredibleState'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Per-property Open Graph card. Renders the hero photo on the left, with
 * title / price / locality / "✓ VERIFIED" overlay on a brand-coloured panel.
 *
 * Next caches the result at the edge, so each property's card is generated
 * once and served from CDN forever (until you redeploy or revalidate).
 * Cost: $0.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { data } = await supabase
    .from('properties')
    .select('title, price, listing_type, locality, bedrooms, property_type, images')
    .eq('slug', slug)
    .eq('status', 'verified')
    .single()

  const p = data as Pick<
    Property,
    'title' | 'price' | 'listing_type' | 'locality' | 'bedrooms' | 'property_type' | 'images'
  > | null

  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg,#1A120A,#2C1A0E)',
            color: '#fff',
            fontSize: 60,
            fontFamily: 'serif',
            fontStyle: 'italic',
          }}
        >
          CredibleState
        </div>
      ),
      size,
    )
  }

  const priceStr = formatPrice(Number(p.price)) + (p.listing_type === 'rent' ? '/mo' : '')
  const typeLabel = p.bedrooms ? `${p.bedrooms} BHK ${p.property_type}` : p.property_type
  const hero = p.images?.[0] ?? null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#1A120A',
          color: '#fff',
        }}
      >
        {/* Hero photo (or fallback gradient) */}
        <div
          style={{
            flex: '0 0 60%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg,#2C1A0E,#1A120A)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {hero ? (
            <img
              src={hero}
              alt=""
              width={720}
              height={630}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: 200, opacity: 0.3 }}>
              {p.property_type === 'villa' ? '🏡' : p.property_type === 'plot' ? '🌳' : '🏢'}
            </div>
          )}
          {/* Verified ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 32,
              left: 32,
              display: 'flex',
              gap: 8,
            }}
          >
            <div
              style={{
                background: '#1E4D35',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              ✓ VERIFIED
            </div>
            <div
              style={{
                background: p.listing_type === 'rent' ? '#B84A1E' : '#1E4D35',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.06em',
              }}
            >
              FOR {p.listing_type.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1,
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg,#1A120A,#2C1A0E)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                fontFamily: 'serif',
                fontSize: 36,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Credible<span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>State</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontFamily: 'serif',
                fontSize: 56,
                fontWeight: 400,
                lineHeight: 1.1,
                color: '#E8732F',
                letterSpacing: '-0.01em',
              }}
            >
              {priceStr}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.2,
                display: 'flex',
              }}
            >
              {p.title.slice(0, 60)}
            </div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 12 }}>
              <span>📍 {p.locality}</span>
              <span>·</span>
              <span style={{ textTransform: 'capitalize' }}>{typeLabel}</span>
            </div>
          </div>

          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.55)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: 20,
              display: 'flex',
            }}
          >
            Zero brokerage · Direct from owner · Hyderabad
          </div>
        </div>
      </div>
    ),
    size,
  )
}
