'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type UpdateResult = { ok: true } | { ok: false; error: string }

export async function updateProperty(id: string, formData: FormData): Promise<UpdateResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated. Please sign in again.' }

  const title = String(formData.get('title') || '').trim().slice(0, 150)
  const locality = String(formData.get('locality') || '').trim().slice(0, 80)
  const price = Number(formData.get('price') || 0)
  if (!title || !locality || !price || price <= 0 || !Number.isFinite(price) || price > 1e12) {
    return { ok: false, error: 'Title, locality, and a valid price are required.' }
  }

  // Whitelist enum values — DB has CHECK constraints but failing early gives a
  // friendlier error than a generic DB violation.
  const ALLOWED_LISTING_TYPES = ['rent', 'sale'] as const
  const ALLOWED_PROPERTY_TYPES = ['flat', 'villa', 'pg', 'plot', 'commercial'] as const
  const rawListingType = String(formData.get('listing_type') || 'rent')
  const rawPropertyType = String(formData.get('property_type') || 'flat')
  const listing_type = (ALLOWED_LISTING_TYPES as readonly string[]).includes(rawListingType)
    ? rawListingType
    : 'rent'
  const property_type = (ALLOWED_PROPERTY_TYPES as readonly string[]).includes(rawPropertyType)
    ? rawPropertyType
    : 'flat'

  // Numeric fields — refuse negative or insane values
  const safeInt = (v: FormDataEntryValue | null, max: number) => {
    if (!v) return null
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0 || n > max) return null
    return Math.floor(n)
  }

  const updates = {
    title,
    description: String(formData.get('description') || '').trim().slice(0, 4000) || null,
    property_type,
    listing_type,
    price,
    area_sqft: safeInt(formData.get('area_sqft'), 1_000_000),
    bedrooms:  safeInt(formData.get('bedrooms'), 50),
    bathrooms: safeInt(formData.get('bathrooms'), 50),
    locality,
    city: String(formData.get('city') || 'Hyderabad').trim().slice(0, 60),
    address: String(formData.get('address') || '').trim().slice(0, 240) || null,
    has_parking: formData.get('has_parking') === 'on',
    is_gated: formData.get('is_gated') === 'on',
    is_furnished: formData.get('is_furnished') === 'on',
    agent_name: String(formData.get('agent_name') || '').trim().slice(0, 120),
    phone: String(formData.get('phone') || '').trim().slice(0, 32),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .eq('agent_id', user.id)

  if (error) {
    console.error('Update error:', error)
    return { ok: false, error: 'Could not save changes. Please try again.' }
  }

  revalidatePath('/agent/dashboard')
  return { ok: true }
}
