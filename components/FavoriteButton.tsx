'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'crediblestate_favorites'

export default function FavoriteButton({ propertyId, size = 'sm' }: { propertyId: string; size?: 'sm' | 'md' }) {
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const list = getFavorites()
    setSaved(list.includes(propertyId))
  }, [propertyId])

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const list = getFavorites()
    const updated = saved ? list.filter(id => id !== propertyId) : [...list, propertyId]
    setFavorites(updated)
    setSaved(!saved)
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
