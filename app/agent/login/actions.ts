'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type MagicLinkOptions = {
  /** path to redirect to after a successful exchange */
  next?: string
  /** 'agent' marks the new profile as agent on first login (no-op for returning users) */
  intent?: 'agent' | 'buyer'
}

export async function sendMagicLink(
  email: string,
  options: MagicLinkOptions = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }

  const supabase = await createSupabaseServerClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'crediblestate.vercel.app'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  // Pack intent + next into the callback URL so the route handler can read them
  // after the code exchange.
  const callback = new URL('/auth/callback', origin)
  if (options.next) callback.searchParams.set('next', options.next)
  if (options.intent) callback.searchParams.set('intent', options.intent)

  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: callback.toString(),
      shouldCreateUser: true,
    },
  })

  if (error) {
    console.error('Magic link send error:', error)
    return { ok: false, error: error.message || 'Could not send login email. Try again.' }
  }

  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
}

/**
 * Verify the 6-digit OTP code that Supabase sends in the same email as the
 * magic link. Avoids Gmail prefetching breaking single-use magic links — the
 * code is typed by the user, not consumed by a robot.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
  options: { next?: string; intent?: 'agent' | 'buyer' } = {},
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanToken = token.trim().replace(/\s+/g, '')
  if (!cleanEmail.includes('@')) return { ok: false, error: 'Invalid email.' }
  if (cleanToken.length !== 6) return { ok: false, error: 'Enter the 6-digit code from your email.' }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'email',
  })

  if (error) {
    console.error('OTP verify error:', error)
    return { ok: false, error: 'Code is wrong or expired. Request a new one.' }
  }

  // Mirror the /auth/callback logic — make sure a profile exists, apply intent
  const { data: { user } } = await supabase.auth.getUser()
  let role: 'buyer' | 'agent' = 'buyer'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const initialRole = options.intent === 'agent' ? 'agent' : 'buyer'
      await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.email?.split('@')[0] ?? null,
        role: initialRole,
      })
      role = initialRole
    } else {
      role = (profile.role as 'buyer' | 'agent') ?? 'buyer'
      if (options.intent === 'agent' && role !== 'agent') {
        await supabase.from('profiles').update({ role: 'agent' }).eq('id', user.id)
        role = 'agent'
      }
    }
  }

  // Validate next= — only allow same-origin relative paths
  const rawNext = options.next ?? ''
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : ''

  const destination = safeNext || (role === 'agent' ? '/agent/dashboard' : '/')
  return { ok: true, redirectTo: destination }
}
