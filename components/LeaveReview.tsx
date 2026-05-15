'use client'

import { useEffect, useState } from 'react'
import { submitReview, getReviewForConversation } from '@/app/messages/review-actions'

export default function LeaveReview({
  conversationId,
  agentId,
  propertyId,
}: {
  conversationId: string
  agentId: string
  propertyId: string
}) {
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<{ rating: number; body: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getReviewForConversation(conversationId).then((existing) => {
      if (!mounted) return
      if (existing) {
        setSubmitted({ rating: existing.rating, body: existing.body })
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [conversationId])

  if (loading) return null

  if (submitted) {
    return (
      <div style={card}>
        <h3 style={cardTitle}>You rated this agent</h3>
        <div style={{ fontSize: '20px', color: '#E8732F', marginBottom: '8px' }}>
          {'★'.repeat(submitted.rating)}{'☆'.repeat(5 - submitted.rating)}
        </div>
        {submitted.body && (
          <p style={{ fontSize: '14px', color: '#4A4238', lineHeight: 1.6 }}>&ldquo;{submitted.body}&rdquo;</p>
        )}
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      setError('Please pick a rating.')
      return
    }
    setError(null)
    setSubmitting(true)
    const res = await submitReview({
      conversationId,
      agentId,
      propertyId,
      rating,
      body: body.trim() || null,
    })
    setSubmitting(false)
    if (res.ok) setSubmitted({ rating, body: body.trim() || null })
    else setError(res.error)
  }

  return (
    <form onSubmit={onSubmit} style={card}>
      <h3 style={cardTitle}>How did it go?</h3>
      <p style={{ fontSize: '13px', color: '#9C9488', marginBottom: '14px' }}>
        Your review helps other buyers pick credible agents. It will appear on the agent&apos;s public profile.
      </p>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              color: (hover || rating) >= n ? '#E8732F' : '#DDD7CF',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
            }}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Anything you'd want a future buyer to know? (optional)"
        rows={3}
        maxLength={1500}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '0.5px solid #DDD7CF',
          borderRadius: '8px',
          background: '#FAF7F2',
          outline: 'none',
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          marginBottom: '12px',
        }}
      />
      {error && (
        <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: submitting ? '#9C9488' : '#B84A1E',
          color: '#fff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Posting…' : 'Post review'}
      </button>
    </form>
  )
}

const card: React.CSSProperties = {
  background: '#fff',
  padding: '24px',
  borderRadius: '16px',
  border: '0.5px solid #DDD7CF',
}

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), serif',
  fontSize: '20px',
  fontWeight: 400,
  color: '#100E0B',
  marginBottom: '8px',
}
