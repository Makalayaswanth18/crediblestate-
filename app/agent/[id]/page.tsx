import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase, type Profile, type Property, type Review, type AgentRatingSummary } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (!isUuid(id)) return { title: 'Agent — CredibleState' }

  const { data } = await supabase
    .from('profiles')
    .select('full_name, is_verified_agent')
    .eq('id', id)
    .maybeSingle()
  const name = (data?.full_name as string | null) ?? 'Agent'
  return {
    title: `${name} — CredibleState`,
    description: `Verified property listings and reviews for ${name} on CredibleState.`,
  }
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export default async function AgentProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const [{ data: profile }, { data: listings }, { data: reviews }, { data: summary }] = await Promise.all([
    supabase.from('public_profiles').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('properties')
      .select('*')
      .eq('agent_id', id)
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('reviews')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('agent_rating_summary')
      .select('*')
      .eq('agent_id', id)
      .maybeSingle(),
  ])

  if (!profile || (profile as Profile).role !== 'agent') notFound()

  const p = profile as Profile
  const props = (listings as Property[]) ?? []
  const revs = (reviews as Review[]) ?? []
  const ratings = (summary as AgentRatingSummary | null) ?? { agent_id: id, review_count: 0, rating_avg: null }

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '60px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg,#B84A1E,#E8732F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '36px' }}>
              {(p.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '6px' }}>
                {p.full_name || 'Agent'}
              </h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                {p.is_verified_agent ? (
                  <span style={{ background: 'rgba(30,77,53,0.92)', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.04em', fontSize: '11px' }}>
                    ✓ VERIFIED AGENT
                  </span>
                ) : (
                  <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px' }}>
                    Pending verification
                  </span>
                )}
                {ratings.rating_avg != null && (
                  <span style={{ color: '#E8732F' }}>
                    ★ {ratings.rating_avg.toFixed(1)} <span style={{ color: 'rgba(255,255,255,0.55)' }}>({ratings.review_count} review{ratings.review_count === 1 ? '' : 's'})</span>
                  </span>
                )}
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>·</span>
                <span>{props.length} live listing{props.length === 1 ? '' : 's'}</span>
              </div>
              {p.bio && (
                <p style={{ marginTop: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '60ch' }}>
                  {p.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '48px' }}>

          {/* Listings */}
          <div>
            <h2 style={sectionHeading}>Live listings</h2>
            {props.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>No live listings right now.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {props.map((pp) => <PropertyCard key={pp.id} p={pp} />)}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 style={sectionHeading}>What buyers said</h2>
            {revs.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>
                No reviews yet. After a deal closes, the buyer can leave a review here.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {revs.map((r) => (
                  <div key={r.id} style={{ background: '#fff', padding: '16px 18px', borderRadius: '14px', border: '0.5px solid #DDD7CF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: '#E8732F', fontSize: '16px' }}>
                        {'★'.repeat(r.rating)}<span style={{ color: '#DDD7CF' }}>{'★'.repeat(5 - r.rating)}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: '#9C9488' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    {r.body && (
                      <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.6 }}>{r.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Link href="/rent" style={{ background: '#fff', color: '#B84A1E', padding: '12px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', border: '0.5px solid #DDD7CF' }}>
              ← Back to browse
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), serif',
  fontSize: '26px',
  fontWeight: 400,
  marginBottom: '16px',
  color: '#100E0B',
}
