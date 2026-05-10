'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function sendMagicLink(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }

  const supabase = await createSupabaseServerClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'crediblestate.vercel.app'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
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
