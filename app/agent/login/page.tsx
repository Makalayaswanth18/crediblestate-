'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendMagicLink } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await sendMagicLink(email)
    setSubmitting(false)
    if (res.ok) {
      setSent(true)
    } else {
      setError(res.error)
    }
  }

  return (
    <section style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 5vw' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '24px', padding: '48px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '28px', fontWeight: 400, marginBottom: '14px' }}>Check your email</h1>
            <p style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.65, marginBottom: '24px' }}>
              We sent a magic login link to <strong>{email}</strong>. Click it to sign in. The link works for 1 hour.
            </p>
            <p style={{ fontSize: '13px', color: '#9C9488', lineHeight: 1.6 }}>
              Didn&apos;t get it? Check spam folder, or{' '}
              <button onClick={() => { setSent(false); setEmail('') }} style={{ background: 'none', border: 'none', color: '#B84A1E', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
                try a different email
              </button>
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', fontWeight: 700, marginBottom: '6px', color: '#100E0B' }}>
                Credible<span style={{ color: '#9C9488', fontWeight: 400 }}>State</span>
              </div>
              <p style={{ fontSize: '14px', color: '#9C9488' }}>Agent Login</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '14px 16px', fontSize: '15px', border: '1px solid #DDD7CF', borderRadius: '11px', background: '#FAF7F2', outline: 'none', marginBottom: '16px', fontFamily: 'inherit' }}
              />

              {error && (
                <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? '#9C9488' : '#B84A1E',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '11px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Sending magic link…' : 'Send Magic Link'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '13px', color: '#9C9488', textAlign: 'center', lineHeight: 1.6 }}>
              We&apos;ll email you a one-click login link.<br />No password needed, ever.
            </p>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '0.5px solid #EEEAE3', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#4A4238', marginBottom: '6px' }}>New to CredibleState?</p>
              <Link href="/list" style={{ fontSize: '14px', color: '#B84A1E', fontWeight: 600, textDecoration: 'none' }}>
                List your first property →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
