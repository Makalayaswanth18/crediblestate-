import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Auth callbacks set session cookies. They must NEVER be cached — by Next's
// data cache, by Vercel, or by Cloudflare. We belt-and-braces this:
//   - `dynamic = 'force-dynamic'` opts out of Next's static optimization
//   - explicit Cache-Control headers on every response
//   - next.config.ts also sets CDN-Cache-Control: private, no-store on /auth/*
export const dynamic = 'force-dynamic'

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'private, no-store',
}

function redirectWithNoStore(url: URL): NextResponse {
  const res = NextResponse.redirect(url)
  for (const [k, v] of Object.entries(NO_STORE_HEADERS)) {
    res.headers.set(k, v)
  }
  return res
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  // Validate next= to prevent open-redirect: only allow same-origin relative paths.
  // new URL(absoluteUrl, origin) ignores the base for absolute URLs, so an attacker
  // could pass next=https://evil.com and land the user there post-auth.
  const rawNext = url.searchParams.get('next') || ''
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : ''
  const intent = url.searchParams.get('intent')

  if (!code) {
    return redirectWithNoStore(new URL('/signin?error=callback_failed', url.origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Magic link callback failed:', error)
    return redirectWithNoStore(new URL('/signin?error=callback_failed', url.origin))
  }

  // Read the freshly-signed-in user and their profile, then apply intent if needed.
  const { data: { user } } = await supabase.auth.getUser()
  let role: 'buyer' | 'agent' = 'buyer'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const initialRole = intent === 'agent' ? 'agent' : 'buyer'
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.email?.split('@')[0] ?? null,
        role: initialRole,
      })
      role = initialRole
    } else {
      role = (profile.role as 'buyer' | 'agent') ?? 'buyer'

      if (intent === 'agent' && role !== 'agent') {
        await supabase.from('profiles').update({ role: 'agent' }).eq('id', user.id)
        role = 'agent'
      }
    }
  }

  // Where to send them:
  //   - explicit ?next= wins (e.g., they were trying to read /messages/<id>)
  //   - agents → /agent/dashboard
  //   - buyers → home (then they can browse listings; account/messages live in nav)
  const destination = next
    ? next
    : role === 'agent'
      ? '/agent/dashboard'
      : '/'

  return redirectWithNoStore(new URL(destination, url.origin))
}
