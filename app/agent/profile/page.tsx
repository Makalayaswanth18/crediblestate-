import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/lib/supabase-server'
import { updateProfile } from '@/app/account/actions'
import { signOut } from '@/app/agent/login/actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Profile — CredibleState',
}

export default async function AgentProfilePage() {
  const { user, profile } = await getCurrentUserWithProfile()
  if (!user) redirect('/signin?intent=agent&next=/agent/profile')
  if (profile?.role !== 'agent') redirect('/account')

  const initials = ((profile?.full_name ?? user.email ?? 'A')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()) || 'A'

  return (
    <>
      {/* Header */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/agent/dashboard" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to dashboard
          </Link>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#B84A1E,#E8732F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '26px', flex: '0 0 72px' }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '6px' }}>
                {profile?.full_name || 'Your profile'}
              </h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {profile?.is_verified_agent ? (
                  <span style={{ background: 'rgba(30,77,53,0.9)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
                    ✓ VERIFIED AGENT
                  </span>
                ) : (
                  <span style={{ background: 'rgba(245,166,35,0.2)', color: '#F5A623', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: '0.5px solid rgba(245,166,35,0.4)' }}>
                    KYC PENDING
                  </span>
                )}
                <Link
                  href={`/agent/${user.id}`}
                  target="_blank"
                  style={{ fontSize: '12px', color: '#E8732F', textDecoration: 'none', fontWeight: 500 }}
                >
                  View public profile ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '24px' }}>

          {/* Edit form */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: '0.5px solid #DDD7CF' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '20px' }}>
              Edit your profile
            </h2>
            <form action={updateProfile} style={{ display: 'grid', gap: '16px' }}>
              <Field label="Full name">
                <input
                  name="full_name"
                  defaultValue={profile?.full_name ?? ''}
                  placeholder="Ramesh Kumar"
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone number">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ''}
                  placeholder="+919876543210"
                  style={inputStyle}
                />
                <span style={{ fontSize: '11px', color: '#9C9488', marginTop: '4px', display: 'block' }}>
                  Used for WhatsApp contact from buyers. Not shown publicly.
                </span>
              </Field>

              <Field label="Bio (shown on your public profile)">
                <textarea
                  name="bio"
                  defaultValue={profile?.bio ?? ''}
                  placeholder="Tell buyers about yourself — your area speciality, years of experience, what makes you different..."
                  rows={4}
                  maxLength={600}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <span style={{ fontSize: '11px', color: '#9C9488', marginTop: '4px', display: 'block' }}>
                  Max 600 characters. Appears on your public agent profile page.
                </span>
              </Field>

              <div>
                <button
                  type="submit"
                  style={{
                    background: '#100E0B',
                    color: '#fff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>

          {/* KYC status */}
          <div style={{ background: profile?.is_verified_agent ? '#EBF5EF' : '#FBF0EB', padding: '20px 24px', borderRadius: '14px', border: `0.5px solid ${profile?.is_verified_agent ? '#B8DBC6' : '#F5C9A0'}` }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '28px', flex: '0 0 auto' }}>
                {profile?.is_verified_agent ? '✅' : '⏳'}
              </span>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: profile?.is_verified_agent ? '#1E4D35' : '#92400E', marginBottom: '4px' }}>
                  {profile?.is_verified_agent ? 'KYC verified' : 'KYC verification pending'}
                </h3>
                <p style={{ fontSize: '13px', color: profile?.is_verified_agent ? '#1E4D35' : '#92400E', lineHeight: 1.6 }}>
                  {profile?.is_verified_agent
                    ? `Verified on ${profile.agent_verified_at ? new Date(profile.agent_verified_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'an earlier date'}. Your listings display the ✓ KYC badge.`
                    : 'Our team will contact you within 48 hours to complete identity verification. After that, your listings will show the ✓ KYC badge.'}
                </p>
                {profile?.agent_kyc_notes && (
                  <p style={{ fontSize: '12px', color: '#92400E', marginTop: '8px', background: 'rgba(0,0,0,0.04)', padding: '8px 10px', borderRadius: '8px' }}>
                    Note from admin: {profile.agent_kyc_notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: '#fff', padding: '20px 24px', borderRadius: '14px', border: '0.5px solid #DDD7CF' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#9C9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              Quick links
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/agent/dashboard" style={quickLink}>📊 Dashboard</Link>
              <Link href="/agent/messages" style={quickLink}>💬 Inquiries</Link>
              <Link href="/list" style={quickLink}>+ New listing</Link>
              <Link href={`/agent/${user.id}`} target="_blank" style={quickLink}>👁️ Public profile</Link>
            </div>
          </div>

          {/* Sign out */}
          <form action={async () => { 'use server'; await signOut(); redirect('/') }}>
            <button style={{ background: 'none', border: 'none', color: '#9C9488', fontSize: '13px', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Sign out
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238' }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  fontSize: '14px',
  border: '0.5px solid #DDD7CF',
  borderRadius: '9px',
  background: '#FAF7F2',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#100E0B',
  boxSizing: 'border-box',
}

const quickLink: React.CSSProperties = {
  background: '#FAF7F2',
  color: '#100E0B',
  padding: '9px 16px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 500,
  textDecoration: 'none',
  border: '0.5px solid #DDD7CF',
}
