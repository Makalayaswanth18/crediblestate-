// app/page.tsx — CredibleState production homepage
// Hyderabad's verified property platform

export const revalidate = 60

function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(1)} Cr`
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

function buildWaLink(phone: string | null | undefined, propertyTitle: string): string {
  const cleanPhone = (phone || '919876543210').replace(/[^0-9]/g, '')
  const message = `Hi, I saw your property "${propertyTitle}" on CredibleState. Is it still available? I would like to schedule a visit.`
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

type Property = {
  id: string
  slug?: string
  title: string
  locality: string
  city: string
  price: number
  area_sqft?: number
  bedrooms?: number
  has_parking?: boolean
  is_gated?: boolean
  property_type?: string
  listing_type?: string
  whatsapp?: string
  phone?: string
}

export default function HomePage() {
  const properties: Property[] = []

  return (
    <main style={{ margin: 0, padding: 0, fontFamily: '"Inter", system-ui, sans-serif', background: '#FAF7F2', color: '#100E0B' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', background: 'rgba(26,18,10,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw' }}>
        <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '22px', color: '#fff', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Credible<span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>State</span>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Agent Login</a>
          <a href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '9px 22px', borderRadius: '24px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>List Property Free</a>
        </div>
      </nav>

      <section style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1A120A 0%,#2C1A0E 40%,#0E2218 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 5vw 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(184,74,30,0.25),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(30,77,53,0.2),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', padding: '7px 18px', borderRadius: '24px', fontSize: '12px', fontWeight: 500, marginBottom: '28px', position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', background: '#27C93F', borderRadius: '50%', boxShadow: '0 0 8px rgba(39,201,63,0.6)' }} />
          Hyderabad&apos;s #1 Verified Property Platform
        </div>

        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(38px,7vw,76px)', color: '#fff', fontWeight: 400, lineHeight: 1.05, marginBottom: '20px', maxWidth: '900px', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Find Your <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Perfect Home</em><br />in Hyderabad
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', maxWidth: '540px', marginBottom: '44px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Verified PGs, flats and villas — direct from owners.<br />
          <strong style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>Zero brokerage. Zero fake listings. Ever.</strong>
        </p>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '600px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
          <input placeholder="Try: 2BHK Kondapur under 20k" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#100E0B', background: 'transparent', padding: '12px 0', minWidth: 0 }} />
          <button style={{ background: '#B84A1E', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </div>

        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[
            ['Launching', 'Verified Listings'],
            ['₹0', 'Brokerage Fee'],
            ['48h', 'Avg Move-in'],
            ['100%', 'Verified'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontFamily: '"Playfair Display", serif', fontSize: '32px', color: '#fff', fontWeight: 400, lineHeight: 1 }}>{num}</strong>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginTop: '6px', display: 'block' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '96px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ background: '#FBF0EB', color: '#B84A1E', padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block' }}>Live Listings</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(30px,5vw,48px)', color: '#100E0B', fontWeight: 400, margin: '18px 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Verified Properties <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Near You</em>
            </h2>
            <p style={{ color: '#9C9488', fontSize: '15px' }}>
              {properties.length > 0 ? `${properties.length} verified listings live right now` : 'Onboarding verified agents — listings coming soon'}
            </p>
          </div>

          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.6 }}>🏠</div>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '10px' }}>Real Listings Coming Soon</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65, marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px' }}>
                We are personally verifying properties with real agents in Hyderabad. Every listing will be 100% real and verified.
              </p>
              <a href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Are you an Agent? List Free</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
              {properties.map((p) => (
                <article key={p.id} style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid #DDD7CF', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ height: '200px', background: 'linear-gradient(135deg,#1A120A,#2C1A0E)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '56px', opacity: 0.22 }}>{p.property_type === 'villa' ? '🏡' : '🏢'}</span>
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(30,77,53,0.92)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>✓ VERIFIED</div>
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: p.listing_type === 'rent' ? 'rgba(184,74,30,0.92)' : 'rgba(30,77,53,0.92)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>{p.listing_type === 'rent' ? 'RENT' : 'SALE'}</div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 14px', background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }}>
                      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: '#fff', fontWeight: 400 }}>
                        {formatPrice(Number(p.price))}{p.listing_type === 'rent' && <span style={{ fontSize: '12px', opacity: 0.7 }}>/mo</span>}
                      </div>
                      {p.area_sqft && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{p.area_sqft} sqft</div>}
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', marginBottom: '5px', lineHeight: 1.3 }}>{p.title}</h3>
                    <p style={{ fontSize: '12px', color: '#9C9488', marginBottom: '12px' }}>📍 {p.locality}, {p.city}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {p.bedrooms && <span style={{ background: '#F0EBE3', color: '#4A4238', padding: '3px 10px', borderRadius: '6px', fontSize: '11px' }}>{p.bedrooms} BHK</span>}
                      {p.has_parking && <span style={{ background: '#F0EBE3', color: '#4A4238', padding: '3px 10px', borderRadius: '6px', fontSize: '11px' }}>Parking</span>}
                      {p.is_gated && <span style={{ background: '#EBF5EF', color: '#1E4D35', padding: '3px 10px', borderRadius: '6px', fontSize: '11px' }}>Gated</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={`/property/${p.slug || p.id}`} style={{ flex: 1, background: '#F0EBE3', color: '#B84A1E', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View Details</a>
                      <a href={buildWaLink(p.whatsapp || p.phone, p.title)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>💬 WhatsApp</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg,#1A120A,#2C1A0E,#0E2218)', padding: '96px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', border: '0.5px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>Why CredibleState</span>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(30px,5vw,48px)', color: '#fff', fontWeight: 400, margin: '18px 0', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Built on Trust. <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Backed by Verification.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
            {[
              ['✅', '100% Verified', 'Every property physically inspected before going live. No fakes. Ever.'],
              ['₹', 'Zero Brokerage', 'Direct owner contact. Save up to ₹1 lakh per deal in Hyderabad.'],
              ['🔒', 'Safe & Private', 'Phone numbers never shared. Zero spam calls guaranteed.'],
              ['🤖', 'AI Search', 'Search in Telugu, Hindi or English. Our AI understands your language.'],
              ['⭐', 'Verified Agents', 'Only 4+ star rated agents can list. Always deal with the best.'],
              ['📄', 'Digital Agreement', 'E-stamp, e-sign, police verification — all in one place instantly.'],
            ].map(([icon, title, desc]) => (
              <div key={title as string} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px 24px' }}>
                <div style={{ fontSize: '30px', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#B84A1E', padding: '80px 5vw', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px,5vw,48px)', color: '#fff', fontWeight: 400, marginBottom: '14px', lineHeight: 1.1 }}>
            Your Perfect Home is <em style={{ fontStyle: 'italic' }}>One Search Away</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '36px', fontSize: '15px', lineHeight: 1.65 }}>
            Join Hyderabad&apos;s most trusted verified property platform. Zero brokerage, always.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/rent" style={{ background: '#fff', color: '#B84A1E', padding: '14px 32px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Browse Properties</a>
            <a href="/list" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '12px 30px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>List Your Property Free</a>
          </div>
        </div>
      </section>

      <footer style={{ background: '#100E0B', padding: '56px 5vw 28px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', color: '#fff', fontWeight: 700, marginBottom: '10px' }}>
              Credible<span style={{ color: '#9C9488', fontWeight: 400 }}>State</span>
            </div>
            <p style={{ fontSize: '13px', color: '#9C9488', maxWidth: '400px', margin: '0 auto', lineHeight: 1.65 }}>
              Hyderabad&apos;s most trusted verified property platform. Zero brokerage, 100% verified listings.
            </p>
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#4A4238' }}>© 2026 CredibleState Technologies. All rights reserved.</p>
            <p style={{ fontSize: '12px', color: '#4A4238' }}>Made with ♥ in Hyderabad 🇮🇳</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
