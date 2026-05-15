'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { Message } from '@/lib/supabase'
import { sendMessage } from '@/app/messages/actions'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export default function MessageThread({
  conversationId,
  viewerRole,
  viewerId,
  initialMessages,
}: {
  conversationId: string
  viewerRole: 'buyer' | 'agent'
  viewerId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Subscribe to realtime INSERTs on this conversation. RLS still applies, so
  // we only receive messages we're allowed to see (which, for participants on
  // this thread, is all of them). Updates are appended in-place; we de-dupe
  // by id in case our own optimistic insert beat the broadcast.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Message }) => {
        const incoming = payload.new
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev
          // Replace optimistic entry (temp-*) from this viewer if it matches.
          const optimisticIdx = prev.findIndex(
            (m) => m.id.startsWith('temp-') && m.sender_id === incoming.sender_id && m.body === incoming.body,
          )
          if (optimisticIdx >= 0) {
            const next = prev.slice()
            next[optimisticIdx] = incoming
            return next
          }
          return [...prev, incoming]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // Keep the message list scrolled to the bottom when new entries arrive.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setError(null)

    // Optimistic
    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: viewerId,
      sender_role: viewerRole,
      body: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setBody('')

    startTransition(async () => {
      const res = await sendMessage(conversationId, text, viewerRole)
      if (!res.ok) {
        setError(res.error)
        // Roll back the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setBody(text)
        return
      }
      // Replace optimistic with the real row
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.message : m)))
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#9C9488', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
            No messages yet. Say hi.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === viewerRole
            const isSystem = m.sender_role === 'system'
            if (isSystem) {
              return (
                <div key={m.id} style={{ textAlign: 'center', fontSize: '12px', color: '#9C9488', padding: '6px 0' }}>
                  {m.body}
                </div>
              )
            }
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  background: mine ? '#100E0B' : '#fff',
                  color: mine ? '#fff' : '#100E0B',
                  border: mine ? 'none' : '0.5px solid #DDD7CF',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  maxWidth: '78%',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.body}
                <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.55, textAlign: 'right' }}>
                  {new Date(m.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={viewerRole === 'agent' ? 'Reply to the buyer…' : 'Send a message to the agent…'}
          rows={2}
          style={{
            flex: 1,
            border: '0.5px solid #DDD7CF',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            background: '#fff',
            outline: 'none',
            color: '#100E0B',
          }}
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          style={{
            background: pending || !body.trim() ? '#9C9488' : '#B84A1E',
            color: '#fff',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
