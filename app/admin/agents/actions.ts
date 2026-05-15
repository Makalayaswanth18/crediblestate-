'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, requireAdmin } from '@/lib/supabase-server'

export async function toggleAgentVerification(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return

  const id = String(formData.get('id') || '')
  const next = String(formData.get('next') || '') === 'verify'
  const notes = String(formData.get('notes') || '').trim().slice(0, 500) || null
  if (!id) return

  const supabase = await createSupabaseServerClient()
  await supabase
    .from('profiles')
    .update({
      is_verified_agent: next,
      agent_verified_at: next ? new Date().toISOString() : null,
      agent_kyc_notes: notes,
    })
    .eq('id', id)

  revalidatePath('/admin/agents')
  revalidatePath(`/agent/${id}`)
}
