import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Inlined helpers so we don't bring in a date lib for ~6 lines of date math.
function daysAgoISO(n: number): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString()
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: string,
  filters: Array<[string, string, unknown]> = [],
): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  for (const [col, op, val] of filters) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    q = (q as any)[op](col, val)
  }
  const { count } = await q
  return count ?? 0
}

export default async function InsightsPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/signin?next=/admin/insights')

  const supabase = await createSupabaseServerClient()
  const since7 = daysAgoISO(7)
  const since30 = daysAgoISO(30)

  // Counts — kept as plain rpcs/selects, no joins
  const [
    profilesTotal, profilesBuyers, profilesAgents, agentsVerified,
    profiles7,
    listingsTotal, listingsVerified, listingsPending,
    listings7,
    convosTotal, convosOpen, convosRented, convosSold,
    convos7,
    messages7,
    reviewsTotal,
    savedSearchesTotal, savedSearchesAlerts,
  ] = await Promise.all([
    countRows(supabase, 'profiles'),
    countRows(supabase, 'profiles', [['role', 'eq', 'buyer']]),
    countRows(supabase, 'profiles', [['role', 'eq', 'agent']]),
    countRows(supabase, 'profiles', [['is_verified_agent', 'eq', true]]),
    countRows(supabase, 'profiles', [['created_at', 'gte', since7]]),
    countRows(supabase, 'properties'),
    countRows(supabase, 'properties', [['status', 'eq', 'verified']]),
    countRows(supabase, 'properties', [['status', 'eq', 'pending']]),
    countRows(supabase, 'properties', [['created_at', 'gte', since7]]),
    countRows(supabase, 'conversations'),
    countRows(supabase, 'conversations', [['status', 'eq', 'open']]),
    countRows(supabase, 'conversations', [['status', 'eq', 'closed_rented']]),
    countRows(supabase, 'conversations', [['status', 'eq', 'closed_sold']]),
    countRows(supabase, 'conversations', [['created_at', 'gte', since7]]),
    countRows(supabase, 'messages', [['created_at', 'gte', since7]]),
    countRows(supabase, 'reviews'),
    countRows(supabase, 'saved_searches'),
    countRows(supabase, 'saved_searches', [['email_alerts', 'eq', true]]),
  ])

  // Top localities (by verified listings)
  const { data: localityRows } = await supabase
    .from('properties')
    .select('locality')
    .eq('status', 'verified')
  const localityCounts = new Map<string, number>()
  for (const r of (localityRows as { locality: string }[] | null) ?? []) {
    localityCounts.set(r.locality, (localityCounts.get(r.locality) ?? 0) + 1)
  }
  const topLocalities = [...localityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Recent activity feed — last 10 things that happened
  const [{ data: latestConvs }, { data: latestProps }] = await Promise.all([
    supabase.from('conversations').select('id, buyer_name, created_at, status').order('created_at', { ascending: false }).limit(5),
    supabase.from('properties').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  // Funnel rates
  const inquiriesPerListing = listingsVerified > 0 ? (convosTotal / listingsVerified).toFixed(2) : '0'
  const closeRate = convosTotal > 0 ? Math.round(((convosRented + convosSold) / convosTotal) * 100) : 0
  const reviewRate = (convosRented + convosSold) > 0
    ? Math.round((reviewsTotal / (convosRented + convosSold)) * 100)
    : 0
  const approvalRate = (listingsVerified + listingsPending) > 0
    ? Math.round((listingsVerified / (listingsVerified + listingsPending)) * 100)
    : 0

  // 30-day buyer-acquisition trend (per-day counts, naive client-side bucketing)
  const { data: signups30 } = await supabase
    .from('profiles')
    .select('created_at, role')
    .gte('created_at', since30)
    .order('created_at', { ascending: true })

  const dayBuckets = new Map<string, { buyer: number; agent: number }>()
  for (const r of (signups30 as { created_at: string; role: 'buyer' | 'agent' }[] | null) ?? []) {
    const k = r.created_at.slice(0, 10)
    const b = dayBuckets.get(k) ?? { buyer: 0, agent: 0 }
    b[r.role] += 1
    dayBuckets.set(k, b)
  }
  const trendDays = [...dayBuckets.entries()].sort()
  const trendMax = Math.max(1, ...trendDays.map(([, v]) => v.buyer + v.agent))

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(184,74,30,0.2)', color: '#E8732F', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', display: 'inline-block' }}>
            ADMIN
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginTop: '12px', letterSpacing: '-0.01em' }}>
            Business <em style={{ color: '#E8732F', fontStyle: 'italic' }}>insights</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            Funnel pulled live from Supabase. For raw page-view analytics, wire up Cloudflare Web Analytics (free) or Vercel Web Analytics — both run client-side and don&apos;t add Supabase egress.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/admin/pending" style={tabLink}>Listings queue</Link>
            <Link href="/admin/agents" style={tabLink}>Agent verification</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '32px' }}>

          {/* Headline KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Kpi label="Users (total)" value={profilesTotal} sub={`${profilesBuyers} buyers · ${profilesAgents} agents`} />
            <Kpi label="New users (7d)" value={profiles7} sub="signups across both roles" />
            <Kpi label="Live listings" value={listingsVerified} sub={`${listingsPending} pending · ${listings7} new this week`} />
            <Kpi label="Conversations" value={convosTotal} sub={`${convosOpen} open · ${convos7} new this week`} />
          </div>

          {/* Funnel */}
          <Card title="The funnel">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <FunnelStep label="Verified listings" value={listingsVerified} note={`Approval rate ${approvalRate}%`} />
              <FunnelStep label="Inquiries / listing" value={inquiriesPerListing} note={`${convosTotal} total threads`} />
              <FunnelStep label="Close rate" value={`${closeRate}%`} note={`${convosRented} rented, ${convosSold} sold`} />
              <FunnelStep label="Review rate" value={`${reviewRate}%`} note={`${reviewsTotal} of ${convosRented + convosSold} closed deals reviewed`} />
            </div>
          </Card>

          {/* Signup trend chart */}
          <Card title="Signups (last 30 days)">
            {trendDays.length === 0 ? (
              <p style={{ color: '#9C9488', fontSize: '14px' }}>No signups yet.</p>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', borderBottom: '1px solid #EEEAE3', padding: '0 0 4px' }}>
                  {trendDays.map(([day, v]) => {
                    const total = v.buyer + v.agent
                    const buyerH = (v.buyer / trendMax) * 100
                    const agentH = (v.agent / trendMax) * 100
                    return (
                      <div key={day} title={`${day}: ${v.buyer} buyers, ${v.agent} agents`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: '6px' }}>
                        {v.agent > 0 && <div style={{ height: `${agentH}%`, background: '#1E4D35' }} />}
                        {v.buyer > 0 && <div style={{ height: `${buyerH}%`, background: '#B84A1E' }} />}
                        {total === 0 && <div style={{ height: '2px', background: '#EEEAE3' }} />}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#9C9488' }}>
                  <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#B84A1E', marginRight: '4px', verticalAlign: 'middle' }} />Buyers</span>
                  <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#1E4D35', marginRight: '4px', verticalAlign: 'middle' }} />Agents</span>
                  <span style={{ marginLeft: 'auto' }}>{trendDays[0]?.[0]} → {trendDays[trendDays.length - 1]?.[0]}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Two-col: localities + activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Card title="Top localities (live listings)">
              {topLocalities.length === 0 ? (
                <p style={{ color: '#9C9488', fontSize: '14px' }}>No verified listings yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '6px' }}>
                  {topLocalities.map(([loc, n]) => {
                    const pct = Math.round((n / topLocalities[0][1]) * 100)
                    return (
                      <div key={loc} style={{ position: 'relative', padding: '8px 12px', borderRadius: '8px', overflow: 'hidden', background: '#FAF7F2' }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'rgba(184,74,30,0.12)' }} />
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>{loc}</span>
                          <span style={{ color: '#9C9488', fontWeight: 600 }}>{n}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Recent activity">
              <div style={{ display: 'grid', gap: '8px' }}>
                {(latestConvs ?? []).map((c: { id: string; buyer_name: string; created_at: string; status: string }) => (
                  <ActivityRow
                    key={`c-${c.id}`}
                    icon="💬"
                    text={`${c.buyer_name} started a conversation (${c.status.replace('closed_', '')})`}
                    at={c.created_at}
                  />
                ))}
                {(latestProps ?? []).map((p: { id: string; title: string; status: string; created_at: string }) => (
                  <ActivityRow
                    key={`p-${p.id}`}
                    icon={p.status === 'verified' ? '✓' : p.status === 'pending' ? '⏳' : '🏠'}
                    text={`Listing "${p.title}" — ${p.status}`}
                    at={p.created_at}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Engagement */}
          <Card title="Engagement (last 7 days)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <MiniStat label="Messages sent" value={messages7} />
              <MiniStat label="Saved searches" value={savedSearchesTotal} sub={`${savedSearchesAlerts} with alerts on`} />
              <MiniStat label="Verified agents" value={agentsVerified} sub={`${profilesAgents - agentsVerified} pending KYC`} />
              <MiniStat label="Reviews" value={reviewsTotal} sub={`${reviewRate}% of closed deals`} />
            </div>
          </Card>

          {/* Capacity */}
          <Card title="Free-tier headroom">
            <p style={{ fontSize: '13px', color: '#4A4238', lineHeight: 1.6, marginBottom: '10px' }}>
              Rough estimate of where you are against Supabase &amp; Vercel free limits. These are derived from your data volume, not from the providers&apos; APIs — for the real numbers check the Supabase and Vercel dashboards directly.
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              <CapacityBar label="DB rows used" used={profilesTotal + listingsTotal + convosTotal + messages7 + reviewsTotal} limit={50000} unit="rows" hint="Supabase free includes 500 MB; rows is a rough proxy." />
              <CapacityBar label="Auth users" used={profilesTotal} limit={50000} unit="users" hint="Supabase free MAU limit." />
              <CapacityBar label="Verified listings (storage proxy)" used={listingsVerified} limit={1000} unit="listings" hint="Each listing ~5–10 images. Image egress is the first thing to bite." />
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, color: '#100E0B', marginBottom: '14px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Kpi({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: '#fff', padding: '16px 18px', borderRadius: '14px', border: '0.5px solid #DDD7CF' }}>
      <div style={{ fontSize: '11px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', color: '#100E0B', marginTop: '4px' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#9C9488', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function FunnelStep({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div style={{ background: '#FAF7F2', padding: '14px 16px', borderRadius: '12px' }}>
      <div style={{ fontSize: '11px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', color: '#B84A1E', marginTop: '4px' }}>{value}</div>
      {note && <div style={{ fontSize: '11px', color: '#9C9488', marginTop: '2px' }}>{note}</div>}
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#100E0B', marginTop: '4px' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: '#9C9488', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function ActivityRow({ icon, text, at }: { icon: string; text: string; at: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#FAF7F2', borderRadius: '8px', fontSize: '13px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4A4238' }}>{text}</span>
      <span style={{ fontSize: '11px', color: '#9C9488' }}>
        {new Date(at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
      </span>
    </div>
  )
}

function CapacityBar({ label, used, limit, unit, hint }: { label: string; used: number; limit: number; unit: string; hint?: string }) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const color = pct < 50 ? '#1E4D35' : pct < 80 ? '#E8732F' : '#991B1B'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4A4238', marginBottom: '4px' }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span>{used.toLocaleString('en-IN')} / {limit.toLocaleString('en-IN')} {unit} · {pct}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#FAF7F2', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
      {hint && <div style={{ fontSize: '11px', color: '#9C9488', marginTop: '4px' }}>{hint}</div>}
    </div>
  )
}

const tabLink: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  textDecoration: 'none',
  border: '0.5px solid rgba(255,255,255,0.18)',
}
