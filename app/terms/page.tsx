import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — CredibleState',
  description: 'Terms governing your use of the CredibleState property platform.',
  alternates: { canonical: 'https://www.crediblestate.com/terms' },
}

const LAST_UPDATED = '25 May 2026'

export default function TermsPage() {
  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '72px 5vw 56px', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            Legal
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(30px,5vw,48px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: '14px' }}>
            Terms of Service
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
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
              crediblestate.com and all related services (collectively, the &ldquo;Platform&rdquo;)
              operated by CredibleState Technologies (&ldquo;CredibleState&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
              By accessing the Platform you agree to be bound by these Terms.
              If you disagree, do not use the Platform.
            </Prose>

            <Block title="1. Eligibility">
              <p>
                You must be at least 18 years old and legally capable of entering
                into contracts under Indian law to use this Platform. By registering,
                you confirm that you meet these requirements.
              </p>
            </Block>

            <Block title="2. The Platform — what we do and don't do">
              <p>
                CredibleState provides a marketplace for verified property listings in
                Hyderabad. We physically verify properties before they appear on the
                Platform, but we are not a party to any rental or sale agreement between
                a property owner and a prospective tenant or buyer.
              </p>
              <p>
                We do not act as a broker, agent, or intermediary in the legal sense.
                We do not hold deposits, execute agreements, or guarantee that any
                transaction will complete. The relationship between owners and renters
                / buyers is entirely between those parties.
              </p>
            </Block>

            <Block title="3. Listing rules">
              <p>If you submit a property listing you warrant that:</p>
              <ul>
                <li>You are the owner of the property or have explicit authorisation from the owner to list it.</li>
                <li>All information provided — price, photos, location, amenities — is accurate and not misleading.</li>
                <li>The property is legally available for rent or sale.</li>
                <li>You will respond to verified inquiries within 48 hours.</li>
                <li>You will notify us promptly when the property is no longer available.</li>
              </ul>
              <p>
                Listings that fail physical verification, contain false information, or
                are associated with fraudulent activity will be removed immediately and
                the account permanently banned.
              </p>
            </Block>

            <Block title="4. Prohibited conduct">
              <p>You may not:</p>
              <ul>
                <li>Submit fake, duplicate, or bait-and-switch listings.</li>
                <li>Charge brokerage or commission fees to buyers or renters through the Platform.</li>
                <li>Scrape, copy, or systematically download Platform content without written permission.</li>
                <li>Use the Platform to spam, harass, or defraud other users.</li>
                <li>Attempt to circumvent our verification process or technical security measures.</li>
                <li>Impersonate any person or entity.</li>
                <li>List properties in jurisdictions outside Hyderabad without prior written approval.</li>
              </ul>
            </Block>

            <Block title="5. Zero-brokerage commitment">
              <p>
                CredibleState is permanently free for renters and buyers. We will never
                charge a brokerage fee to the demand side of a transaction. We currently
                charge no fee to property owners or agents either; if that changes, we will
                provide at least 30 days&apos; notice.
              </p>
            </Block>

            <Block title="6. Content and intellectual property">
              <p>
                You retain ownership of any photos, descriptions, or other content you
                submit. By submitting content, you grant CredibleState a non-exclusive,
                royalty-free, worldwide licence to display, reproduce, and distribute
                that content on the Platform and in marketing materials for as long as the
                listing is live.
              </p>
              <p>
                CredibleState&apos;s brand, logo, design, and Platform code are protected
                by copyright and may not be used without written permission.
              </p>
            </Block>

            <Block title="7. Disclaimer of warranties">
              <p>
                The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any
                warranty, express or implied. While we physically verify every listing,
                we cannot guarantee that property conditions will remain unchanged after
                verification, or that all information provided by owners is accurate.
                Always conduct your own due diligence before entering into any agreement.
              </p>
            </Block>

            <Block title="8. Limitation of liability">
              <p>
                To the maximum extent permitted by applicable law, CredibleState shall
                not be liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the Platform, any transaction
                you enter into as a result of using the Platform, or any dispute between
                users. Our total liability for any claim shall not exceed ₹10,000.
              </p>
            </Block>

            <Block title="9. Indemnification">
              <p>
                You agree to indemnify and hold harmless CredibleState and its founders,
                employees and contractors from any claims, losses, liabilities, and
                expenses (including legal fees) arising from your use of the Platform or
                violation of these Terms.
              </p>
            </Block>

            <Block title="10. Termination">
              <p>
                We may suspend or terminate your access at any time for violation of these
                Terms or for any other reason at our discretion. You may delete your account
                at any time by contacting us. Active listings will be removed within 48 hours
                of account deletion.
              </p>
            </Block>

            <Block title="11. Governing law and disputes">
              <p>
                These Terms are governed by the laws of India. Any dispute arising under
                these Terms shall be subject to the exclusive jurisdiction of the courts
                in Hyderabad, Telangana. We encourage resolving disputes informally first
                by emailing{' '}
                <a href="mailto:hello@crediblestate.com" style={{ color: '#B84A1E' }}>
                  hello@crediblestate.com
                </a>.
              </p>
            </Block>

            <Block title="12. Changes to these Terms">
              <p>
                We may update these Terms. We will notify you of material changes by
                email at least 14 days before they take effect. Continued use of the
                Platform after the effective date constitutes acceptance of the revised Terms.
              </p>
            </Block>

            <Block title="13. Contact">
              <p>
                CredibleState Technologies<br />
                Hyderabad, Telangana, India<br />
                <a href="mailto:hello@crediblestate.com" style={{ color: '#B84A1E' }}>
                  hello@crediblestate.com
                </a>
              </p>
            </Block>

            <div style={{ paddingTop: '20px', borderTop: '0.5px solid #EEEAE3', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
              <Link href="/privacy" style={{ color: '#B84A1E', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy →</Link>
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
