import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

type InquiryWithProperty = {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  created_at: string
  property_id: string
  properties: { title: string; slug: string; locality: string } | null
}

export default async function InquiriesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/agent/login')

  // Get inquiries for properties owned by this agent
  const { data: rows } = await supabase
    .from('inquiries')
    .select('id, name, phone, email, message, created_at, property_id, properties!inner(title, slug, locality)')
    .eq('properties.agent_id', user.id)
    .order('created_at', { ascending: false })

  const inquiries = (rows as unknown as InquiryWithProperty[]) || []

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/agent/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← Back to dashboard</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Your <em style={{ color: '#E8732F', fontStyle: 'italic' }}>inquiries</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            People who contacted you about your listings.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>📭</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>No inquiries yet</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65 }}>
                When someone fills out the contact form on one of your verified listings, you&apos;ll see their details here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {inquiries.map((iq) => (
                <div key={iq.id} style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '0.5px solid #DDD7CF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>{iq.name}</h4>
                      <p style={{ fontSize: '13px', color: '#9C9488' }}>
                        Interested in <Link href={`/property/${iq.properties?.slug}`} style={{ color: '#B84A1E', textDecoration: 'none' }}>{iq.properties?.title}</Link>
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9C9488' }}>
                      {new Date(iq.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  {iq.message && (
                    <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.65, padding: '12px 14px', background: '#FAF7F2', borderRadius: '10px', marginBottom: '12px' }}>
                      &ldquo;{iq.message}&rdquo;
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a href={`tel:${iq.phone}`} style={contactBtn}>📞 {iq.phone}</a>
                    <a href={`https://wa.me/${iq.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ ...contactBtn, background: '#25D366', color: '#fff', borderColor: '#25D366' }}>
                      💬 WhatsApp
                    </a>
                    {iq.email && <a href={`mailto:${iq.email}`} style={contactBtn}>✉️ Email</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

const contactBtn: React.CSSProperties = {
  background: '#fff',
  color: '#100E0B',
  border: '0.5px solid #DDD7CF',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  textDecoration: 'none',
}
