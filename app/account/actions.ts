'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { SavedSearchFilters } from '@/lib/supabase'

export async function updateProfile(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const full_name = String(formData.get('full_name') || '').trim().slice(0, 120) || null
  const phone = String(formData.get('phone') || '').trim().slice(0, 32) || null

  const supabase = await createSupabaseServerClient()
  await supabase
    .from('profiles')
    .update({ full_name, phone })
    .eq('id', user.id)

  revalidatePath('/account')
}

export async function deleteSavedSearch(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  const id = String(formData.get('id') || '')
  if (!id) return

  const supabase = await createSupabaseServerClient()
  await supabase.from('saved_searches').delete().eq('id', id).eq('buyer_id', user.id)

  revalidatePath('/account')
}

export async function toggleSearchAlerts(formData: FormData): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return
  const id = String(formData.get('id') || '')
  const next = formData.get('next') === '1'
  if (!id) return

  const supabase = await createSupabaseServerClient()
  await supabase
    .from('saved_searches')
    .update({ email_alerts: next })
    .eq('id', id)
    .eq('buyer_id', user.id)

  revalidatePath('/account')
}

export async function saveCurrentSearch(
  name: string,
  filters: SavedSearchFilters,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: 'Please sign in to save searches.' }
  }

  const cleanName = (name || '').trim().slice(0, 80)
  if (!cleanName) return { ok: false, error: 'Give your search a name first.' }

  // Drop empty keys so the row is tidy
  const cleaned: SavedSearchFilters = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v == null) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === 'string' && v.trim() === '') continue
    // @ts-expect-error narrow union
    cleaned[k] = v
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('saved_searches').insert({
    buyer_id: user.id,
    name: cleanName,
    filters: cleaned,
    email_alerts: true,
  })

  if (error) {
    console.error('saveCurrentSearch:', error)
    return { ok: false, error: 'Could not save search. Try again in a moment.' }
  }

  revalidatePath('/account')
  return { ok: true }
}

/**
 * Merge a list of property ids (from localStorage) into the signed-in buyer's
 * server-side favorites array. Called from the client once on first auth.
 */
export async function mergeFavorites(ids: string[]): Promise<{ ok: boolean }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false }
  const supabase = await createSupabaseServerClient()
  const { data: row } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', user.id)
    .single()
  const existing: string[] = (row?.favorites as string[]) ?? []
  const merged = Array.from(new Set([...existing, ...ids.filter(Boolean)]))
  await supabase.from('profiles').update({ favorites: merged }).eq('id', user.id)
  return { ok: true }
}

export async function toggleFavorite(propertyId: string): Promise<{ favorites: string[] } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'not_signed_in' }
  const supabase = await createSupabaseServerClient()
  const { data: row } = await supabase
    .from('profiles')
    .select('favorites')
    .eq('id', user.id)
    .single()
  const existing: string[] = (row?.favorites as string[]) ?? []
  const next = existing.includes(propertyId)
    ? existing.filter((id) => id !== propertyId)
    : [...existing, propertyId]
  await supabase.from('profiles').update({ favorites: next }).eq('id', user.id)
  return { favorites: next }
}
