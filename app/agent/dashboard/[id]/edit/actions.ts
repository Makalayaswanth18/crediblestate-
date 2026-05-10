'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type UpdateResult = { ok: true } | { ok: false; error: string }

export async function updateProperty(id: string, formData: FormData): Promise<UpdateResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated. Please sign in again.' }

  const title = String(formData.get('title') || '').trim()
  const locality = String(formData.get('locality') || '').trim()
  const price = Number(formData.get('price') || 0)
  if (!title || !locality || !price) {
    return { ok: false, error: 'Title, locality, and price are required.' }
  }

  const updates = {
    title,
    description: String(formData.get('description') || '').trim() || null,
    property_type: String(formData.get('property_type') || 'flat'),
    listing_type: String(formData.get('listing_type') || 'rent'),
    price,
    area_sqft: formData.get('area_sqft') ? Number(formData.get('area_sqft')) : null,
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
    bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : null,
    locality,
    city: String(formData.get('city') || 'Hyderabad').trim(),
    address: String(formData.get('address') || '').trim() || null,
    has_parking: formData.get('has_parking') === 'on',
    is_gated: formData.get('is_gated') === 'on',
    is_furnished: formData.get('is_furnished') === 'on',
    agent_name: String(formData.get('agent_name') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
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
