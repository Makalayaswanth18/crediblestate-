import {
  getCoordsForLocality,
  osmEmbedUrl,
  googleMapsUrl,
  googleMapsDirectionsUrl,
} from '@/lib/coordinates'

export default function PropertyMap({
  locality,
  city,
  address,
}: {
  locality: string
  city: string
  address?: string | null
}) {
  const coords = getCoordsForLocality(locality)
  const label = `${locality}, ${city}`
  const isExact = coords.lat !== 17.3850 || coords.lng !== 78.4867 // not the fallback

  return (
    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '4px' }}>
            Location
          </h2>
          <p style={{ fontSize: '13px', color: '#9C9488' }}>
            📍 {address || `${locality}, ${city}`}
            {!isExact && <span style={{ marginLeft: '6px', color: '#B84A1E' }}>(approximate)</span>}
          </p>
        </div>
        <a
          href={googleMapsDirectionsUrl(coords)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#100E0B',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          🧭 Get Directions
        </a>
      </div>

      <div style={{ position: 'relative', height: '320px', borderRadius: '12px', overflow: 'hidden', border: '0.5px solid #DDD7CF' }}>
        <iframe
          src={osmEmbedUrl(coords)}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${label}`}
        />
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a
          href={googleMapsUrl(coords, label)}
          target="_blank"
          rel="noopener noreferrer"
          style={mapLinkStyle}
        >
          🗺️ View on Google Maps
        </a>
        <a
          href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          style={mapLinkStyle}
        >
          🌍 Open in OpenStreetMap
        </a>
      </div>

      {!isExact && (
        <p style={{ marginTop: '14px', fontSize: '12px', color: '#9C9488', lineHeight: 1.55, padding: '10px 14px', background: '#FAF7F2', borderRadius: '8px' }}>
          <strong style={{ color: '#100E0B' }}>Note:</strong> Map shows the {locality} area. WhatsApp the owner via the button above for the exact pin location and a site visit.
        </p>
      )}
    </div>
  )
}

const mapLinkStyle: React.CSSProperties = {
  background: '#F0EBE3',
  color: '#100E0B',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  textDecoration: 'none',
}
