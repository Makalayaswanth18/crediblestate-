'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getCurrentUserWithProfile } from '@/lib/supabase-server'
import type { Visit, VisitStatus } from '@/lib/supabase'

type Ok = { ok: true; visit: Visit }
type Err = { ok: false; error: string }

/**
 * Propose a property visit. Anyone in the conversation can propose; we also
 * drop a system message in the thread so it appears inline alongside chat.
 */
export async function proposeVisit(
  conversationId: string,
  proposedAtISO: string,
  note: string | null,
): Promise<Ok | Err> {
  const { user, profile } = await getCurrentUserWithProfile()
  if (!user) return { ok: false, error: 'Please sign in.' }

  const when = new Date(proposedAtISO)
  if (isNaN(when.getTime())) return { ok: false, error: 'Invalid date/time.' }
  if (when.getTime() < Date.now() - 60_000) return { ok: false, error: 'Pick a time in the future.' }
  // Disallow more than 60 days out — sanity guard
  if (when.getTime() > Date.now() + 60 * 24 * 60 * 60 * 1000) {
    return { ok: false, error: 'Pick a time within the next 60 days.' }
  }

  const supabase = await createSupabaseServerClient()

  const { data: convo } = await supabase
    .from('conversations')
    .select('id, property_id, buyer_id, agent_id, status')
    .eq('id', conversationId)
    .maybeSingle()

  if (!convo) return { ok: false, error: 'Conversation not found.' }
  if (convo.buyer_id !== user.id && convo.agent_id !== user.id) {
    return { ok: false, error: 'You are not part of this conversation.' }
  }
  if (convo.status !== 'open') return { ok: false, error: 'Conversation is closed.' }

  const proposerRole: 'buyer' | 'agent' | 'owner' =
    convo.buyer_id === user.id
      ? 'buyer'
      : profile?.role === 'owner'
        ? 'owner'
        : 'agent'

  const cleanNote = (note ?? '').trim().slice(0, 200) || null

  const { data: created, error } = await supabase
    .from('visits')
    .insert({
      conversation_id: conversationId,
      property_id: convo.property_id,
      proposer_id: user.id,
      proposer_role: proposerRole,
      proposed_at: when.toISOString(),
      status: 'pending',
      note: cleanNote,
    })
    .select('*')
    .single()

  if (error || !created) {
    console.error('proposeVisit insert error:', error)
    return { ok: false, error: 'Could not create the visit proposal. Try again.' }
  }

  // Drop a system message so it appears in the thread immediately
  const whoText = proposerRole === 'buyer' ? 'Buyer' : 'Owner/Agent'
  const slotText = formatSlotForMessage(when)
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: 'system',
    body: `📅 ${whoText} proposed a visit on ${slotText}.`,
  })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath(`/agent/messages/${conversationId}`)

  return { ok: true, visit: created as Visit }
}

/**
 * Respond to a pending visit proposal: confirm, decline, or cancel.
 */
export async function respondToVisit(
  visitId: string,
  next: Exclude<VisitStatus, 'pending'>,
): Promise<Ok | Err> {
  const { user } = await getCurrentUserWithProfile()
  if (!user) return { ok: false, error: 'Please sign in.' }

  const supabase = await createSupabaseServerClient()

  const { data: visit } = await supabase
    .from('visits')
    .select('*, conversations!inner(buyer_id, agent_id)')
    .eq('id', visitId)
    .maybeSingle()

  if (!visit) return { ok: false, error: 'Visit not found.' }

  // Narrow the joined shape
  type Row = Visit & { conversations: { buyer_id: string | null; agent_id: string | null } }
  const v = visit as unknown as Row

  if (v.conversations.buyer_id !== user.id && v.conversations.agent_id !== user.id) {
    return { ok: false, error: 'You are not part of this conversation.' }
  }

  // Only allow confirm/decline if currently pending; cancel/complete can be anytime
  if ((next === 'confirmed' || next === 'declined') && v.status !== 'pending') {
    return { ok: false, error: 'This proposal is no longer pending.' }
  }

  const { data: updated, error } = await supabase
    .from('visits')
    .update({ status: next })
    .eq('id', visitId)
    .select('*')
    .single()

  if (error || !updated) {
    console.error('respondToVisit update error:', error)
    return { ok: false, error: 'Could not update the visit. Try again.' }
  }

  // System message reflecting the new state
  const slotText = formatSlotForMessage(new Date(v.proposed_at))
  const statusText: Record<typeof next, string> = {
    confirmed: `✅ Visit confirmed for ${slotText}.`,
    declined:  `❌ Visit declined for ${slotText}.`,
    cancelled: `🚫 Visit cancelled.`,
    completed: `✓ Visit on ${slotText} marked as completed.`,
  }
  await supabase.from('messages').insert({
    conversation_id: v.conversation_id,
    sender_id: user.id,
    sender_role: 'system',
    body: statusText[next],
  })

  revalidatePath(`/messages/${v.conversation_id}`)
  revalidatePath(`/agent/messages/${v.conversation_id}`)

  return { ok: true, visit: updated as Visit }
}

function formatSlotForMessage(d: Date): string {
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
