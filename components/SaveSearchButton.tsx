'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { saveCurrentSearch } from '@/app/account/actions'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'
import type { SavedSearchFilters } from '@/lib/supabase'

/**
 * Discovers signin state client-side so the enclosing /rent page can stay
 * CDN-cacheable. (If we read cookies on the server we make /rent dynamic,
 * which means Cloudflare never serves a cached HTML response — costing us a
 * 5-10x capacity multiplier on the hottest page on the site.)
 */
export default function SaveSearchButton({
  filters,
}: {
  filters: SavedSearchFilters
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultName(filters))
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const s = createSupabaseBrowserClient()
    s.auth.getSession().then((res: { data: { session: unknown } }) => {
      setIsSignedIn(!!res.data.session)
    })
  }, [])

  // While we don't yet know whether the visitor is signed in, render nothing —
  // we don't want to flash the wrong CTA.
  if (isSignedIn === null) return null

  if (!isSignedIn) {
    // Prompt to sign in, preserving the current filters in the next param.
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
          🔔 Get email alerts for this search —
        </span>{' '}
        <Link
          href={`/signin?next=${encodeURIComponent('/rent?' + new URLSearchParams(filtersToParams(filters)).toString())}`}
          style={{ color: '#E8732F', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}
        >
          sign in to save it
        </Link>
      </div>
    )
  }

  if (saved) {
    return (
      <div style={containerStyle}>
        <span style={{ fontSize: '13px', color: '#88E5A8' }}>
          ✓ Saved. We&apos;ll email you when new matching listings go live.
        </span>{' '}
        <Link href="/account" style={{ color: '#E8732F', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
          Manage searches →
        </Link>
      </div>
    )
  }

  if (!open) {
    return (
      <div style={containerStyle}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(232,115,47,0.16)',
            border: '0.5px solid rgba(232,115,47,0.4)',
            color: '#E8732F',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔔 Save this search
        </button>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await saveCurrentSearch(name, filters)
    setSubmitting(false)
    if (res.ok) setSaved(true)
    else setError(res.error)
  }

  return (
    <form onSubmit={onSubmit} style={{ ...containerStyle, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this search…"
        style={{
          flex: '1 1 240px',
          background: 'rgba(255,255,255,0.95)',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          color: '#100E0B',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? '#9C9488' : '#B84A1E',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Saving…' : 'Save & enable alerts'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer' }}
      >
        Cancel
      </button>
      {error && (
        <div style={{ width: '100%', color: '#FCA5A5', fontSize: '12px' }}>{error}</div>
      )}
    </form>
  )
}

function defaultName(f: SavedSearchFilters): string {
  const parts: string[] = []
  if (f.bhk) parts.push(`${f.bhk} BHK`)
  if (f.property_type) parts.push(f.property_type)
  if (f.localities?.length) parts.push(f.localities.join(' / '))
  if (f.type) parts.push(f.type === 'rent' ? 'rent' : 'sale')
  return parts.length ? parts.join(' ') : 'My search'
}

function filtersToParams(f: SavedSearchFilters): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(f)) {
    if (Array.isArray(v)) {
      // SaveSearchButton's signin link only needs a string representation for next=
      out[k] = v.join(',')
    } else if (v) {
      out[k] = String(v)
    }
  }
  return out
}

const containerStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.25)',
  borderRadius: '12px',
  padding: '12px 16px',
}
