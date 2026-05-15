import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server component context — middleware handles refresh
        }
      },
    },
  })
}

// Hardcoded admin emails — add more here as your team grows
const ADMIN_EMAILS = ['yaswanthganesh39@gmail.com']

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return null
  }
  return user
}

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email)
}

import type { Profile } from './supabase'

/**
 * Fetch the signed-in user together with their profile row.
 * Returns { user, profile } — both nullable.
 *
 * The DB trigger handle_new_user() guarantees a profile row exists for any
 * authenticated user, but during the window between sign-up and trigger fire
 * (or for users who pre-date migration 004) it can be missing — we lazily
 * insert in that case so the rest of the app never has to special-case it.
 */
export async function getCurrentUserWithProfile(): Promise<{
  user: Awaited<ReturnType<typeof getCurrentUser>>
  profile: Profile | null
}> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return { user, profile: existing as Profile }

  // Lazy-create — should be rare (trigger covers new signups).
  const fallbackName = user.email?.split('@')[0] ?? null
  const { data: created } = await supabase
    .from('profiles')
    .insert({ id: user.id, full_name: fallbackName })
    .select('*')
    .single()

  return { user, profile: (created as Profile) ?? null }
}
