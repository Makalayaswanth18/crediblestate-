import Link from 'next/link'
import { supabase, type Property, type SavedSearchFilters } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import SaveSearchButton from '@/components/SaveSearchButton'
import { POPULAR_LOCALITIES as ALL_LOCALITIES } from '@/lib/localities'
// SaveSearchButton discovers signin state client-side now — we deliberately
// don't read cookies in this server component, so /rent stays CDN-cacheable.

export const revalidate = 120 // 2 min

type SearchParams = {
  q?: string
  type?: string
  property_type?: string
  locality?: string
  localities?: string | string[]
  bhk?: string
  min?: string
  max?: string
  furnished?: string
  parking?: string
  gated?: string
  owner_only?: string
  sort?: string
}

/**
 * Popular Hyderabad localities for the chip row. Pulled from lib/localities so
 * the chip names + slugs stay aligned with the dedicated /rent/[slug] pages.
 */
const POPULAR_LOCALITIES = ALL_LOCALITIES

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

const PAGE_SIZE = 60

/**
 * Build a HEAD-only count query that mirrors the filters of the main listing
 * query, so we know the total number of matching rows for pagination.
 */
function buildCountQuery(params: SearchParams, localityList: string[]) {
  let q = supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'verified')

  if (params.type === 'rent' || params.type === 'sale') q = q.eq('listing_type', params.type)
  if (params.property_type) q = q.eq('property_type', params.property_type)
  if (localityList.length > 0) {
    const safe = (s: string) => s.replace(/[,.()*:'"\\%]/g, '').slice(0, 60)
    const cleaned = localityList.map(safe).filter(Boolean)
    if (cleaned.length > 0) {
      q = q.or(cleaned.map((loc) => `locality.ilike.%${loc}%`).join(','))
    }
  }
  if (params.bhk) {
    if (params.bhk === '4+') q = q.gte('bedrooms', 4)
    else {
      const n = Number(params.bhk)
      if (Number.isFinite(n)) q = q.eq('bedrooms', n)
    }
  }
  if (params.min) q = q.gte('price', Number(params.min))
  if (params.max) q = q.lte('price', Number(params.max))
  if (params.furnished === 'yes') q = q.eq('is_furnished', true)
  if (params.parking === 'yes') q = q.eq('has_parking', true)
  if (params.gated === 'yes') q = q.eq('is_gated', true)
  if (params.owner_only === 'yes') q = q.eq('owner_listed', true)
  if (params.q) {
    const cleanQ = params.q.replace(/[,.()*:'"\\%]/g, '').trim().slice(0, 80)
    if (cleanQ) {
      q = q.or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%,locality.ilike.%${cleanQ}%`)
    }
  }
  return q
}

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // Localities: support either ?localities=A&localities=B (multi) or ?locality=A (legacy)
  const localityList = (() => {
    const fromArr = toArray(params.localities).filter(Boolean)
    if (fromArr.length > 0) return fromArr
    return params.locality ? [params.locality] : []
  })()

  // Sort
  let sortField: string = 'created_at'
  let sortAsc = false
  if (params.sort === 'price-low') { sortField = 'price'; sortAsc = true }
  else if (params.sort === 'price-high') { sortField = 'price'; sortAsc = false }
  else if (params.sort === 'newest') { sortField = 'created_at'; sortAsc = false }
  else if (params.sort === 'oldest') { sortField = 'created_at'; sortAsc = true }

  // Pagination — cap each page at PAGE_SIZE listings.
  const pageNum = Math.max(1, Math.min(100, Number((params as { page?: string }).page) || 1))
  const rangeStart = (pageNum - 1) * PAGE_SIZE
  const rangeEnd = rangeStart + PAGE_SIZE - 1

  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'verified')
    .order(sortField, { ascending: sortAsc })
    .range(rangeStart, rangeEnd)

  if (params.type === 'rent' || params.type === 'sale') {
    query = query.eq('listing_type', params.type)
  }
  if (params.property_type) {
    query = query.eq('property_type', params.property_type)
  }
  if (localityList.length > 0) {
    // SAFETY: any chars with meaning in PostgREST filter syntax must be stripped.
    // `,` separates OR conditions, `()` groups, `.` separates column.op.value, `*`
    // is wildcard, `:` is range. We strip all of them so user input can't break
    // out of the ilike value.
    const safe = (s: string) => s.replace(/[,.()*:'"\\%]/g, '').slice(0, 60)
    const cleanedLocalities = localityList.map(safe).filter(Boolean)
    if (cleanedLocalities.length > 0) {
      const orExpr = cleanedLocalities
        .map((loc) => `locality.ilike.%${loc}%`)
        .join(',')
      query = query.or(orExpr)
    }
  }
  if (params.bhk) {
    if (params.bhk === '4+') {
      query = query.gte('bedrooms', 4)
    } else {
      const n = Number(params.bhk)
      if (Number.isFinite(n)) query = query.eq('bedrooms', n)
    }
  }
  if (params.min) {
    query = query.gte('price', Number(params.min))
  }
  if (params.max) {
    query = query.lte('price', Number(params.max))
  }
  if (params.furnished === 'yes') query = query.eq('is_furnished', true)
  if (params.parking === 'yes') query = query.eq('has_parking', true)
  if (params.gated === 'yes') query = query.eq('is_gated', true)
  if (params.owner_only === 'yes') query = query.eq('owner_listed', true)
  if (params.q) {
    // SAFETY: strip PostgREST-meaningful characters from the search query
    const cleanQ = params.q.replace(/[,.()*:'"\\%]/g, '').trim().slice(0, 80)
    if (cleanQ) {
      query = query.or(
        `title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%,locality.ilike.%${cleanQ}%`,
      )
    }
  }

  // Run data fetch + total count in parallel so we know how many pages exist
  let properties: Property[] = []
  let totalCount = 0
  try {
    const [{ data }, { count }] = await Promise.all([
      query,
      buildCountQuery(params, localityList),
    ])
    properties = (data as Property[]) || []
    totalCount = count ?? 0
  } catch {
    properties = []
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Build the filters blob we'll hand to the SaveSearchButton
  const filtersForSave: SavedSearchFilters = {
    q: params.q || undefined,
    type: params.type === 'rent' ? 'rent' : params.type === 'sale' ? 'sale' : undefined,
    property_type: params.property_type || undefined,
    localities: localityList,
    bhk: params.bhk || undefined,
    min: params.min || undefined,
    max: params.max || undefined,
    furnished: params.furnished === 'yes' ? 'yes' : undefined,
    parking: params.parking === 'yes' ? 'yes' : undefined,
    gated: params.gated === 'yes' ? 'yes' : undefined,
    owner_only: params.owner_only === 'yes' ? 'yes' : undefined,
  }

  const hasAnyFilter =
    !!params.q || !!params.type || !!params.property_type || localityList.length > 0 ||
    !!params.bhk || !!params.min || !!params.max ||
    params.furnished === 'yes' || params.parking === 'yes' || params.gated === 'yes' ||
    params.owner_only === 'yes'

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
              gap: '14px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
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
              <select name="bhk" defaultValue={params.bhk || ''} style={inputStyle}>
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4+">4+ BHK</option>
              </select>
              <input name="min" defaultValue={params.min || ''} placeholder="Min price (₹)" style={inputStyle} type="number" />
              <input name="max" defaultValue={params.max || ''} placeholder="Max price (₹)" style={inputStyle} type="number" />
              <select name="sort" defaultValue={params.sort || ''} style={inputStyle}>
                <option value="">Sort: Newest first</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/*
              Locality chips — click any one to jump straight to that locality's
              page. Each chip links to /rent/[slug] (already a real page that
              shows that locality's verified listings, with an SEO-tuned hero +
              "explore other localities" footer for cross-linking).

              We deliberately don't make these multi-select anymore: a single
              click → results, no extra "Apply Filters" step. Power users who
              want multi-locality can still combine via the ?localities=A&B
              URL params manually.
             */}
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Popular localities · click to view
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {POPULAR_LOCALITIES.map((loc) => {
                  const active = localityList.includes(loc.name)
                  return (
                    <Link
                      key={loc.slug}
                      href={`/rent/${loc.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        background: active ? '#B84A1E' : 'rgba(255,255,255,0.08)',
                        color: active ? '#fff' : 'rgba(255,255,255,0.85)',
                        border: '0.5px solid ' + (active ? '#B84A1E' : 'rgba(255,255,255,0.18)'),
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {loc.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Amenity + owner toggles */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <CheckChip name="owner_only" defaultChecked={params.owner_only === 'yes'} label="🏠 Owner Only" highlight />
              <CheckChip name="furnished"  defaultChecked={params.furnished  === 'yes'} label="🛋️ Furnished" />
              <CheckChip name="parking"    defaultChecked={params.parking    === 'yes'} label="🚗 Parking" />
              <CheckChip name="gated"      defaultChecked={params.gated      === 'yes'} label="🔒 Gated" />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {hasAnyFilter && (
                <Link
                  href="/rent"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Clear all
                </Link>
              )}
              <button
                type="submit"
                style={{
                  background: '#B84A1E',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply Filters
              </button>
            </div>
          </form>

          {/* Save this search */}
          {hasAnyFilter && (
            <div style={{ marginTop: '14px' }}>
              <SaveSearchButton filters={filtersForSave} />
            </div>
          )}
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
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
                {properties.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={pageNum}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  searchParams={params}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

/** Pagination — render a row of "← Prev | 1 2 3 … | Next →" links. */
function Pagination({
  currentPage,
  totalPages,
  totalCount,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  totalCount: number
  searchParams: SearchParams
}) {
  // Build the base URL with all current filters preserved
  const baseParams = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === 'page' || v == null) continue
    if (Array.isArray(v)) v.forEach((vv) => baseParams.append(k, vv))
    else baseParams.set(k, String(v))
  }
  const linkFor = (page: number) => {
    const sp = new URLSearchParams(baseParams)
    if (page > 1) sp.set('page', String(page))
    const qs = sp.toString()
    return `/rent${qs ? '?' + qs : ''}`
  }

  // Build the visible page numbers: 1, ..., current-1, current, current+1, ..., last
  const visible = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  const pages = Array.from(visible).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        justifyContent: 'center', alignItems: 'center',
        marginTop: '48px', paddingTop: '32px',
        borderTop: '0.5px solid #EEEAE3',
      }}
    >
      <span style={{ fontSize: '13px', color: '#9C9488', marginRight: '8px' }}>
        Page {currentPage} of {totalPages} · {totalCount} total
      </span>

      {currentPage > 1 && (
        <Link href={linkFor(currentPage - 1)} style={pageBtn(false)}>← Prev</Link>
      )}

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        const showEllipsis = prev != null && p - prev > 1
        return (
          <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {showEllipsis && <span style={{ color: '#9C9488', fontSize: '13px' }}>…</span>}
            <Link href={linkFor(p)} style={pageBtn(p === currentPage)}>{p}</Link>
          </span>
        )
      })}

      {currentPage < totalPages && (
        <Link href={linkFor(currentPage + 1)} style={pageBtn(false)}>Next →</Link>
      )}
    </nav>
  )
}

function pageBtn(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    background: active ? '#B84A1E' : '#fff',
    color: active ? '#fff' : '#100E0B',
    border: '0.5px solid ' + (active ? '#B84A1E' : '#DDD7CF'),
    minWidth: '40px',
    textAlign: 'center' as const,
    display: 'inline-block',
  }
}

function CheckChip({ name, defaultChecked, label, highlight }: { name: string; defaultChecked: boolean; label: string; highlight?: boolean }) {
  const activeColor = highlight ? '#B84A1E' : '#1E4D35'
  return (
    <label style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: highlight ? 600 : 500,
      cursor: 'pointer',
      background: defaultChecked ? activeColor : 'rgba(255,255,255,0.08)',
      color: defaultChecked ? '#fff' : highlight ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
      border: '0.5px solid ' + (defaultChecked ? activeColor : highlight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'),
    }}>
      <input type="checkbox" name={name} value="yes" defaultChecked={defaultChecked} style={{ display: 'none' }} />
      {label}
    </label>
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
