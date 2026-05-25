'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(160deg,#1A120A 0%,#2C1A0E 50%,#0E2218 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 5vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '360px', height: '360px', background: 'radial-gradient(circle,rgba(184,74,30,0.18),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '40px 36px', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>

          <h1
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: 'clamp(22px,4vw,32px)',
              fontWeight: 400,
              color: '#fff',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}
          >
            Something went wrong
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
            We hit an unexpected error. This has been logged and we&apos;ll look
            into it. Try again, or head back home.
          </p>

          {error.digest && (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginBottom: '24px', fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                background: '#B84A1E',
                color: '#fff',
                border: 'none',
                padding: '13px 28px',
                borderRadius: '11px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '13px 28px',
                borderRadius: '11px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '0.5px solid rgba(255,255,255,0.18)',
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
