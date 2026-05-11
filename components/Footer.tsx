import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#100E0B', padding: '56px 5vw 28px', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
              Credible<span style={{ color: '#9C9488', fontWeight: 400 }}>State</span>
            </div>
            <p style={{ fontSize: '13px', color: '#9C9488', lineHeight: 1.65, maxWidth: '260px' }}>
              Hyderabad&apos;s most trusted verified property platform. Zero brokerage, 100% verified listings.
            </p>
          </div>

          <div>
            <h4 style={footerHeading}>Browse</h4>
            <Link href="/rent?type=rent" style={footerLink}>Rentals</Link>
            <Link href="/rent?type=sale" style={footerLink}>Buy Property</Link>
            <Link href="/rent?property_type=pg" style={footerLink}>PGs</Link>
            <Link href="/rent?property_type=villa" style={footerLink}>Villas</Link>
          </div>

          <div>
            <h4 style={footerHeading}>Top Localities</h4>
            <Link href="/rent/kondapur" style={footerLink}>Kondapur</Link>
            <Link href="/rent/gachibowli" style={footerLink}>Gachibowli</Link>
            <Link href="/rent/madhapur" style={footerLink}>Madhapur</Link>
            <Link href="/rent/banjara-hills" style={footerLink}>Banjara Hills</Link>
            <Link href="/rent/financial-district" style={footerLink}>Financial District</Link>
          </div>

          <div>
            <h4 style={footerHeading}>For Owners</h4>
            <Link href="/list" style={footerLink}>List Property Free</Link>
            <Link href="/about" style={footerLink}>How Verification Works</Link>
            <Link href="/about" style={footerLink}>Why CredibleState</Link>
          </div>

          <div>
            <h4 style={footerHeading}>Contact</h4>
            <a href="mailto:hello@crediblestate.com" style={footerLink}>hello@crediblestate.com</a>
            <a href="https://wa.me/919876543210" style={footerLink}>WhatsApp Support</a>
            <p style={{ ...footerLink, color: '#4A4238' }}>Hyderabad, Telangana 🇮🇳</p>
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#4A4238' }}>© 2026 CredibleState Technologies. All rights reserved.</p>
          <p style={{ fontSize: '12px', color: '#4A4238' }}>Made with ♥ in Hyderabad</p>
        </div>
      </div>
    </footer>
  )
}

const footerHeading: React.CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#9C9488',
  fontWeight: 600,
  marginBottom: '14px',
}

const footerLink: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.65)',
  textDecoration: 'none',
  marginBottom: '8px',
  lineHeight: 1.6,
}
