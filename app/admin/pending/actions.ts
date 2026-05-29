'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'

export async function approveListing(id: string): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const supabase = await createSupabaseServerClient()
  // Fetch slug + locality so we can revalidate exactly the pages that need it.
  const { data: prop } = await supabase
    .from('properties')
    .select('slug, locality')
    .eq('id', id)
    .maybeSingle()

  await supabase
    .from('properties')
    .update({ status: 'verified', updated_at: new Date().toISOString() })
    .eq('id', id)

  // Targeted revalidation — homepage and /rent already revalidate on their
  // own (revalidate = 300 / 120). We only force-revalidate the admin queue
  // (so the row disappears) and the new property's public pages.
  revalidatePath('/admin/pending')
  if (prop?.slug) revalidatePath(`/property/${prop.slug}`)
  if (prop?.locality) revalidatePath(`/rent/${prop.locality.toLowerCase().replace(/\s+/g, '-')}`)
}

export async function rejectListing(id: string): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const supabase = await createSupabaseServerClient()
  await supabase
    .from('properties')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/pending')
}
