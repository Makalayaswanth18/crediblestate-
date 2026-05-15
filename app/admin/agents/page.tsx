import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'
import type { Profile } from '@/lib/supabase'
import { toggleAgentVerification } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminAgentsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/signin?next=/admin/agents')

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')
    .order('is_verified_agent', { ascending: true })
    .order('created_at', { ascending: false })

  const agents = (data as Profile[]) ?? []
  const pending = agents.filter((a) => !a.is_verified_agent)
  const verified = agents.filter((a) => a.is_verified_agent)

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(184,74,30,0.2)', color: '#E8732F', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', display: 'inline-block' }}>
            ADMIN
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Agent <em style={{ color: '#E8732F', fontStyle: 'italic' }}>verification</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            {pending.length} pending KYC · {verified.length} verified
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/admin/pending" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.18)' }}>
              Listings queue
            </Link>
            <Link href="/admin/insights" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.18)' }}>
              Insights
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '32px' }}>
          <AgentGroup title="Pending KYC" agents={pending} />
          <AgentGroup title="Verified agents" agents={verified} />
        </div>
      </section>
    </>
  )
}

function AgentGroup({ title, agents }: { title: string; agents: Profile[] }) {
  if (agents.length === 0) return null
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '14px' }}>
        {title} ({agents.length})
      </h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {agents.map((a) => (
          <div key={a.id} style={{ background: '#fff', padding: '18px 20px', borderRadius: '14px', border: '0.5px solid #DDD7CF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Link href={`/agent/${a.id}`} style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', textDecoration: 'none' }}>
                  {a.full_name || 'Unnamed agent'}
                </Link>
                {a.is_verified_agent && (
                  <span style={{ background: '#EBF5EF', color: '#1E4D35', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>
                    VERIFIED
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#9C9488' }}>
                {a.phone || 'no phone'}
                {' · '}
                joined {new Date(a.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
              {a.agent_kyc_notes && (
                <p style={{ fontSize: '12px', color: '#4A4238', marginTop: '6px', background: '#FAF7F2', padding: '8px 10px', borderRadius: '8px' }}>
                  KYC notes: {a.agent_kyc_notes}
                </p>
              )}
            </div>
            <form action={toggleAgentVerification} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="next" value={a.is_verified_agent ? 'unverify' : 'verify'} />
              <input
                name="notes"
                placeholder="KYC notes (optional)"
                defaultValue={a.agent_kyc_notes ?? ''}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  border: '0.5px solid #DDD7CF',
                  borderRadius: '8px',
                  background: '#FAF7F2',
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: '220px',
                }}
              />
              <button
                style={{
                  background: a.is_verified_agent ? '#fff' : '#1E4D35',
                  color: a.is_verified_agent ? '#991B1B' : '#fff',
                  border: '0.5px solid ' + (a.is_verified_agent ? '#FCA5A5' : '#1E4D35'),
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {a.is_verified_agent ? '✗ Unverify' : '✓ Verify'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
