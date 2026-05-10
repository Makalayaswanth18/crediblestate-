import Link from 'next/link'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 30

type SearchParams = {
  q?: string
  type?: string
  property_type?: string
  locality?: string
  bhk?: string
  min?: string
  max?: string
}

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })

  if (params.type === 'rent' || params.type === 'sale') {
    query = query.eq('listing_type', params.type)
  }
  if (params.property_type) {
    query = query.eq('property_type', params.property_type)
  }
  if (params.locality) {
    query = query.ilike('locality', `%${params.locality}%`)
  }
  if (params.bhk) {
    query = query.eq('bedrooms', Number(params.bhk))
  }
  if (params.min) {
    query = query.gte('price', Number(params.min))
  }
  if (params.max) {
    query = query.lte('price', Number(params.max))
  }
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%,locality.ilike.%${params.q}%`,
    )
  }

  let properties: Property[] = []
  try {
    const { data } = await query
    properties = (data as Property[]) || []
  } catch {
    properties = []
  }

  return (
    <>
      {/* Filter bar */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '60px 5vw 80px', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, marginBottom: '12px', letterSpacing: '-0.01em' }}>
            Browse <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Verified Properties</em>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '15px' }}>
            {properties.length} verified {properties.length === 1 ? 'property' : 'properties'} matching your search in Hyderabad
          </p>

          <form
            action="/rent"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            <input name="q" defaultValue={params.q || ''} placeholder="Search keywords..." style={inputStyle} />
            <select name="type" defaultValue={params.type || ''} style={inputStyle}>
              <option value="">All Listings</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
            <select name="property_type" defaultValue={params.property_type || ''} style={inputStyle}>
              <option value="">Any Type</option>
              <option value="flat">Flat / Apartment</option>
              <option value="villa">Villa</option>
              <option value="pg">PG / Hostel</option>
              <option value="plot">Plot / Land</option>
              <option value="commercial">Commercial</option>
            </select>
            <input name="locality" defaultValue={params.locality || ''} placeholder="Locality (e.g., Kondapur)" style={inputStyle} />
            <select name="bhk" defaultValue={params.bhk || ''} style={inputStyle}>
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
            <input name="min" defaultValue={params.min || ''} placeholder="Min price (₹)" style={inputStyle} type="number" />
            <input name="max" defaultValue={params.max || ''} placeholder="Max price (₹)" style={inputStyle} type="number" />
            <button
              type="submit"
              style={{
                background: '#B84A1E',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Apply Filters
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: '64px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.6 }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '10px' }}>No properties match your filters</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65, marginBottom: '24px' }}>
                Try removing some filters or expanding your search area.
              </p>
              <Link href="/rent" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
              {properties.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '14px',
  color: '#100E0B',
  outline: 'none',
  fontFamily: 'inherit',
}
