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
