import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { Conversation, Property } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Row = Conversation & {
  properties: Pick<Property, 'title' | 'slug' | 'locality'> | null
}

export default async function AgentInbox() {
  const user = await getCurrentUser()
  if (!user) redirect('/signin?intent=agent&next=/agent/messages')

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('conversations')
    .select('*, properties(title, slug, locality)')
    .eq('agent_id', user.id)
    .order('last_message_at', { ascending: false })

  const rows = (data as unknown as Row[]) ?? []
  const open = rows.filter((r) => r.status === 'open')
  const closed = rows.filter((r) => r.status !== 'open')

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/agent/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← Back to dashboard</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Inquiries &amp; <em style={{ color: '#E8732F', fontStyle: 'italic' }}>conversations</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            {open.length} open · {closed.length} closed
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>📭</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>No inquiries yet</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65 }}>
                When someone messages you about a verified listing, the thread will appear here.
              </p>
            </div>
          ) : (
            <>
              <ThreadGroup title={`Open (${open.length})`} rows={open} />
              {closed.length > 0 && <ThreadGroup title={`Closed (${closed.length})`} rows={closed} />}
            </>
          )}
        </div>
      </section>
    </>
  )
}

function ThreadGroup({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return null
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>{title}</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {rows.map((c) => (
          <Link key={c.id} href={`/agent/messages/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#fff', padding: '16px 18px', borderRadius: '14px', border: '0.5px solid #DDD7CF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#100E0B' }}>{c.buyer_name}</p>
                  <p style={{ fontSize: '12px', color: '#9C9488' }}>{c.buyer_phone}{c.buyer_email ? ` · ${c.buyer_email}` : ''}</p>
                </div>
                <span style={{ fontSize: '11px', color: '#9C9488', flex: '0 0 auto' }}>
                  {new Date(c.last_message_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#4A4238', marginTop: '6px' }}>
                About <span style={{ color: '#B84A1E' }}>{c.properties?.title || 'Property'}</span> in {c.properties?.locality}
              </p>
              {c.last_message_preview && (
                <p style={{ fontSize: '13px', color: '#4A4238', marginTop: '6px', padding: '8px 12px', background: '#FAF7F2', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  &ldquo;{c.last_message_preview}&rdquo;
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
