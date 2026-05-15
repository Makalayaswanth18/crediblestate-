import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || ''
  const intent = url.searchParams.get('intent')

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=callback_failed', url.origin))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Magic link callback failed:', error)
    return NextResponse.redirect(new URL('/signin?error=callback_failed', url.origin))
  }

  // Read the freshly-signed-in user and their profile, then apply intent if needed.
  const { data: { user } } = await supabase.auth.getUser()
  let role: 'buyer' | 'agent' = 'buyer'

  if (user) {
    // Profile is auto-created by handle_new_user() trigger, but we read with
    // maybeSingle and fall back to insert in case it raced.
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

      // If this is a returning user who arrived via the agent flow but is
      // currently flagged as buyer, upgrade them (one-way only — agents can't
      // be downgraded silently because of the profiles_guard trigger).
      if (intent === 'agent' && role !== 'agent') {
        await supabase.from('profiles').update({ role: 'agent' }).eq('id', user.id)
        role = 'agent'
      }
    }
  }

  // Where to send them
  const destination = next
    ? next
    : role === 'agent'
      ? '/agent/dashboard'
      : '/account'

  return NextResponse.redirect(new URL(destination, url.origin))
}
