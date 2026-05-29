'use client'

import { useEffect, useState } from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendMagicLink, verifyEmailOtp } from '@/app/agent/login/actions'

function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || ''
  const intent = params.get('intent') === 'agent' ? 'agent' : 'buyer'
  const queryError = params.get('error')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Magic link callback error handling (kept as fallback — the link still works,
  // it's just less reliable thanks to Gmail prefetching)
  useEffect(() => {
    if (!queryError) return
    let message = 'Your sign-in link couldn\'t be used. Use the 6-digit code instead.'
    if (typeof window !== 'undefined' && window.location.hash) {
      const frag = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const errCode = frag.get('error_code')
      const desc = frag.get('error_description')
      if (errCode === 'otp_expired') {
        message = 'That link expired or was already used. Request a new code below.'
      } else if (errCode === 'access_denied' || desc) {
        message = desc?.replace(/\+/g, ' ') ?? message
      }
      const sp = new URLSearchParams(window.location.search)
      sp.delete('error')
      const qs = sp.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : ''))
    }
    setError(message)
  }, [queryError])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await sendMagicLink(email, { next, intent })
    setSubmitting(false)
    if (res.ok) setSent(true)
    else setError(res.error)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setVerifying(true)
    const res = await verifyEmailOtp(email, code, { next, intent })
    setVerifying(false)
    if (res.ok) {
      router.push(res.redirectTo)
      router.refresh()
    } else {
      setError(res.error)
    }
  }

  return (
    <section style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 5vw' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '24px', padding: '48px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        {sent ? (
          /* ===== Step 2: enter 6-digit code ===== */
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '14px' }}>📧</div>
              <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', fontWeight: 400, marginBottom: '10px', color: '#100E0B' }}>
                Enter the code
              </h1>
              <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.6 }}>
                We emailed a <strong>verification code</strong> to <strong>{email}</strong>.
                <br />
                Open the email and type the code below.
              </p>
            </div>

            <form onSubmit={handleVerifyCode}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={10}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="••••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '18px 16px',
                  fontSize: '24px',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  border: '1px solid #DDD7CF',
                  borderRadius: '11px',
                  background: '#FAF7F2',
                  outline: 'none',
                  marginBottom: '16px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#100E0B',
                }}
              />

              {error && (
                <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || code.length < 4}
                style={{
                  width: '100%',
                  background: verifying || code.length < 4 ? '#9C9488' : '#B84A1E',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '11px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: verifying || code.length < 4 ? 'not-allowed' : 'pointer',
                  marginBottom: '14px',
                }}
              >
                {verifying ? 'Verifying…' : 'Verify & sign in'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#9C9488', lineHeight: 1.6 }}>
              No code in the email?{' '}
              <button
                onClick={() => { setSent(false); setCode(''); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#B84A1E', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
              >
                Send a new one
              </button>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                The email also has a link — clicking it works too.
              </span>
            </div>
          </>
        ) : (
          /* ===== Step 1: enter email ===== */
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', fontWeight: 700, marginBottom: '6px', color: '#100E0B' }}>
                Credible<span style={{ color: '#9C9488', fontWeight: 400 }}>State</span>
              </div>
              <p style={{ fontSize: '14px', color: '#9C9488' }}>
                {intent === 'agent' ? 'Agent sign in' : 'Sign in or create account'}
              </p>
            </div>

            <form onSubmit={handleSendCode}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>Email address</label>
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
                {submitting ? 'Sending code…' : 'Send code to email'}
              </button>
            </form>

            <p style={{ marginTop: '24px', fontSize: '13px', color: '#9C9488', textAlign: 'center', lineHeight: 1.6 }}>
              We&apos;ll email you a 6-digit code.<br />No password needed, ever.
            </p>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '0.5px solid #EEEAE3', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#4A4238', marginBottom: '6px' }}>
                {intent === 'agent' ? 'Looking for a home instead?' : 'Have a property to list?'}
              </p>
              <Link
                href={intent === 'agent' ? '/signin' : '/signin?intent=agent'}
                style={{ fontSize: '14px', color: '#B84A1E', fontWeight: 600, textDecoration: 'none' }}
              >
                {intent === 'agent' ? 'Sign in as buyer →' : 'I\'m an agent →'}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
