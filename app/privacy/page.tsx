import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — CredibleState',
  description: 'How CredibleState collects, uses and protects your personal data.',
  alternates: { canonical: 'https://www.crediblestate.com/privacy' },
}

const LAST_UPDATED = '25 May 2026'

export default function PrivacyPage() {
  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '72px 5vw 56px', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            Legal
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(30px,5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: '14px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section style={{ padding: '64px 5vw 96px', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', border: '0.5px solid #DDD7CF', display: 'grid', gap: '36px' }}>

            <Prose>
              CredibleState Technologies (&ldquo;CredibleState&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates
              crediblestate.com (the &ldquo;Platform&rdquo;). This Privacy Policy explains what data we collect,
              how we use it, and your rights as a user. By using the Platform, you
              agree to this policy.
            </Prose>

            <Block title="1. Data we collect">
              <p>We collect the following categories of personal data:</p>
              <ul>
                <li><strong>Account data</strong> — your email address, and optionally your full name and phone number, when you sign up or update your profile.</li>
                <li><strong>Property listings</strong> — the title, photos, location, price and contact details you provide when submitting a listing.</li>
                <li><strong>Inquiry data</strong> — messages, name and phone number you send when contacting an owner about a property.</li>
                <li><strong>Saved searches</strong> — filter preferences you explicitly save for email alert purposes.</li>
                <li><strong>Usage data</strong> — pages visited, search terms entered, and actions taken on the Platform (collected via Vercel Web Analytics if enabled).</li>
                <li><strong>Device data</strong> — IP address, browser type and operating system, for security and fraud prevention.</li>
              </ul>
            </Block>

            <Block title="2. How we use your data">
              <ul>
                <li>To create and manage your account.</li>
                <li>To display your property listings on the Platform.</li>
                <li>To send email alerts when new listings match your saved search filters.</li>
                <li>To facilitate conversations between buyers and property owners.</li>
                <li>To detect and prevent fraud, spam, and abuse.</li>
                <li>To improve search relevance and platform features.</li>
                <li>To comply with legal obligations.</li>
              </ul>
              <p>We do not sell your personal data to third parties. Ever.</p>
            </Block>

            <Block title="3. Phone number privacy">
              <p>
                Your phone number is never displayed publicly on the Platform. Buyers
                can only contact you through the inquiry form or WhatsApp button, which
                uses the number you provided at listing time. We do not share phone
                numbers with marketing companies or brokers.
              </p>
            </Block>

            <Block title="4. Cookies and tracking">
              <p>
                We use strictly necessary cookies to manage your login session
                (via Supabase Auth). We do not use advertising or cross-site tracking
                cookies. If analytics are enabled, they are cookieless and
                privacy-preserving (Vercel Web Analytics or Cloudflare Web Analytics).
              </p>
            </Block>

            <Block title="5. Data sharing">
              <p>We share data only with:</p>
              <ul>
                <li><strong>Supabase</strong> — our database and authentication provider. Data is stored in their EU-region infrastructure.</li>
                <li><strong>Vercel</strong> — our hosting provider. They process server logs and analytics.</li>
                <li><strong>Resend</strong> — our email delivery provider, used only to send transactional emails (magic links, saved-search alerts).</li>
              </ul>
              <p>We may disclose data to law enforcement when required by a valid legal order.</p>
            </Block>

            <Block title="6. Data retention">
              <p>
                We retain your account data for as long as your account is active. If
                you delete your account, we delete your personal data within 30 days,
                except where retention is required by law or needed to resolve open
                disputes. Property listings are kept in an archived state (not publicly
                visible) for 12 months after removal to assist with fraud investigations.
              </p>
            </Block>

            <Block title="7. Your rights">
              <p>Under applicable law you have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Correct inaccurate data.</li>
                <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
                <li>Object to or restrict certain processing.</li>
                <li>Receive a portable copy of your data.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at{' '}
                <a href="mailto:hello@crediblestate.com" style={{ color: '#B84A1E' }}>
                  hello@crediblestate.com
                </a>.
                We respond within 7 business days.
              </p>
            </Block>

            <Block title="8. Security">
              <p>
                All data is transmitted over HTTPS. Database access is protected by
                Row-Level Security (RLS) policies — your data is only readable by you
                and, where necessary, the specific counterparty in a transaction.
                Passwords are never stored; we use magic-link (passwordless) authentication only.
              </p>
            </Block>

            <Block title="9. Children">
              <p>
                The Platform is not intended for users under 18 years of age. We do
                not knowingly collect personal data from minors.
              </p>
            </Block>

            <Block title="10. Changes to this policy">
              <p>
                We may update this policy from time to time. Material changes will be
                communicated by email or a notice on the Platform at least 14 days
                before they take effect. Continued use after the effective date
                constitutes acceptance.
              </p>
            </Block>

            <Block title="11. Contact">
              <p>
                CredibleState Technologies<br />
                Hyderabad, Telangana, India<br />
                <a href="mailto:hello@crediblestate.com" style={{ color: '#B84A1E' }}>
                  hello@crediblestate.com
                </a>
              </p>
            </Block>

            <div style={{ paddingTop: '20px', borderTop: '0.5px solid #EEEAE3', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
              <Link href="/terms" style={{ color: '#B84A1E', fontWeight: 600, textDecoration: 'none' }}>Terms of Service →</Link>
              <Link href="/about" style={{ color: '#9C9488', textDecoration: 'none' }}>About CredibleState</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '20px',
          fontWeight: 400,
          color: '#100E0B',
          marginBottom: '12px',
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.75, display: 'grid', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.75, borderLeft: '3px solid #E8732F', paddingLeft: '16px', background: '#FBF0EB', padding: '14px 16px', borderRadius: '0 10px 10px 0' }}>
      {children}
    </p>
  )
}
