import Link from 'next/link'
import { createSupabaseServerClient, isAdmin } from '@/lib/supabase-server'

export default async function Nav() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userIsAdmin = isAdmin(user?.email)

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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/rent" style={navLink}>Browse</Link>
        <Link href="/about" style={navLink}>About</Link>

        {userIsAdmin && (
          <Link href="/admin/pending" style={{ ...navLink, color: '#E8732F' }}>Admin</Link>
        )}

        {user ? (
          <Link
            href="/agent/dashboard"
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
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/agent/login" style={navLink}>Sign in</Link>
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
    </nav>
  )
}

const navLink: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '13px',
  textDecoration: 'none',
  fontWeight: 500,
}
