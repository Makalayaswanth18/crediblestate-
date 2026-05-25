'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
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

  // Fire notification email to the recipient (non-blocking — failures don't affect send)
  const recipientId = senderRole === 'buyer' ? convo.agent_id : convo.buyer_id
  if (recipientId) {
    notifyRecipient({
      recipientId,
      senderRole,
      conversationId,
      snippet: trimmed.slice(0, 120),
    }).catch(() => {}) // intentionally swallow — email is best-effort
  }

  return { ok: true, message: data as Message }
}

async function notifyRecipient({
  recipientId,
  senderRole,
  conversationId,
  snippet,
}: {
  recipientId: string
  senderRole: 'buyer' | 'agent'
  conversationId: string
  snippet: string
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) return

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [{ data: userResp }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(recipientId),
    admin.from('profiles').select('full_name').eq('id', recipientId).maybeSingle(),
  ])

  const email = userResp?.user?.email
  if (!email) return

  const firstName = ((profile?.full_name as string | null) ?? '').split(' ')[0] || null
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  const role = senderRole === 'buyer' ? 'a buyer' : 'the agent'
  const link = senderRole === 'buyer'
    ? `https://crediblestate.com/agent/messages/${conversationId}`
    : `https://crediblestate.com/messages/${conversationId}`

  const resend = new Resend(RESEND_API_KEY)
  const FROM = process.env.EMAIL_FROM || 'CredibleState <alerts@crediblestate.com>'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `New message from ${role} on CredibleState`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#100E0B;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #DDD7CF;">
<tr><td style="padding:20px 28px;background:linear-gradient(160deg,#1A120A,#2C1A0E);color:#fff;">
<div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;">Credible<span style="color:rgba(255,255,255,0.55);font-weight:400;">State</span></div>
</td></tr>
<tr><td style="padding:28px;">
<p style="margin:0 0 12px;font-size:15px;color:#100E0B;">${greeting}</p>
<p style="margin:0 0 16px;font-size:15px;color:#4A4238;line-height:1.6;">You have a new message from ${role} on CredibleState:</p>
<div style="background:#FAF7F2;border-left:3px solid #B84A1E;padding:12px 16px;border-radius:0 10px 10px 0;font-size:14px;color:#4A4238;line-height:1.6;margin-bottom:20px;">${snippet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}${snippet.length >= 120 ? '…' : ''}</div>
<a href="${link}" style="display:inline-block;background:#B84A1E;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;">View conversation →</a>
</td></tr>
<tr><td style="padding:16px 28px;background:#FAF7F2;border-top:1px solid #EEEAE3;font-size:12px;color:#9C9488;">
CredibleState · Hyderabad's verified property platform
</td></tr>
</table></td></tr></table></body></html>`,
    text: `${greeting}\n\nYou have a new message from ${role} on CredibleState:\n\n"${snippet}${snippet.length >= 120 ? '…' : ''}"\n\nView conversation: ${link}\n\n— CredibleState`,
  })
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
