'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Property } from '@/lib/supabase'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'
import PropertyCard from '@/components/PropertyCard'
import { getFavorites } from '@/components/FavoriteButton'

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true)
  const [favorites, setFavoritesList] = useState<Property[]>([])

  useEffect(() => {
    async function load() {
      const ids = getFavorites()
      if (ids.length === 0) {
        setLoading(false)
        return
      }
      const supabase = createSupabaseBrowserClient()
      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids)
        .eq('status', 'verified')
      setFavoritesList((data as unknown as Property[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '60px 5vw 40px', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(32px,5vw,44px)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Your <em style={{ color: '#E8732F', fontStyle: 'italic' }}>saved</em> properties
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
            Saved on this device · {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 5vw 96px', background: '#FAF7F2', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9C9488' }}>
              Loading your saved properties…
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '2px dashed #DDD7CF', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>♥</div>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>No saved properties yet</h3>
              <p style={{ fontSize: '14px', color: '#9C9488', lineHeight: 1.65, marginBottom: '24px' }}>
                Click the heart icon on any property card to save it here for later.
              </p>
              <Link href="/rent" style={{ background: '#B84A1E', color: '#fff', padding: '13px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Browse Properties
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {favorites.map(p => <PropertyCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
