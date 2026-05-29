'use client'

import { useState, useTransition } from 'react'
import { respondToVisit } from '@/app/messages/visit-actions'
import type { Visit } from '@/lib/supabase'

/**
 * Renders a single visit proposal in the message thread. Shows accept/decline
 * if it's pending and the viewer didn't propose it; shows status otherwise.
 */
export default function VisitCard({
  visit,
  viewerId,
  onUpdated,
}: {
  visit: Visit
  viewerId: string
  onUpdated: (next: Visit) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const isMine = visit.proposer_id === viewerId
  const when = new Date(visit.proposed_at)
  const slotLine = when.toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  function respond(next: 'confirmed' | 'declined' | 'cancelled' | 'completed') {
    setError(null)
    startTransition(async () => {
      const res = await respondToVisit(visit.id, next)
      if (!res.ok) { setError(res.error); return }
      onUpdated(res.visit)
    })
  }

  const meta = STATUS_META[visit.status]

  return (
    <div style={{
      alignSelf: 'center',
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      border: `1px solid ${meta.border}`,
      borderRadius: '14px',
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📅</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#100E0B' }}>Visit proposal</span>
        </div>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          background: meta.badgeBg,
          color: meta.badgeFg,
          padding: '3px 8px',
          borderRadius: '6px',
        }}>
          {meta.label}
        </span>
      </div>

      <div style={{ fontSize: '15px', fontWeight: 600, color: '#100E0B', marginBottom: '4px' }}>
        {slotLine}
      </div>
      {visit.note && (
        <div style={{ fontSize: '12px', color: '#4A4238', marginBottom: '10px', fontStyle: 'italic' }}>
          “{visit.note}”
        </div>
      )}

      {visit.status === 'pending' && !isMine && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => respond('confirmed')}
            disabled={pending}
            style={{ ...primaryBtn, opacity: pending ? 0.6 : 1 }}
          >
            ✓ Confirm
          </button>
          <button
            type="button"
            onClick={() => respond('declined')}
            disabled={pending}
            style={{ ...secondaryBtn, opacity: pending ? 0.6 : 1 }}
          >
            Decline
          </button>
        </div>
      )}

      {visit.status === 'pending' && isMine && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#9C9488', flex: 1, alignSelf: 'center' }}>
            Waiting for the other side to respond…
          </span>
          <button
            type="button"
            onClick={() => respond('cancelled')}
            disabled={pending}
            style={{ ...ghostBtn, opacity: pending ? 0.6 : 1 }}
          >
            Cancel
          </button>
        </div>
      )}

      {visit.status === 'confirmed' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => respond('completed')}
            disabled={pending}
            style={{ ...secondaryBtn, opacity: pending ? 0.6 : 1 }}
          >
            ✓ Mark as visited
          </button>
          <button
            type="button"
            onClick={() => respond('cancelled')}
            disabled={pending}
            style={{ ...ghostBtn, opacity: pending ? 0.6 : 1 }}
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#991B1B' }}>{error}</div>
      )}
    </div>
  )
}

const STATUS_META: Record<Visit['status'], { label: string; border: string; badgeBg: string; badgeFg: string }> = {
  pending:   { label: 'PENDING',   border: '#F5C9A0', badgeBg: '#FBF0EB', badgeFg: '#B84A1E' },
  confirmed: { label: 'CONFIRMED', border: '#B8DBC6', badgeBg: '#EBF5EF', badgeFg: '#1E4D35' },
  declined:  { label: 'DECLINED',  border: '#FCA5A5', badgeBg: '#FEF2F2', badgeFg: '#991B1B' },
  cancelled: { label: 'CANCELLED', border: '#DDD7CF', badgeBg: '#F0EBE3', badgeFg: '#4A4238' },
  completed: { label: 'COMPLETED', border: '#B8DBC6', badgeBg: '#EBF5EF', badgeFg: '#1E4D35' },
}

const primaryBtn: React.CSSProperties = {
  flex: 1, background: '#1E4D35', color: '#fff', border: 'none',
  padding: '10px 14px', borderRadius: '9px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const secondaryBtn: React.CSSProperties = {
  flex: 1, background: '#fff', color: '#100E0B', border: '0.5px solid #DDD7CF',
  padding: '10px 14px', borderRadius: '9px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: '#9C9488', border: '0.5px solid #DDD7CF',
  padding: '10px 14px', borderRadius: '9px', fontSize: '13px',
  fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
}
