import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'
import type { Property } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'
import { approveListing, rejectListing } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminPendingPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/signin?next=/admin/pending')

  const supabase = await createSupabaseServerClient()
  const { data: pending } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const items = (pending as Property[]) || []

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(184,74,30,0.2)', color: '#E8732F', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', display: 'inline-block' }}>
            ADMIN
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Pending <em style={{ color: '#E8732F', fontStyle: 'italic' }}>verification queue</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            {items.length} {items.length === 1 ? 'listing' : 'listings'} waiting for verification.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>✨</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>Inbox zero!</h3>
              <p style={{ fontSize: '14px', color: '#9C9488' }}>No listings pending verification right now.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {items.map((p) => {
                const photos = (p.images || []).filter(Boolean)
                return (
                <div key={p.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ background: '#FBF0EB', color: '#B84A1E', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {p.property_type.toUpperCase()}
                        </span>
                        <span style={{ background: p.listing_type === 'rent' ? 'rgba(184,74,30,0.15)' : 'rgba(30,77,53,0.15)', color: p.listing_type === 'rent' ? '#B84A1E' : '#1E4D35', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                          FOR {p.listing_type.toUpperCase()}
                        </span>
                        {p.owner_listed && (
                          <span style={{ background: 'rgba(14,34,24,0.95)', color: '#88E5A8', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', border: '0.5px solid rgba(136,229,168,0.3)' }}>
                            🏠 OWNER LISTED
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>{p.title}</h3>
                      <p style={{ fontSize: '13px', color: '#9C9488', marginBottom: '10px' }}>
                        📍 {p.address || `${p.locality}, ${p.city}`}
                      </p>

                      {/* Photo gallery for admin review */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}>
                          Photos ({photos.length})
                        </div>
                        {photos.length === 0 ? (
                          <div style={{ background: '#FEF2F2', border: '1px dashed #FCA5A5', borderRadius: '10px', padding: '20px', textAlign: 'center', color: '#991B1B', fontSize: '13px' }}>
                            ⚠️ No photos uploaded — request photos before approving
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '6px' }}>
                            {photos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: '#F0EBE3', border: '0.5px solid #DDD7CF' }} title="Click to view full size">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '13px', marginBottom: '14px', padding: '12px', background: '#FAF7F2', borderRadius: '10px' }}>
                        <div><strong>Price:</strong> {formatPrice(Number(p.price))}{p.listing_type === 'rent' ? '/mo' : ''}</div>
                        {p.area_sqft && <div><strong>Area:</strong> {p.area_sqft} sqft</div>}
                        {p.bedrooms != null && <div><strong>BHK:</strong> {p.bedrooms}</div>}
                        {p.bathrooms != null && <div><strong>Bath:</strong> {p.bathrooms}</div>}
                      </div>
                      {p.description && (
                        <p style={{ fontSize: '13px', color: '#4A4238', lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                          {p.description.length > 240 ? p.description.slice(0, 240) + '…' : p.description}
                        </p>
                      )}
                      <div style={{ fontSize: '12px', color: '#9C9488' }}>
                        Submitted by <strong style={{ color: '#100E0B' }}>{p.agent_name}</strong> · {p.phone} · {new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 auto' }}>
                      <a href={`https://wa.me/${(p.whatsapp || p.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ ...adminBtn, background: '#25D366', color: '#fff', borderColor: '#25D366' }}>
                        💬 Verify via WhatsApp
                      </a>
                      <form action={async () => { 'use server'; await approveListing(p.id) }}>
                        <button style={{ ...adminBtn, background: '#1E4D35', color: '#fff', borderColor: '#1E4D35', width: '100%' }}>✅ Approve</button>
                      </form>
                      <form action={async () => { 'use server'; await rejectListing(p.id) }}>
                        <button style={{ ...adminBtn, background: '#fff', color: '#991B1B', borderColor: '#FCA5A5', width: '100%' }}>✗ Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: '32px', padding: '20px', background: '#fff', borderRadius: '12px', border: '0.5px solid #DDD7CF', fontSize: '13px', color: '#9C9488', lineHeight: 1.6 }}>
            <strong style={{ color: '#100E0B' }}>Verification process:</strong> Click &ldquo;Verify via WhatsApp&rdquo; to message the agent and confirm the listing is real. Visit the property if needed. Approve only after physical verification.
          </div>
        </div>
      </section>
    </>
  )
}

const adminBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  cursor: 'pointer',
  border: '0.5px solid #DDD7CF',
  display: 'inline-block',
  textAlign: 'center',
  fontFamily: 'inherit',
}
