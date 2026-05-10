'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitProperty, type ListResult } from './actions'
import ImageUpload from '@/components/ImageUpload'

export default function ListPage() {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ListResult | null>(null)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    const res = await submitProperty(formData)
    setResult(res)
    setSubmitting(false)
    if (res.ok) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (result?.ok) {
    return (
      <section style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(160deg,#1A120A,#2C1A0E,#0E2218)', padding: '80px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '520px', textAlign: 'center', background: '#fff', borderRadius: '24px', padding: '56px 40px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', fontWeight: 400, marginBottom: '14px', color: '#100E0B' }}>
            Listing submitted!
          </h1>
          <p style={{ fontSize: '15px', color: '#4A4238', lineHeight: 1.7, marginBottom: '28px' }}>
            Our team will physically verify your property within <strong>24–48 hours</strong>. You&apos;ll get a WhatsApp message once it goes live on CredibleState. Zero brokerage, always.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ background: '#B84A1E', color: '#fff', padding: '13px 26px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Back to Home
            </Link>
            <Link href="/rent" style={{ background: '#F0EBE3', color: '#100E0B', padding: '13px 26px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Browse Other Listings
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '60px 5vw', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '20px' }}>
            For Owners & Agents
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, marginBottom: '14px', letterSpacing: '-0.01em' }}>
            List Your Property — <em style={{ color: '#E8732F', fontStyle: 'italic' }}>100% Free</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
            Fill in the basics — we verify your property in person within 48 hours, then publish it to thousands of verified renters and buyers across Hyderabad.
          </p>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: '64px 5vw 96px', background: '#FAF7F2' }}>
        <form
          action={handleSubmit}
          style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '20px', border: '0.5px solid #DDD7CF', display: 'grid', gap: '20px' }}
        >
          <Section title="Property details">
            <Field label="Listing title *" name="title" placeholder="e.g., 2BHK Furnished Flat in Kondapur" required />
            <Row>
              <Select label="Listing type *" name="listing_type" options={[['rent', 'For Rent'], ['sale', 'For Sale']]} required />
              <Select label="Property type *" name="property_type" options={[['flat', 'Flat / Apartment'], ['villa', 'Villa'], ['pg', 'PG / Hostel'], ['plot', 'Plot / Land'], ['commercial', 'Commercial']]} required />
            </Row>
            <Row>
              <Field label="Monthly rent / Sale price (₹) *" name="price" type="number" placeholder="18000" required />
              <Field label="Carpet area (sqft)" name="area_sqft" type="number" placeholder="1150" />
            </Row>
            <Row>
              <Field label="Bedrooms" name="bedrooms" type="number" placeholder="2" />
              <Field label="Bathrooms" name="bathrooms" type="number" placeholder="2" />
            </Row>
            <Field
              label="Description"
              name="description"
              placeholder="Tell renters about the property — location highlights, amenities, condition..."
              textarea
            />
          </Section>

          <Section title="Location">
            <Row>
              <Field label="Locality *" name="locality" placeholder="e.g., Kondapur" required />
              <Field label="City" name="city" defaultValue="Hyderabad" />
            </Row>
            <Field label="Full address (kept private until inquiry)" name="address" placeholder="Building name, street, pincode" />
          </Section>

          <Section title="Photos">
            <ImageUpload />
          </Section>

          <Section title="Highlights">
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Checkbox name="has_parking" label="Parking available" />
              <Checkbox name="is_gated" label="Gated community" />
              <Checkbox name="is_furnished" label="Furnished" />
            </div>
          </Section>

          <Section title="Your contact">
            <Row>
              <Field label="Your name *" name="agent_name" placeholder="Ramesh Kumar" required />
              <Field label="Phone *" name="phone" type="tel" placeholder="+919876543210" required />
            </Row>
            <Field label="WhatsApp (if different)" name="whatsapp" type="tel" placeholder="+919876543210" />
            <p style={{ fontSize: '12px', color: '#9C9488', lineHeight: 1.6 }}>
              Your phone is hidden from the public. Renters contact you only via the WhatsApp button on your verified listing.
            </p>
          </Section>

          {result && !result.ok && (
            <div style={{ background: '#FEF2F2', border: '0.5px solid #FCA5A5', color: '#991B1B', padding: '14px', borderRadius: '10px', fontSize: '13px' }}>
              {result.error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#9C9488' : '#B84A1E',
              color: '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '11px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit for Verification'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9C9488' }}>
            By submitting, you agree to a free physical verification by our team within 48 hours.
          </p>
        </form>
      </section>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 400, marginBottom: '14px', color: '#100E0B', borderBottom: '0.5px solid #EEEAE3', paddingBottom: '10px' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '14px' }}>{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
      {children}
    </div>
  )
}

function Field({
  label, name, placeholder, type = 'text', required = false, textarea = false, defaultValue,
}: {
  label: string; name: string; placeholder?: string; type?: string; required?: boolean; textarea?: boolean; defaultValue?: string
}) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>{label}</div>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          rows={4}
          style={{ ...inputBase, resize: 'vertical', fontFamily: 'inherit' }}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          style={inputBase}
        />
      )}
    </label>
  )
}

function Select({
  label, name, options, required = false,
}: {
  label: string; name: string; options: [string, string][]; required?: boolean
}) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>{label}</div>
      <select name={name} required={required} style={inputBase}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#4A4238', background: '#F8F4ED', padding: '10px 16px', borderRadius: '10px', border: '0.5px solid #DDD7CF' }}>
      <input type="checkbox" name={name} style={{ width: '16px', height: '16px', accentColor: '#B84A1E' }} />
      {label}
    </label>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#FAF7F2',
  border: '0.5px solid #DDD7CF',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '14px',
  color: '#100E0B',
  outline: 'none',
  fontFamily: 'inherit',
}
