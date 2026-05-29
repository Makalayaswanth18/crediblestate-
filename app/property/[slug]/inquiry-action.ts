'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server'

export type InquiryResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string }

/**
 * Submit an inquiry on a property.
 *
 * Behavior:
 *   - Looks up the property and the agent.
 *   - For signed-in buyers: find-or-create a conversation (one per buyer/property)
 *     and append the message under the buyer's identity.
 *   - For anonymous buyers: create a fresh conversation with the buyer snapshot
 *     and post the first message with sender_id = null, sender_role = 'buyer'.
 *
 * RLS allows anyone to insert a conversation referencing a verified property
 * and to post the first message — see migration 004 policies.
 */
export async function submitInquiry(propertyId: string, formData: FormData): Promise<InquiryResult> {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const email = String(formData.get('email') || '').trim() || null
  const message = String(formData.get('message') || '').trim()

  if (!name || !phone) {
    return { ok: false, error: 'Please share your name and phone so the owner can reach you.' }
  }
  // Indian mobile validation — must be a real-looking number
  // Strip spaces/dashes/+91 prefix, then expect exactly 10 digits starting with 6-9
  const digits = phone.replace(/[\s\-()+]/g, '').replace(/^(91|0)/, '')
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { ok: false, error: 'Please enter a valid 10-digit Indian mobile number.' }
  }
  if (!message || message.length < 5) {
    return { ok: false, error: 'Please write a short message (at least a few words).' }
  }
  if (message.length > 2000) {
    return { ok: false, error: 'Message is too long. Please keep it under 2000 characters.' }
  }
  if (name.length > 100) {
    return { ok: false, error: 'Name is too long.' }
  }

  // Use the cookie-auth'd client throughout for consistency
  const supabaseAuthed = await createSupabaseServerClient()
  const user = await getCurrentUser()

  // Look up the property (need agent_id even though it's not exposed publicly).
  const { data: property } = await supabaseAuthed
    .from('properties')
    .select('id, agent_id, status')
    .eq('id', propertyId)
    .single()

  if (!property || property.status !== 'verified') {
    return { ok: false, error: 'This property is no longer available.' }
  }

  // Rate limit: a single phone can only inquire about the same property once
  // per hour. Prevents accidental double-submits and crude spam.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabaseAuthed
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('buyer_phone', phone)
    .gte('created_at', oneHourAgo)

  if ((recentCount ?? 0) > 0) {
    return { ok: false, error: 'You already sent an inquiry for this property recently. The owner will contact you soon.' }
  }

  let conversationId: string | null = null

  if (user) {
    // Find existing thread for this buyer + property (unique index enforces 1)
    const { data: existing } = await supabaseAuthed
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (existing) {
      conversationId = existing.id as string
    } else {
      const { data: created, error: createErr } = await supabaseAuthed
        .from('conversations')
        .insert({
          property_id: propertyId,
          buyer_id: user.id,
          agent_id: property.agent_id ?? null,
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: email,
          last_message_preview: message.slice(0, 200),
        })
        .select('id')
        .single()

      if (createErr || !created) {
        console.error('Create conversation (auth):', createErr)
        return { ok: false, error: 'Could not send. Please WhatsApp the owner directly.' }
      }
      conversationId = created.id as string
    }
  } else {
    // Anonymous — always a fresh thread (we have no stable buyer key).
    const { data: created, error: createErr } = await supabaseAuthed
      .from('conversations')
      .insert({
        property_id: propertyId,
        buyer_id: null,
        agent_id: property.agent_id ?? null,
        buyer_name: name,
        buyer_phone: phone,
        buyer_email: email,
        last_message_preview: message.slice(0, 200),
      })
      .select('id')
      .single()

    if (createErr || !created) {
      console.error('Create conversation (anon):', createErr)
      return { ok: false, error: 'Could not send. Please WhatsApp the owner directly.' }
    }
    conversationId = created.id as string
  }

  // Post the first message
  const { error: msgErr } = await supabaseAuthed.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user?.id ?? null,
    sender_role: 'buyer',
    body: message,
  })

  if (msgErr) {
    console.error('Insert first message:', msgErr)
    return { ok: false, error: 'Could not send. Please WhatsApp the owner directly.' }
  }

  revalidatePath('/agent/inquiries')
  revalidatePath('/agent/messages')
  if (user) revalidatePath('/messages')
  return { ok: true, conversationId }
}
