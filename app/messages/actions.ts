'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { ConversationStatus, Message, MessageRole } from '@/lib/supabase'

export async function sendMessage(
  conversationId: string,
  body: string,
  senderRole: 'buyer' | 'agent',
): Promise<{ ok: true; message: Message } | { ok: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to send messages.' }

  const trimmed = (body || '').trim()
  if (!trimmed) return { ok: false, error: 'Message can\'t be empty.' }
  if (trimmed.length > 3500) return { ok: false, error: 'Message is too long.' }

  const supabase = await createSupabaseServerClient()

  // Verify this user is actually a participant. RLS will block us if not, but
  // we want a clean error message.
  const { data: convo } = await supabase
    .from('conversations')
    .select('id, buyer_id, agent_id, status')
    .eq('id', conversationId)
    .maybeSingle()

  if (!convo) return { ok: false, error: 'Conversation not found.' }
  if (senderRole === 'buyer' && convo.buyer_id !== user.id) {
    return { ok: false, error: 'You\'re not a participant in this conversation.' }
  }
  if (senderRole === 'agent' && convo.agent_id !== user.id) {
    return { ok: false, error: 'You\'re not the listing agent for this conversation.' }
  }
  if (convo.status !== 'open') {
    return { ok: false, error: 'This conversation has been closed.' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_role: senderRole as MessageRole,
      body: trimmed,
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('sendMessage:', error)
    return { ok: false, error: 'Could not send the message. Try again.' }
  }

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath(`/agent/messages/${conversationId}`)
  revalidatePath('/messages')
  revalidatePath('/agent/messages')
  return { ok: true, message: data as Message }
}

export async function closeConversation(
  conversationId: string,
  status: Exclude<ConversationStatus, 'open'>,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const supabase = await createSupabaseServerClient()
  const { data: convo } = await supabase
    .from('conversations')
    .select('id, buyer_id, agent_id')
    .eq('id', conversationId)
    .maybeSingle()
  if (!convo) return { ok: false, error: 'Not found.' }
  if (convo.buyer_id !== user.id && convo.agent_id !== user.id) {
    return { ok: false, error: 'Forbidden.' }
  }

  await supabase.from('conversations').update({ status }).eq('id', conversationId)
  // Drop a system message so participants see what happened.
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: 'system',
    body: status === 'closed_rented'
      ? 'Conversation marked as rented.'
      : status === 'closed_sold'
        ? 'Conversation marked as sold.'
        : 'Conversation closed.',
  })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath(`/agent/messages/${conversationId}`)
  return { ok: true }
}
