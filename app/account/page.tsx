import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUserWithProfile } from '@/lib/supabase-server'
import type { Conversation, Property, SavedSearch } from '@/lib/supabase'
import { signOut } from '@/app/agent/login/actions'
import { deleteSavedSearch, toggleSearchAlerts, updateProfile } from './actions'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (!user) redirect('/signin?next=/account')

  // Agents have their own dashboard — bounce them.
  if (profile?.role === 'agent') redirect('/agent/dashboard')

  const supabase = await createSupabaseServerClient()

  // Saved searches
  const { data: searches } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  // Recent conversations (unread-ish previews)
  const { data: convs } = await supabase
    .from('conversations')
    .select('*')
    .eq('buyer_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(5)

  // Saved properties (from profile.favorites uuid[])
  const favIds = profile?.favorites ?? []
  let favProps: Property[] = []
  if (favIds.length > 0) {
    const { data: fp } = await supabase
      .from('properties')
      .select('id, slug, title, locality, price, listing_type, images')
      .in('id', favIds)
      .eq('status', 'verified')
    favProps = (fp as Property[]) ?? []
  }

  const savedSearches = (searches as SavedSearch[]) ?? []
  const conversations = (convs as Conversation[]) ?? []

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your account</span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '6px', letterSpacing: '-0.01em' }}>
              Hi <em style={{ color: '#E8732F', fontStyle: 'italic' }}>{profile?.full_name || user.email?.split('@')[0]}</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '4px' }}>{user.email}</p>
          </div>
          <form action={async () => { 'use server'; await signOut(); redirect('/') }}>
            <button style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '32px' }}>

          {/* Profile editor */}
          <Card title="Profile">
            <form action={updateProfile} style={{ display: 'grid', gap: '12px' }}>
              <Field label="Full name">
                <input
                  name="full_name"
                  defaultValue={profile?.full_name ?? ''}
                  style={inputStyle}
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ''}
                  placeholder="+91…"
                  style={inputStyle}
                />
              </Field>
              <button
                type="submit"
                style={{ justifySelf: 'start', background: '#100E0B', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save
              </button>
            </form>
          </Card>

          {/* Saved searches */}
          <Card title="Saved searches">
            {savedSearches.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>
                You haven&apos;t saved any searches yet. Apply filters on{' '}
                <Link href="/rent" style={{ color: '#B84A1E' }}>Browse</Link> and hit
                &ldquo;Save this search&rdquo; — we&apos;ll email you when new matching
                listings go live.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {savedSearches.map((s) => {
                  const params = new URLSearchParams()
                  for (const [k, v] of Object.entries(s.filters || {})) {
                    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv))
                    else if (v) params.set(k, String(v))
                  }
                  const href = `/rent?${params.toString()}`
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', background: '#FAF7F2', borderRadius: '12px', border: '0.5px solid #EEEAE3', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                        <Link href={href} style={{ fontWeight: 600, fontSize: '14px', color: '#100E0B', textDecoration: 'none' }}>{s.name}</Link>
                        <p style={{ fontSize: '12px', color: '#9C9488', marginTop: '2px' }}>
                          {summariseFilters(s.filters)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <form action={toggleSearchAlerts}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="next" value={!s.email_alerts ? '1' : '0'} />
                          <button style={{
                            background: s.email_alerts ? '#1E4D35' : '#fff',
                            color: s.email_alerts ? '#fff' : '#4A4238',
                            border: '0.5px solid #DDD7CF',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}>
                            {s.email_alerts ? '🔔 Alerts on' : '🔕 Alerts off'}
                          </button>
                        </form>
                        <form action={deleteSavedSearch}>
                          <input type="hidden" name="id" value={s.id} />
                          <button style={{ background: 'none', border: 'none', color: '#9C9488', fontSize: '13px', cursor: 'pointer' }} aria-label="Delete saved search">
                            🗑️
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Recent messages */}
          <Card title="Recent messages" action={<Link href="/messages" style={cardLinkStyle}>View inbox →</Link>}>
            {conversations.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>
                Your conversations with agents will appear here.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {conversations.map((c) => (
                  <Link key={c.id} href={`/messages/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '12px 14px', background: '#FAF7F2', borderRadius: '10px', border: '0.5px solid #EEEAE3' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#100E0B', marginBottom: '2px' }}>
                        {c.last_message_preview || 'New conversation'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9C9488' }}>
                        {new Date(c.last_message_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Saved properties */}
          <Card title="Saved properties" action={<Link href="/favorites" style={cardLinkStyle}>See all →</Link>}>
            {favProps.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>
                Tap the ♥ on any property card to keep it here.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {favProps.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/property/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '12px 14px', background: '#FAF7F2', borderRadius: '10px', border: '0.5px solid #EEEAE3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#100E0B' }}>{p.title}</p>
                        <p style={{ fontSize: '11px', color: '#9C9488' }}>{p.locality} · {p.listing_type === 'rent' ? 'For rent' : 'For sale'}</p>
                      </div>
                      <span style={{ color: '#B84A1E', fontSize: '12px', fontWeight: 600 }}>View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  )
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B' }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238' }}>{label}</span>
      {children}
    </label>
  )
}

function summariseFilters(f: SavedSearch['filters'] | null | undefined): string {
  if (!f || typeof f !== 'object') return 'All listings'
  const parts: string[] = []
  if (f.type) parts.push(f.type === 'rent' ? 'For rent' : 'For sale')
  if (f.property_type) parts.push(f.property_type)
  if (f.bhk) parts.push(`${f.bhk} BHK`)
  if (Array.isArray(f.localities) && f.localities.length) parts.push(f.localities.join(', '))
  if (f.min || f.max) parts.push(`₹${f.min || '0'}–${f.max || '∞'}`)
  if (f.furnished === 'yes') parts.push('Furnished')
  if (f.gated === 'yes') parts.push('Gated')
  if (f.parking === 'yes') parts.push('Parking')
  if (f.q) parts.push(`"${f.q}"`)
  return parts.length > 0 ? parts.join(' · ') : 'All listings'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '0.5px solid #DDD7CF',
  borderRadius: '8px',
  background: '#FAF7F2',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const cardLinkStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#B84A1E',
  textDecoration: 'none',
  fontWeight: 600,
}
