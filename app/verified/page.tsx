import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What "Verified" Means — CredibleState',
  description: 'Every property on CredibleState is physically inspected before going live. Here is exactly what we check.',
  alternates: { canonical: 'https://www.crediblestate.com/verified' },
}

export default function VerifiedPage() {
  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '80px 5vw 64px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(30,77,53,0.3),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(30,77,53,0.9)', border: '2px solid rgba(39,201,63,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(32px,6vw,56px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            What <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Verified</em> actually means
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto' }}>
            Every property on CredibleState is physically inspected by our team before it appears on the platform. No exceptions. Here is exactly what we check.
          </p>
        </div>
      </section>

      {/* The 4 checks */}
      <section style={{ padding: '80px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={sectionTitle}>Our 4-step verification process</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              {
                step: '1',
                title: 'Submission screening',
                desc: 'When an agent submits a listing, we run automatic sanity checks — price vs. locality benchmarks, photo count, and contact completeness. Incomplete or suspiciously priced submissions are held back before a human ever looks.',
                items: ['Price validated against locality benchmarks', 'Minimum 3 photos required', 'Agent KYC must be approved'],
              },
              {
                step: '2',
                title: 'Physical site visit (within 48 hours)',
                desc: 'A member of our verification team visits the property in person within 48 hours of submission. We photograph the actual space — not photos provided by the agent — and confirm that what was described matches what exists.',
                items: ['Our team photographs the property independently', 'Exterior, interiors, common areas all checked', 'Floor plan and area cross-checked', 'Amenities confirmed (furnishing, parking, gym, etc.)'],
              },
              {
                step: '3',
                title: 'Identity & ownership check',
                desc: "We verify that the person listing the property has the right to do so. For rentals, we check owner or authorized agent identity via Aadhaar. We also confirm that the property isn't already listed elsewhere under a different price.",
                items: ['Aadhaar-based identity verification of owner/agent', 'Ownership documents reviewed', 'Cross-checked for duplicate listings on other platforms', 'Agent license or authority document on file'],
              },
              {
                step: '4',
                title: 'Go live — and stay live only if honest',
                desc: "Once a property passes all three checks, it goes live with the Verified badge. We re-verify randomly and on complaints. Any listing found to misrepresent the property is removed immediately and the agent is permanently banned.",
                items: ['Listed with ✓ VERIFIED badge', 'Random re-verification monthly', 'Instant removal on misrepresentation', 'Permanent agent ban for fraud'],
              },
            ].map(({ step, title, desc, items }) => (
              <div key={step} style={{ background: '#fff', padding: '28px', borderRadius: '16px', border: '0.5px solid #DDD7CF', display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#B84A1E,#E8732F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flex: '0 0 40px' }}>
                    {step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#100E0B', marginBottom: '8px' }}>{title}</h3>
                    <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '6px' }}>
                  {items.map((item) => (
                    <li key={item} style={{ fontSize: '13px', color: '#6B6259', lineHeight: 1.6 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What it means for buyers */}
      <section style={{ background: 'linear-gradient(135deg,#1A120A,#2C1A0E)', padding: '80px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, letterSpacing: '-0.01em', textAlign: 'center', marginBottom: '40px' }}>
            What this means for <em style={{ color: '#E8732F', fontStyle: 'italic' }}>you</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              ['No bait-and-switch', "The property you see is the property that exists. Photos are taken by us, not supplied by the agent."],
              ['No fake availability', "If a listing is live, it is available. Agents are required to notify us when a property is taken."],
              ['No surprise brokerage', "The zero-brokerage guarantee is platform-wide and enforced. Any agent demanding commission should be reported to us immediately."],
              ['Direct contact only', "You contact the verified agent directly through our platform. No broker chains, no middlemen."],
            ].map(([title, desc]) => (
              <div key={title as string} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ fontSize: '20px', marginBottom: '10px' }}>✓</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report a problem */}
      <section style={{ padding: '64px 5vw', background: '#FBF0EB' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚩</div>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '28px', fontWeight: 400, color: '#100E0B', marginBottom: '12px' }}>
            Found something wrong?
          </h2>
          <p style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.7, marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
            If any verified listing misrepresents the property — wrong photos, wrong price, wrong availability — report it to us directly. We investigate within 24 hours.
          </p>
          <a
            href="mailto:hello@crediblestate.com?subject=Report: Inaccurate listing"
            style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
          >
            Report a listing
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 5vw', background: '#FAF7F2', textAlign: 'center', borderTop: '0.5px solid #EEEAE3' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '28px', fontWeight: 400, color: '#100E0B', marginBottom: '24px' }}>
            Ready to find a verified home?
          </h2>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rent" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Browse Verified Properties
            </Link>
            <Link href="/about" style={{ background: '#fff', color: '#100E0B', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', border: '0.5px solid #DDD7CF' }}>
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), serif',
  fontSize: 'clamp(26px,4vw,36px)',
  fontWeight: 400,
  letterSpacing: '-0.01em',
  marginBottom: '28px',
  color: '#100E0B',
  textAlign: 'center',
}
