'use client'

import { useState, useTransition } from 'react'
import { proposeVisit } from '@/app/messages/visit-actions'
import type { Visit } from '@/lib/supabase'

/**
 * Inline form to suggest a visit time. Renders as a collapsed "📅 Suggest a visit"
 * button by default; expands to date + time controls on click.
 */
export default function VisitProposalForm({
  conversationId,
  onProposed,
}: {
  conversationId: string
  onProposed: (visit: Visit) => void
}) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('11:00')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Compute a sensible default date — tomorrow
  function ensureDefaults() {
    if (!date) {
      const t = new Date()
      t.setDate(t.getDate() + 1)
      setDate(t.toISOString().slice(0, 10))
    }
  }

  function close() {
    setOpen(false)
    setError(null)
  }

  function submit() {
    setError(null)
    if (!date) { setError('Pick a date.'); return }
    if (!time) { setError('Pick a time.'); return }

    // Build local datetime (date input is YYYY-MM-DD, time HH:MM) and convert to ISO
    const local = new Date(`${date}T${time}:00`)
    if (isNaN(local.getTime())) { setError('Invalid date/time.'); return }

    startTransition(async () => {
      const res = await proposeVisit(conversationId, local.toISOString(), note || null)
      if (!res.ok) { setError(res.error); return }
      onProposed(res.visit)
      setOpen(false)
      setNote('')
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { ensureDefaults(); setOpen(true) }}
        style={{
          alignSelf: 'flex-start',
          background: '#FBF0EB',
          color: '#B84A1E',
          border: '0.5px solid #F5C9A0',
          padding: '8px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        📅 Suggest a visit
      </button>
    )
  }

  // Min date = today (so user can't pick past dates)
  const todayISO = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ background: '#FBF0EB', border: '0.5px solid #F5C9A0', borderRadius: '14px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#B84A1E' }}>📅 Suggest a visit time</div>
        <button type="button" onClick={close} style={closeBtn}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Date</span>
          <input
            type="date"
            value={date}
            min={todayISO}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Time</span>
          <select value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle}>
            {timeOptions.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: '12px' }}>
        <span style={fieldLabel}>Note (optional)</span>
        <input
          type="text"
          placeholder="e.g., Please come from the back gate"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          style={inputStyle}
        />
      </label>

      {error && (
        <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={close} style={cancelBtn}>Cancel</button>
        <button type="button" onClick={submit} disabled={pending} style={{ ...submitBtn, opacity: pending ? 0.6 : 1, cursor: pending ? 'not-allowed' : 'pointer' }}>
          {pending ? 'Sending…' : 'Send proposal'}
        </button>
      </div>
    </div>
  )
}

const timeOptions: [string, string][] = [
  ['09:00', '9:00 AM'], ['10:00', '10:00 AM'], ['11:00', '11:00 AM'],
  ['12:00', '12:00 PM'], ['13:00', '1:00 PM'],  ['14:00', '2:00 PM'],
  ['15:00', '3:00 PM'],  ['16:00', '4:00 PM'],  ['17:00', '5:00 PM'],
  ['18:00', '6:00 PM'],  ['19:00', '7:00 PM'],  ['20:00', '8:00 PM'],
]

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, color: '#92400E',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 11px', borderRadius: '8px',
  border: '0.5px solid #F5C9A0', background: '#fff', fontSize: '13px',
  fontFamily: 'inherit', outline: 'none', color: '#100E0B',
}
const submitBtn: React.CSSProperties = {
  background: '#B84A1E', color: '#fff', border: 'none',
  padding: '9px 18px', borderRadius: '9px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const cancelBtn: React.CSSProperties = {
  background: '#fff', color: '#4A4238', border: '0.5px solid #DDD7CF',
  padding: '9px 18px', borderRadius: '9px', fontSize: '13px',
  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
const closeBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#92400E', fontSize: '14px', padding: '0 6px',
}
