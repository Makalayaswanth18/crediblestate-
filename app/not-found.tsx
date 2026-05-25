import Link from 'next/link'

export const metadata = {
  title: '404 — Page not found · CredibleState',
}

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(160deg,#1A120A 0%,#2C1A0E 50%,#0E2218 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 5vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-120px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(184,74,30,0.2),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '350px', height: '350px', background: 'radial-gradient(circle,rgba(30,77,53,0.15),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', maxWidth: '540px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(96px,20vw,160px)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.06)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginBottom: '-20px',
            userSelect: 'none',
          }}
        >
          404
        </div>

        <div style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '40px 36px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>

          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(24px,5vw,36px)',
              fontWeight: 400,
              color: '#fff',
              marginBottom: '12px',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            This home doesn&apos;t exist
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.65, marginBottom: '32px' }}>
            The page you&apos;re looking for may have been removed, renamed,
            or the listing may no longer be available.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/rent"
              style={{
                background: '#B84A1E',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: '11px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Browse Properties
            </Link>
            <Link
              href="/"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: '11px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
                border: '0.5px solid rgba(255,255,255,0.2)',
              }}
            >
              Go Home
            </Link>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['/rent/kondapur', 'Kondapur'],
              ['/rent/gachibowli', 'Gachibowli'],
              ['/rent/madhapur', 'Madhapur'],
              ['/rent/banjara-hills', 'Banjara Hills'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 500 }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
