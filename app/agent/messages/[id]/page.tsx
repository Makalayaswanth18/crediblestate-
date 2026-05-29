import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUserWithProfile } from '@/lib/supabase-server'
import type { Conversation, Message, Property, Visit } from '@/lib/supabase'
import { formatPrice, buildWaLink } from '@/lib/format'
import MessageThread from '@/components/MessageThread'
import { closeConversation } from '@/app/messages/actions'

export const dynamic = 'force-dynamic'

export default async function AgentThread({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user, profile } = await getCurrentUserWithProfile()
  if (!user) redirect(`/signin?next=/agent/messages/${id}`)

  const supabase = await createSupabaseServerClient()

  const { data: convo } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!convo) notFound()
  const c = convo as Conversation
  if (c.agent_id !== user.id) notFound()

  const [{ data: prop }, { data: msgs }, { data: vs }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, slug, title, locality, price, listing_type, whatsapp, phone')
      .eq('id', c.property_id)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', c.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('visits')
      .select('*')
      .eq('conversation_id', c.id)
      .order('created_at', { ascending: true }),
  ])

  const property = prop as Property | null
  const messages = (msgs as Message[]) ?? []
  const visits = (vs as Visit[]) ?? []
  const closed = c.status !== 'open'

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '32px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/agent/messages" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
            ← {profile?.role === 'owner' ? 'All inquiries' : 'All inquiries'}
          </Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, marginBottom: '6px' }}>
                {c.buyer_name}
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                {c.buyer_phone}
                {c.buyer_email && <> · {c.buyer_email}</>}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
                About <Link href={`/property/${property?.slug}`} style={{ color: '#E8732F', textDecoration: 'none' }}>
                  {property?.title || 'Property'}
                </Link> · {property?.locality} · {property ? formatPrice(Number(property.price)) : ''}
                {property?.listing_type === 'rent' ? '/mo' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={buildWaLink(c.buyer_phone, property?.title || '')}
                target="_blank"
                rel="noopener noreferrer"
                style={pillBtn('#25D366', '#fff')}
              >
                💬 WhatsApp
              </a>
              <a href={`tel:${c.buyer_phone}`} style={pillBtn('rgba(255,255,255,0.1)', '#fff', 'rgba(255,255,255,0.2)')}>
                📞 Call
              </a>
            </div>
          </div>

          {closed && (
            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
              Closed as {c.status.replace('closed_', '')}.
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '32px 5vw 80px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
          <MessageThread
            conversationId={c.id}
            viewerRole="agent"
            viewerId={user.id}
            initialMessages={messages}
            initialVisits={visits}
          />
        </div>

        {!closed && (
          <div style={{ maxWidth: '900px', margin: '20px auto 0', background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '0.5px solid #DDD7CF', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#4A4238' }}>Deal done?</span>
            <form action={async () => { 'use server'; await closeConversation(c.id, property?.listing_type === 'sale' ? 'closed_sold' : 'closed_rented') }}>
              <button style={pillBtn('#1E4D35', '#fff')}>
                ✓ Mark {property?.listing_type === 'sale' ? 'sold' : 'rented'}
              </button>
            </form>
            <form action={async () => { 'use server'; await closeConversation(c.id, 'closed_other') }}>
              <button style={pillBtn('#fff', '#4A4238', '#DDD7CF')}>
                Close conversation
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  )
}

function pillBtn(bg: string, fg: string, border?: string): React.CSSProperties {
  return {
    display: 'inline-block',
    background: bg,
    color: fg,
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    border: border ? `0.5px solid ${border}` : 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }
}
