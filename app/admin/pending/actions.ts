'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'

type ApproveOpts = {
  /**
   * Whether to keep the "🏠 Direct Owner" badge on this listing. Admin can
   * confirm during physical verification (saw the owner's papers, met them
   * in person) or strip it (turns out a broker submitted it claiming to be
   * the owner). Falls back to whatever the form said.
   */
  ownerConfirmed?: 'keep' | 'strip'
}

export async function approveListing(id: string, opts: ApproveOpts = {}): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const supabase = await createSupabaseServerClient()
  const { data: prop } = await supabase
    .from('properties')
    .select('slug, locality')
    .eq('id', id)
    .maybeSingle()

  const updates: Record<string, unknown> = {
    status: 'verified',
    updated_at: new Date().toISOString(),
  }
  if (opts.ownerConfirmed === 'keep') updates.owner_listed = true
  if (opts.ownerConfirmed === 'strip') updates.owner_listed = false

  await supabase.from('properties').update(updates).eq('id', id)

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
