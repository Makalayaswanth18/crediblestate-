'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'

export async function approveListing(id: string): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const supabase = await createSupabaseServerClient()
  await supabase
    .from('properties')
    .update({ status: 'verified', updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/')
  revalidatePath('/rent')
  revalidatePath('/admin/pending')
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
