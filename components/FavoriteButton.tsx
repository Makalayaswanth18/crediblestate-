'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'
import { mergeFavorites, toggleFavorite } from '@/app/account/actions'

const STORAGE_KEY = 'crediblestate_favorites'

export default function FavoriteButton({ propertyId, size = 'sm' }: { propertyId: string; size?: 'sm' | 'md' }) {
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const localList = getFavorites()
    setSaved(localList.includes(propertyId))

    // Resolve auth state. If signed in, opportunistically merge any
    // localStorage favorites into the server profile (one-time per render).
    const s = createSupabaseBrowserClient()
    s.auth.getSession().then((res: { data: { session: { user: { id: string } } | null } }) => {
      const user = res.data.session?.user
      if (!user) return
      setSignedIn(true)
      if (localList.length > 0) {
        mergeFavorites(localList).catch(() => {})
      }
    })
  }, [propertyId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Optimistic local toggle for snappy feedback (used by /favorites for anon).
    const list = getFavorites()
    const updated = saved ? list.filter((id) => id !== propertyId) : [...list, propertyId]
    setFavorites(updated)
    setSaved(!saved)

    if (signedIn) {
      // Fire-and-forget server sync; ignore the returned canonical list — local
      // and server agree because both flip the same item.
      toggleFavorite(propertyId).catch(() => {})
    }
  }

  if (!mounted) return null

  const dim = size === 'md' ? 40 : 32

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save property'}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)',
        border: '0.5px solid rgba(0,0,0,0.05)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'md' ? '18px' : '15px',
        transition: 'transform 0.15s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      }}
    >
      {saved ? '❤️' : '🤍'}
    </button>
  )
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setFavorites(list: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {}
}
