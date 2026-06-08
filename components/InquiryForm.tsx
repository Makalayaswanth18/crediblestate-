'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { submitInquiry } from '@/app/property/[slug]/inquiry-action'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export default function InquiryForm({
  propertyId,
  propertyTitle,
}: {
  propertyId: string
  propertyTitle: string
}) {
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    // Read session client-side so the wrapping page can stay statically cached.
    const s = createSupabaseBrowserClient()
    s.auth.getSession().then((res: { data: { session: unknown } }) => {
      setIsSignedIn(!!res.data.session)
    })
  }, [])

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError(null)
    const res = await submitInquiry(propertyId, formData)
    setSubmitting(false)
    if (res.ok) {
      setSentTo(res.conversationId)
      try { track('inquiry_submitted', { property_id: propertyId }) } catch {}
    } else {
      setError(res.error)
    }
  }

  if (sentTo) {
    return (
      <div style={{ background: '#EBF5EF', border: '0.5px solid #B8DBC6', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1E4D35', marginBottom: '6px' }}>Message sent!</h4>
        <p style={{ fontSize: '13px', color: '#4A4238', lineHeight: 1.6, marginBottom: isSignedIn ? '12px' : 0 }}>
          The owner will get back to you shortly. Meanwhile, you can also WhatsApp them directly using the button above.
        </p>
        {isSignedIn && (
          <Link
            href={`/messages/${sentTo}`}
            style={{
              display: 'inline-block',
              background: '#1E4D35',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Open conversation →
          </Link>
        )}
      </div>
    )
  }

  return (
    <form action={handleSubmit} style={{ background: '#FAF7F2', border: '0.5px solid #EEEAE3', borderRadius: '12px', padding: '18px', display: 'grid', gap: '10px' }}>
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#100E0B', marginBottom: '4px' }}>📞 Request a callback</h4>
        <p style={{ fontSize: '12px', color: '#9C9488', lineHeight: 1.5 }}>Owner will get back to you within 4 hours.</p>
      </div>
      <input
        name="name"
        placeholder="Your name"
        required
        style={inputStyle}
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (e.g., +919876543210)"
        required
        style={inputStyle}
      />
      <input
        name="email"
        type="email"
        placeholder="Email (optional)"
        style={inputStyle}
      />
      <textarea
        name="message"
        placeholder="Anything specific to ask?"
        rows={2}
        defaultValue={`Hi, I'm interested in "${propertyTitle}". Please call me back.`}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        required
      />

      {error && (
        <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? '#9C9488' : '#100E0B',
          color: '#fff',
          border: 'none',
          padding: '12px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Sending…' : isSignedIn ? 'Send Message' : 'Request Callback'}
      </button>

      {!isSignedIn && (
        <p style={{ fontSize: '11px', color: '#9C9488', textAlign: 'center', marginTop: '2px' }}>
          <Link href="/signin" style={{ color: '#B84A1E' }}>Sign in</Link> to track replies in your inbox.
        </p>
      )}
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '0.5px solid #DDD7CF',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '13px',
  color: '#100E0B',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
}
