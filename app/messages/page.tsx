import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { Conversation, Property } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Row = Conversation & {
  properties: Pick<Property, 'title' | 'slug' | 'locality' | 'images' | 'agent_name'> | null
}

export default async function MessagesInbox() {
  const user = await getCurrentUser()
  if (!user) redirect('/signin?next=/messages')

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('conversations')
    .select('*, properties(title, slug, locality, images, agent_name)')
    .eq('buyer_id', user.id)
    .order('last_message_at', { ascending: false })

  const rows = (data as unknown as Row[]) ?? []

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/account" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← Back to account</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Your <em style={{ color: '#E8732F', fontStyle: 'italic' }}>messages</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            Conversations with property owners.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>💬</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>No messages yet</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65, marginBottom: '24px' }}>
                Tap &ldquo;Send Message&rdquo; on any property to start a conversation with the owner.
              </p>
              <Link href="/rent" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Browse Properties
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {rows.map((c) => (
                <Link key={c.id} href={`/messages/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#fff', padding: '16px 18px', borderRadius: '14px', border: '0.5px solid #DDD7CF', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', background: '#1A120A', flex: '0 0 56px' }}>
                      {c.properties?.images?.[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.properties.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>🏠</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#100E0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.properties?.title || 'Property'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9C9488', flex: '0 0 auto' }}>
                          {new Date(c.last_message_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#9C9488', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.last_message_preview || 'No messages yet.'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
