import Link from 'next/link'

export const metadata = {
  title: 'About — CredibleState',
  description: 'How CredibleState verifies every property in Hyderabad. Zero brokerage, zero fakes.',
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '100px 5vw', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-50px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(184,74,30,0.15),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            Our Story
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(36px,6vw,60px)', fontWeight: 400, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            We&apos;re fixing what&apos;s <em style={{ color: '#E8732F', fontStyle: 'italic' }}>broken</em> about renting in Hyderabad
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>
            Fake listings. Hidden brokerage. Spam calls. We started CredibleState because finding a home shouldn&apos;t feel like getting scammed.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section style={{ padding: '96px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={sectionTitle}>The problem we&apos;re solving</h2>
          <div style={{ fontSize: '17px', color: '#4A4238', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '20px' }}>
              If you&apos;ve ever looked for a house in Hyderabad, you know the drill. You see a great listing online — call the number — &ldquo;Sir, that one is rented, but I have another...&rdquo; The bait-and-switch starts. You visit 5 properties. None match the photos. The broker demands one month&apos;s rent as commission.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Our founders went through this 14 times across Kondapur, Madhapur, and Gachibowli before settling. We lost <strong>three weekends</strong> and <strong>₹40,000</strong> in brokerage. The listings we trusted were lies. The brokers added zero value.
            </p>
            <p>
              CredibleState exists so that nobody else has to go through that. <strong style={{ color: '#100E0B' }}>Every property on this platform is physically verified by us. No exceptions.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* How verification works */}
      <section style={{ background: 'linear-gradient(135deg,#1A120A,#2C1A0E,#0E2218)', padding: '96px 5vw', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', border: '0.5px solid rgba(255,255,255,0.15)', display: 'inline-block', marginBottom: '18px' }}>
              How Verification Works
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(30px,5vw,42px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Every listing goes through <em style={{ color: '#E8732F', fontStyle: 'italic' }}>4 checks</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              ['1', 'Submission', 'Owner or agent submits property details through our /list form. Auto-screened for completeness and pricing sanity.'],
              ['2', 'Physical visit', 'Our verification team visits within 48 hours. We photograph the actual property, check title documents, meet the owner.'],
              ['3', 'Identity check', 'We verify the owner / agent identity via Aadhaar and confirm they have the right to rent or sell.'],
              ['4', 'Go live', 'Only verified listings appear on CredibleState. We re-verify monthly. Any false claims and the listing is removed permanently.'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px 24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#B84A1E,#E8732F)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
                  {num}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our promises */}
      <section style={{ padding: '96px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={sectionTitle}>Our promises to you</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              ['🛡️', 'Zero brokerage. Forever.', 'We don&apos;t charge renters a single rupee. Owners pay nothing too. We make money through optional value-added services like digital agreements and police verification.'],
              ['📵', 'Your phone stays private.', 'We never share your phone number with brokers, marketers, or anyone else. WhatsApp inquiries route through our system — owners only see verified leads.'],
              ['📸', 'Real photos or no listing.', 'If the photos don&apos;t match the property, the listing is removed and the agent is permanently banned.'],
              ['⚡', '48-hour move-in promise.', 'For rentals — once you&apos;ve picked a property, we help you complete agreement, deposit, and key handover in 48 hours.'],
              ['🚫', 'No dark patterns.', 'No bait-and-switch listings. No fake urgency. No fake reviews. No surprise charges. Ever.'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '0.5px solid #DDD7CF', display: 'flex', gap: '16px', alignItems: 'start' }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#100E0B', marginBottom: '6px' }}>{title}</h3>
                  <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: desc }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section style={{ padding: '80px 5vw', background: '#fff', borderTop: '0.5px solid #EEEAE3' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>“</div>
          <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', lineHeight: 1.5, color: '#100E0B', fontWeight: 400, marginBottom: '24px', fontStyle: 'italic' }}>
            We&apos;re building the property platform we wished existed when we were apartment-hunting in Hyderabad. If you ever feel CredibleState is sliding back toward old broker-style behavior, email me directly. I read every message.
          </p>
          <div style={{ fontSize: '15px', color: '#4A4238' }}>
            — <strong style={{ color: '#100E0B' }}>Yaswanth</strong>, Founder
          </div>
          <a href="mailto:hello@crediblestate.com" style={{ fontSize: '13px', color: '#B84A1E', textDecoration: 'none' }}>
            hello@crediblestate.com
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#B84A1E', padding: '72px 5vw', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,5vw,40px)', color: '#fff', fontWeight: 400, marginBottom: '14px', lineHeight: 1.1 }}>
            Ready to find your next home?
          </h2>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '28px' }}>
            <Link href="/rent" style={{ background: '#fff', color: '#B84A1E', padding: '14px 32px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Browse Verified Properties
            </Link>
            <Link href="/list" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '12px 30px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              List Your Property Free
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), serif',
  fontSize: 'clamp(28px,4vw,38px)',
  fontWeight: 400,
  letterSpacing: '-0.01em',
  marginBottom: '32px',
  color: '#100E0B',
  textAlign: 'center',
}
