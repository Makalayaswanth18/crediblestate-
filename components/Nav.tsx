import Link from 'next/link'
import { createSupabaseServerClient, isAdmin } from '@/lib/supabase-server'
import MobileMenu from './MobileMenu'

export default async function Nav() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userIsAdmin = isAdmin(user?.email)

  // Decide role for nav surfacing. We don't await getCurrentUserWithProfile here
  // (extra round trip on every page); a lightweight role lookup is enough.
  let role: 'agent' | 'buyer' = 'buyer'
  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (prof?.role === 'agent') role = 'agent'
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        background: 'rgba(26,18,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5vw',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: '22px',
          color: '#fff',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
        }}
      >
        Credible<span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>State</span>
      </Link>

      {/* Desktop nav */}
      <div className="nav-desktop" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/rent" style={navLink}>Browse</Link>
        <Link href="/favorites" style={navLink}>Saved</Link>
        {user && <Link href="/messages" style={navLink}>Messages</Link>}
        <Link href="/about" style={navLink}>About</Link>

        {userIsAdmin && (
          <Link href="/admin/pending" style={{ ...navLink, color: '#E8732F' }}>Admin</Link>
        )}

        {user ? (
          <Link
            href={role === 'agent' ? '/agent/dashboard' : '/account'}
            style={{
              background: '#fff',
              color: '#100E0B',
              padding: '9px 20px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            {role === 'agent' ? 'Dashboard' : 'Account'}
          </Link>
        ) : (
          <>
            <Link href="/signin" style={navLink}>Sign in</Link>
            <Link
              href="/list"
              style={{
                background: '#B84A1E',
                color: '#fff',
                padding: '9px 22px',
                borderRadius: '24px',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              List Property Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <MobileMenu
        user={user ? { email: user.email || '' } : null}
        isAdmin={userIsAdmin}
        role={role}
      />

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-trigger { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

const navLink: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '13px',
  textDecoration: 'none',
  fontWeight: 500,
}
