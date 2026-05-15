import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Property } from '@/lib/supabase'
import EditForm from './EditForm'

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin?intent=agent')

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('agent_id', user.id)
    .single()

  if (!data) notFound()
  const p = data as Property

  if (p.status !== 'pending') {
    return (
      <section style={{ minHeight: 'calc(100vh - 64px)', background: '#FAF7F2', padding: '80px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center', background: '#fff', padding: '48px 36px', borderRadius: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 400, marginBottom: '12px' }}>This listing is locked</h2>
          <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.65, marginBottom: '24px' }}>
            Only pending listings can be edited directly. To change a verified listing, WhatsApp our team and we&apos;ll re-verify the changes.
          </p>
          <a href="/agent/dashboard" style={{ background: '#B84A1E', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            Back to Dashboard
          </a>
        </div>
      </section>
    )
  }

  return <EditForm property={p} />
}
