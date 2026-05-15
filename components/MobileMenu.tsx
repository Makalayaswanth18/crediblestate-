'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileMenu({
  user,
  isAdmin,
  role = 'buyer',
}: {
  user: { email: string } | null
  isAdmin: boolean
  role?: 'buyer' | 'agent'
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-mobile-trigger"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 200,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '85%',
              maxWidth: '320px',
              height: '100vh',
              background: 'linear-gradient(180deg,#1A120A,#2C1A0E)',
              color: '#fff',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'slideIn 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 700 }}>
                Credible<span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>State</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <MobileLink href="/rent">🔍 Browse Properties</MobileLink>
            <MobileLink href="/favorites">♥ Saved</MobileLink>
            {user && <MobileLink href="/messages">💬 Messages</MobileLink>}
            <MobileLink href="/about">📖 About</MobileLink>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />

            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '8px 16px' }}>
              Popular Localities
            </div>
            <MobileLink href="/rent/kondapur" small>Kondapur</MobileLink>
            <MobileLink href="/rent/gachibowli" small>Gachibowli</MobileLink>
            <MobileLink href="/rent/madhapur" small>Madhapur</MobileLink>
            <MobileLink href="/rent/banjara-hills" small>Banjara Hills</MobileLink>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />

            {isAdmin && (
              <>
                <MobileLink href="/admin/pending" highlight>⚡ Admin · Listings</MobileLink>
                <MobileLink href="/admin/agents" highlight>⚡ Admin · Agents</MobileLink>
              </>
            )}

            {user ? (
              <MobileLink
                href={role === 'agent' ? '/agent/dashboard' : '/account'}
                highlight
              >
                {role === 'agent' ? '📊 Dashboard' : '👤 Account'}
              </MobileLink>
            ) : (
              <MobileLink href="/signin">Sign in</MobileLink>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <Link
                href="/list"
                style={{
                  display: 'block',
                  background: '#B84A1E',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                + List Property Free
              </Link>
            </div>

            {user && (
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Signed in as {user.email}
              </div>
            )}
          </div>

          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

function MobileLink({ href, children, small, highlight }: { href: string; children: React.ReactNode; small?: boolean; highlight?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: small ? '10px 16px' : '14px 16px',
        fontSize: small ? '14px' : '15px',
        fontWeight: highlight ? 600 : 500,
        color: highlight ? '#E8732F' : 'rgba(255,255,255,0.85)',
        textDecoration: 'none',
        borderRadius: '10px',
        background: highlight ? 'rgba(232,115,47,0.08)' : 'transparent',
      }}
    >
      {children}
    </Link>
  )
}
