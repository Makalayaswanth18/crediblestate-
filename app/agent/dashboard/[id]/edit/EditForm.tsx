'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Property } from '@/lib/supabase'
import { updateProperty } from './actions'

export default function EditForm({ property }: { property: Property }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setSubmitting(true)
    setError(null)
    const res = await updateProperty(property.id, formData)
    setSubmitting(false)
    if (res.ok) {
      router.push('/agent/dashboard')
    } else {
      setError(res.error)
    }
  }

  return (
    <>
      <section style={{ background: 'linear-gradient(160deg,#1A120A,#2C1A0E)', padding: '48px 5vw', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, marginBottom: '8px', letterSpacing: '-0.01em' }}>
            Edit your listing
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Changes will be re-verified before going live.</p>
        </div>
      </section>

      <section style={{ padding: '40px 5vw 96px', background: '#FAF7F2' }}>
        <form action={handleSubmit} style={{ maxWidth: '720px', margin: '0 auto', background: '#fff', padding: '36px', borderRadius: '20px', border: '0.5px solid #DDD7CF', display: 'grid', gap: '16px' }}>

          <Field label="Title *" name="title" defaultValue={property.title} required />
          <Field label="Description" name="description" defaultValue={property.description || ''} textarea />
          <Row>
            <Select label="Listing type" name="listing_type" defaultValue={property.listing_type} options={[['rent', 'For Rent'], ['sale', 'For Sale']]} />
            <Select label="Property type" name="property_type" defaultValue={property.property_type} options={[['flat', 'Flat'], ['villa', 'Villa'], ['pg', 'PG'], ['plot', 'Plot'], ['commercial', 'Commercial']]} />
          </Row>
          <Row>
            <Field label="Price (₹) *" name="price" type="number" defaultValue={String(property.price)} required />
            <Field label="Area (sqft)" name="area_sqft" type="number" defaultValue={property.area_sqft ? String(property.area_sqft) : ''} />
          </Row>
          <Row>
            <Field label="Bedrooms" name="bedrooms" type="number" defaultValue={property.bedrooms != null ? String(property.bedrooms) : ''} />
            <Field label="Bathrooms" name="bathrooms" type="number" defaultValue={property.bathrooms != null ? String(property.bathrooms) : ''} />
          </Row>
          <Row>
            <Field label="Locality *" name="locality" defaultValue={property.locality} required />
            <Field label="City" name="city" defaultValue={property.city} />
          </Row>
          <Field label="Address" name="address" defaultValue={property.address || ''} />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Checkbox name="has_parking" label="Parking" defaultChecked={property.has_parking} />
            <Checkbox name="is_gated" label="Gated" defaultChecked={property.is_gated} />
            <Checkbox name="is_furnished" label="Furnished" defaultChecked={property.is_furnished} />
          </div>
          <Row>
            <Field label="Your name" name="agent_name" defaultValue={property.agent_name || ''} />
            <Field label="Phone" name="phone" defaultValue={property.phone || ''} />
          </Row>

          {error && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => router.push('/agent/dashboard')} style={{ flex: 1, background: '#F0EBE3', color: '#100E0B', border: 'none', padding: '14px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ flex: 2, background: submitting ? '#9C9488' : '#B84A1E', color: '#fff', border: 'none', padding: '14px', borderRadius: '11px', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>{children}</div>
}

function Field({ label, name, type = 'text', defaultValue, required = false, textarea = false }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; textarea?: boolean }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>{label}</div>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} required={required} rows={4} style={{ ...inputBase, resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} required={required} style={inputBase} />
      )}
    </label>
  )
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: [string, string][] }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4A4238', marginBottom: '6px' }}>{label}</div>
      <select name={name} defaultValue={defaultValue} style={inputBase}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#4A4238', background: '#F8F4ED', padding: '10px 16px', borderRadius: '10px', border: '0.5px solid #DDD7CF' }}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} style={{ width: '16px', height: '16px', accentColor: '#B84A1E' }} />
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
