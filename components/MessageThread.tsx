'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type { Message, Visit } from '@/lib/supabase'
import { sendMessage } from '@/app/messages/actions'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'
import VisitProposalForm from './VisitProposalForm'
import VisitCard from './VisitCard'

export default function MessageThread({
  conversationId,
  viewerRole,
  viewerId,
  initialMessages,
  initialVisits = [],
}: {
  conversationId: string
  viewerRole: 'buyer' | 'agent'
  viewerId: string
  initialMessages: Message[]
  initialVisits?: Visit[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [visits, setVisits] = useState<Visit[]>(initialVisits)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Realtime: messages + visits
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel(`thread:${conversationId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Message }) => {
        const incoming = payload.new
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes' as any, {
        event: '*', schema: 'public', table: 'visits',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Visit; old: Visit; eventType: string }) => {
        setVisits((prev) => {
          if (payload.eventType === 'DELETE') {
            return prev.filter((v) => v.id !== payload.old.id)
          }
          const next = payload.new
          const idx = prev.findIndex((v) => v.id === next.id)
          if (idx === -1) return [...prev, next]
          const out = prev.slice()
          out[idx] = next
          return out
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  // Merge messages + visits sorted by created_at so they interleave in the thread
  type FeedItem =
    | { kind: 'msg'; ts: number; data: Message }
    | { kind: 'visit'; ts: number; data: Visit }
  const feed: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = []
    for (const m of messages) items.push({ kind: 'msg', ts: new Date(m.created_at).getTime(), data: m })
    for (const v of visits)   items.push({ kind: 'visit', ts: new Date(v.created_at).getTime(), data: v })
    items.sort((a, b) => a.ts - b.ts)
    return items
  }, [messages, visits])

  // Auto-scroll to bottom on new items
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [feed.length])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setError(null)

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
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setBody(text)
        return
      }
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.message : m)))
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
        {feed.length === 0 ? (
          <p style={{ color: '#9C9488', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
            No messages yet. Say hi or suggest a visit.
          </p>
        ) : (
          feed.map((item) => {
            if (item.kind === 'visit') {
              return (
                <VisitCard
                  key={`v-${item.data.id}`}
                  visit={item.data}
                  viewerId={viewerId}
                  onUpdated={(next) => {
                    setVisits((prev) => prev.map((v) => (v.id === next.id ? next : v)))
                  }}
                />
              )
            }
            const m = item.data
            const mine = m.sender_role === viewerRole
            const isSystem = m.sender_role === 'system'
            if (isSystem) {
              return (
                <div key={`m-${m.id}`} style={{ textAlign: 'center', fontSize: '12px', color: '#9C9488', padding: '6px 0' }}>
                  {m.body}
                </div>
              )
            }
            return (
              <div
                key={`m-${m.id}`}
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

      {/* Visit proposal — collapsible button + form */}
      <VisitProposalForm
        conversationId={conversationId}
        onProposed={(v) => setVisits((prev) => [...prev, v])}
      />

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={viewerRole === 'agent' ? 'Reply to the buyer…' : 'Send a message…'}
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
