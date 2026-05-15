import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { Conversation, Message, Property, Profile } from '@/lib/supabase'
import { formatPrice } from '@/lib/format'
import MessageThread from '@/components/MessageThread'
import LeaveReview from '@/components/LeaveReview'

export const dynamic = 'force-dynamic'

export default async function BuyerThread({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/signin?next=/messages/${id}`)

  const supabase = await createSupabaseServerClient()

  const { data: convo } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!convo) notFound()
  const c = convo as Conversation
  if (c.buyer_id !== user.id) notFound()

  // Property + agent profile (for the header)
  const [{ data: prop }, { data: agentProfile }, { data: msgs }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, slug, title, locality, price, listing_type, images, agent_name')
      .eq('id', c.property_id)
      .maybeSingle(),
    c.agent_id
      ? supabase.from('profiles').select('*').eq('id', c.agent_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', c.id)
      .order('created_at', { ascending: true }),
  ])

  const property = prop as Property | null
  const agent = agentProfile as Profile | null
  const messages = (msgs as Message[]) ?? []
  const closed = c.status !== 'open'

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '32px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/messages" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← All messages</Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flex: '0 0 64px' }}>
              {property?.images?.[0]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={property.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: '4px' }}>
                {property?.title || 'Property'}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                {property?.locality} · {property ? formatPrice(Number(property.price)) : ''}
                {property?.listing_type === 'rent' ? '/mo' : ''}
                {' '}·{' '}
                <Link href={`/property/${property?.slug}`} style={{ color: '#E8732F', textDecoration: 'none' }}>View listing</Link>
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                Talking to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{agent?.full_name || property?.agent_name || 'Agent'}</strong>
                {agent?.is_verified_agent && <span style={{ marginLeft: '8px', color: '#88E5A8' }}>✓ Verified agent</span>}
              </p>
            </div>
          </div>
          {closed && (
            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
              This conversation is closed ({statusLabel(c.status)}).
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '32px 5vw 80px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
          <MessageThread
            conversationId={c.id}
            viewerRole="buyer"
            viewerId={user.id}
            initialMessages={messages}
          />
        </div>

        {/* Review prompt — shown only on closed conversations that don't yet have a review */}
        {closed && c.agent_id && (
          <div style={{ maxWidth: '900px', margin: '24px auto 0' }}>
            <LeaveReview
              conversationId={c.id}
              agentId={c.agent_id}
              propertyId={c.property_id}
            />
          </div>
        )}
      </section>
    </>
  )
}

function statusLabel(s: Conversation['status']): string {
  switch (s) {
    case 'closed_rented': return 'rented'
    case 'closed_sold': return 'sold'
    case 'closed_other': return 'closed'
    default: return s
  }
}
