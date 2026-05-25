import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUserWithProfile } from '@/lib/supabase-server'
import type { Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'
import { signOut } from '@/app/agent/login/actions'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (!user) redirect('/signin?next=/owner/dashboard')

  // Allow owners and agents who submitted owner listings
  if (profile?.role === 'buyer') redirect('/account')

  const supabase = await createSupabaseServerClient()

  const { data: listingsRaw } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', user.id)
    .eq('owner_listed', true)
    .order('created_at', { ascending: false })

  const listings = (listingsRaw as Property[]) || []
  const pending  = listings.filter(l => l.status === 'pending')
  const verified = listings.filter(l => l.status === 'verified')
  const archived = listings.filter(l => l.status === 'rejected' || l.status === 'rented' || l.status === 'sold')

  // Inquiry counts per listing
  const ids = listings.map(l => l.id)
  let inquiryCounts: Record<string, number> = {}
  if (ids.length > 0) {
    const { data: convs } = await supabase
      .from('conversations')
      .select('property_id')
      .in('property_id', ids)
    if (convs) {
      inquiryCounts = (convs as { property_id: string }[]).reduce((acc, row) => {
        acc[row.property_id] = (acc[row.property_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  const totalInquiries = Object.values(inquiryCounts).reduce((a, b) => a + b, 0)

  return (
    <>
      {/* Header */}
      <section style={{ background: 'linear-gradient(160deg,#0E2218,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Owner Dashboard</span>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400, marginTop: '6px', letterSpacing: '-0.01em' }}>
              Welcome back, <em style={{ color: '#E8732F', fontStyle: 'italic' }}>{profile?.full_name || user.email?.split('@')[0]}</em>
            </h1>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(136,229,168,0.12)', border: '0.5px solid rgba(136,229,168,0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: '#88E5A8', fontWeight: 600, letterSpacing: '0.04em' }}>
              🏠 DIRECT OWNER
            </div>
          </div>
          <form action={async () => { 'use server'; await signOut(); redirect('/') }}>
            <button style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '0.5px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Sign out
            </button>
          </form>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: '1100px', margin: '28px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {[
            ['Properties', listings.length, '#E8732F'],
            ['Live now', verified.length, '#27C93F'],
            ['Pending', pending.length, '#F5A623'],
            ['Inquiries', totalInquiries, '#FFFFFF'],
          ].map(([label, value, color]) => (
            <div key={label as string} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '30px', color: color as string, fontWeight: 400 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '56px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>🏠</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 400, marginBottom: '12px' }}>
                You haven&apos;t listed any properties yet
              </h3>
              <p style={{ fontSize: '14px', color: '#9C9488', marginBottom: '24px' }}>
                List your property directly — buyers contact you, zero brokerage, forever.
              </p>
              <Link href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                List Your Property Free
              </Link>
            </div>
          ) : (
            <>
              {/* Action bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', fontWeight: 400 }}>Your properties</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {totalInquiries > 0 && (
                    <Link href="/agent/messages" style={smallBtn}>📩 Inquiries ({totalInquiries})</Link>
                  )}
                  <Link href="/list" style={{ ...smallBtn, background: '#B84A1E', color: '#fff', borderColor: '#B84A1E' }}>
                    + List Another
                  </Link>
                </div>
              </div>

              {/* What "Direct Owner" means */}
              <div style={{ background: '#EBF5EF', border: '0.5px solid #B8DBC6', borderRadius: '14px', padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>🏠</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1E4D35', marginBottom: '4px' }}>You are connected directly to buyers</div>
                  <p style={{ fontSize: '13px', color: '#4A7C5F', lineHeight: 1.6 }}>
                    When a buyer inquires, their message comes directly to you — no broker reads it, no middleman takes a cut. Every inquiry you get is a real buyer talking to the property owner.
                  </p>
                </div>
              </div>

              {pending.length > 0 && <ListingGroup title="Pending verification" items={pending} inquiryCounts={inquiryCounts} editable />}
              {verified.length > 0 && <ListingGroup title="Live on CredibleState" items={verified} inquiryCounts={inquiryCounts} markable />}
              {archived.length > 0 && <ListingGroup title="Archived" items={archived} inquiryCounts={inquiryCounts} />}
            </>
          )}

          {/* Help */}
          <div style={{ marginTop: '40px', background: '#fff', borderRadius: '14px', border: '0.5px solid #DDD7CF', padding: '20px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#100E0B', marginBottom: '4px' }}>Need help?</div>
              <p style={{ fontSize: '13px', color: '#9C9488' }}>WhatsApp or email us — we respond within 2 hours.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="https://wa.me/919182249782" target="_blank" rel="noopener noreferrer" style={{ ...smallBtn, background: '#25D366', color: '#fff', borderColor: '#25D366' }}>💬 WhatsApp Us</a>
              <a href="mailto:hello@crediblestate.com" style={smallBtn}>✉️ Email</a>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

function ListingGroup({ title, items, inquiryCounts, editable, markable }: {
  title: string
  items: Property[]
  inquiryCounts: Record<string, number>
  editable?: boolean
  markable?: boolean
}) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        {title} ({items.length})
      </h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {items.map((p) => (
          <div key={p.id} style={{ background: '#fff', borderRadius: '14px', border: '0.5px solid #DDD7CF', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <StatusBadge status={p.status} />
                {(inquiryCounts[p.id] ?? 0) > 0 && (
                  <Link href="/agent/messages" style={{ background: '#FBF0EB', color: '#B84A1E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>
                    📩 {inquiryCounts[p.id]} {inquiryCounts[p.id] === 1 ? 'inquiry' : 'inquiries'}
                  </Link>
                )}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h4>
              <p style={{ fontSize: '12px', color: '#9C9488' }}>
                📍 {p.locality} · {formatPrice(Number(p.price))}{p.listing_type === 'rent' ? '/mo' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {p.status === 'verified' && (
                <Link href={`/property/${p.slug}`} target="_blank" style={smallBtn}>👁️ View Live</Link>
              )}
              {editable && (
                <Link href={`/agent/dashboard/${p.id}/edit`} style={smallBtn}>✏️ Edit</Link>
              )}
              {markable && (
                <form action={`/agent/dashboard/${p.id}/mark-${p.listing_type === 'rent' ? 'rented' : 'sold'}`} method="post">
                  <button style={smallBtn}>Mark {p.listing_type === 'rent' ? 'Rented' : 'Sold'}</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending:  ['#F5A623', 'PENDING VERIFICATION'],
    verified: ['#1E4D35', 'LIVE'],
    rejected: ['#991B1B', 'REJECTED'],
    rented:   ['#9C9488', 'RENTED'],
    sold:     ['#9C9488', 'SOLD'],
  }
  const [color, label] = map[status] || ['#9C9488', status.toUpperCase()]
  return (
    <span style={{ background: color, color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
      {label}
    </span>
  )
}

const smallBtn: React.CSSProperties = {
  background: '#fff',
  color: '#100E0B',
  border: '0.5px solid #DDD7CF',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'inherit',
  display: 'inline-block',
}
