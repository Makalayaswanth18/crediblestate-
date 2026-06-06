import Link from 'next/link'
import { supabase, type Property } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 300 // 5 min — homepage doesn't need to be ultra-fresh

export default async function HomePage() {
  let properties: Property[] = []
  let totalCount = 0
  try {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from('properties')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified'),
    ])
    properties = (data as Property[]) || []
    totalCount = count ?? 0
  } catch {
    properties = []
  }

  return (
    <>
      {/* HERO */}
      <section
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(160deg,#1A120A 0%,#2C1A0E 40%,#0E2218 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 5vw',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-200px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(184,74,30,0.25),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(30,77,53,0.2),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', padding: '7px 18px', borderRadius: '24px', fontSize: '12px', fontWeight: 500, marginBottom: '28px', position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', background: '#27C93F', borderRadius: '50%', boxShadow: '0 0 8px rgba(39,201,63,0.6)' }} />
          Hyderabad&apos;s #1 Verified Property Platform
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(38px,7vw,76px)', color: '#fff', fontWeight: 400, lineHeight: 1.05, marginBottom: '20px', maxWidth: '900px', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Find Your <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Perfect Home</em><br />in Hyderabad
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', maxWidth: '540px', marginBottom: '44px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Verified PGs, flats and villas — direct from owners.<br />
          <strong style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>Zero brokerage. Zero fake listings. Ever.</strong>
        </p>

        <form
          action="/rent"
          style={{ background: '#fff', borderRadius: '16px', padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '600px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', marginBottom: '48px', position: 'relative', zIndex: 1 }}
        >
          <input
            name="q"
            placeholder="Try: 2BHK Kondapur under 20k"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#100E0B', background: 'transparent', padding: '12px 0', minWidth: 0 }}
          />
          <button type="submit" style={{ background: '#B84A1E', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Search
          </button>
        </form>

        {/* Quick locality chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1, marginBottom: '16px' }}>
          {['Kondapur', 'Gachibowli', 'Madhapur', 'Banjara Hills', 'Financial District', 'Miyapur'].map((loc) => (
            <a
              key={loc}
              href={`/rent/${loc.toLowerCase().replace(/ /g, '-')}`}
              style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
            >
              {loc}
            </a>
          ))}
        </div>

        {/* Property type quick-links — each goes to a hub page showing counts per area */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1, marginBottom: '40px' }}>
          {[
            ['🏢', 'Flats by area', '/flats'],
            ['🛏️', 'PGs by area', '/pg'],
            ['🏡', 'Villas by area', '/villas'],
            ['🏬', 'Commercial', '/commercial'],
            ['🌳', 'Plots', '/plots'],
          ].map(([emoji, label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(184,74,30,0.18)',
                border: '0.5px solid rgba(232,115,47,0.4)',
                color: '#E8732F',
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>{emoji}</span> {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[
            [totalCount > 0 ? `${totalCount}+` : 'Launching', 'Verified Listings'],
            ['₹0', 'Brokerage Fee'],
            ['48h', 'Verification SLA'],
            ['100%', 'Physical Checks'],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontFamily: 'var(--font-playfair), serif', fontSize: '32px', color: '#fff', fontWeight: 400, lineHeight: 1 }}>{num}</strong>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', marginTop: '6px', display: 'block' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE LISTINGS */}
      <section style={{ padding: '96px 5vw', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ background: '#FBF0EB', color: '#B84A1E', padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block' }}>
              Live Listings
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(30px,5vw,48px)', color: '#100E0B', fontWeight: 400, margin: '18px 0 12px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Verified Properties <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Near You</em>
            </h2>
            <p style={{ color: '#9C9488', fontSize: '15px' }}>
              {properties.length > 0 ? `${properties.length} verified listings live right now` : 'Onboarding verified agents — listings coming soon'}
            </p>
          </div>

          {properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px', opacity: 0.6 }}>🏠</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, color: '#100E0B', marginBottom: '10px' }}>Real Listings Coming Soon</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65, marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px' }}>
                We are personally verifying properties with real agents in Hyderabad. Every listing will be 100% real and verified.
              </p>
              <Link href="/list" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Are you an Agent? List Free
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
                {properties.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Link href="/rent" style={{ background: '#100E0B', color: '#fff', padding: '14px 32px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  Browse All Properties →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section style={{ background: 'linear-gradient(135deg,#1A120A,#2C1A0E,#0E2218)', padding: '96px 5vw' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', padding: '5px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', border: '0.5px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
              Why CredibleState
            </span>
            <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(30px,5vw,48px)', color: '#fff', fontWeight: 400, margin: '18px 0', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Built on Trust. <em style={{ color: '#E8732F', fontStyle: 'italic' }}>Backed by Verification.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
            {[
              ['✅', '100% Verified', 'Every property physically inspected before going live. No fakes. Ever.'],
              ['₹', 'Zero Brokerage', 'Direct owner contact. Save up to ₹1 lakh per deal in Hyderabad.'],
              ['🔒', 'Safe & Private', 'Phone numbers never shared publicly. Zero spam calls guaranteed.'],
              ['🔍', 'Instant Filters', 'Filter by BHK, budget, locality, furnishing, and more. Find exactly what you need.'],
              ['⭐', 'KYC-Verified Agents', 'Every agent completes identity verification before their first listing goes live.'],
              ['💬', 'Direct Messaging', 'Chat directly with verified agents inside the platform. No middlemen.'],
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

      {/* FINAL CTA */}
      <section style={{ background: '#B84A1E', padding: '80px 5vw', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,5vw,48px)', color: '#fff', fontWeight: 400, marginBottom: '14px', lineHeight: 1.1 }}>
            Your Perfect Home is <em style={{ fontStyle: 'italic' }}>One Search Away</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '36px', fontSize: '15px', lineHeight: 1.65 }}>
            Join Hyderabad&apos;s most trusted verified property platform. Zero brokerage, always.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rent" style={{ background: '#fff', color: '#B84A1E', padding: '14px 32px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Browse Properties
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
