'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'
import type { Review } from '@/lib/supabase'

export async function getReviewForConversation(conversationId: string): Promise<Review | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('conversation_id', conversationId)
    .maybeSingle()

  return (data as Review) ?? null
}

export async function submitReview({
  conversationId,
  agentId,
  propertyId,
  rating,
  body,
}: {
  conversationId: string
  agentId: string
  propertyId: string
  rating: number
  body: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Please sign in to leave a review.' }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Pick a rating between 1 and 5 stars.' }
  }
  if (body && body.length > 1500) {
    return { ok: false, error: 'Review is too long.' }
  }

  const supabase = await createSupabaseServerClient()

  // RLS will already enforce: conversation must be closed and owned by this buyer.
  // We surface a friendly error here too.
  const { data: convo } = await supabase
    .from('conversations')
    .select('id, buyer_id, agent_id, status')
    .eq('id', conversationId)
    .maybeSingle()

  if (!convo) return { ok: false, error: 'Conversation not found.' }
  if (convo.buyer_id !== user.id) return { ok: false, error: 'Only the buyer can review.' }
  if (convo.agent_id !== agentId) return { ok: false, error: 'Agent mismatch.' }
  if (convo.status === 'open') return { ok: false, error: 'Wait until the conversation is closed to leave a review.' }

  const { error } = await supabase.from('reviews').insert({
    conversation_id: conversationId,
    agent_id: agentId,
    buyer_id: user.id,
    property_id: propertyId,
    rating,
    body,
  })

  if (error) {
    // Unique constraint on conversation_id — graceful message on retry
    if (error.code === '23505') {
      return { ok: false, error: 'You\'ve already reviewed this conversation.' }
    }
    console.error('submitReview:', error)
    return { ok: false, error: 'Could not save your review. Try again.' }
  }

  revalidatePath(`/agent/${agentId}`)
  revalidatePath(`/messages/${conversationId}`)
  return { ok: true }
}
