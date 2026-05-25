'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { uploadMultipleImages } from '@/lib/storage'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export type ListResult =
  | { ok: true; slug: string }
  | { ok: false; error: string }

export async function submitProperty(formData: FormData): Promise<ListResult> {
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const property_type = String(formData.get('property_type') || 'flat')
  const listing_type = String(formData.get('listing_type') || 'rent')
  const price = Number(formData.get('price') || 0)
  const area_sqft = formData.get('area_sqft') ? Number(formData.get('area_sqft')) : null
  const bedrooms = formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null
  const bathrooms = formData.get('bathrooms') ? Number(formData.get('bathrooms')) : null
  const locality = String(formData.get('locality') || '').trim()
  const city = String(formData.get('city') || 'Hyderabad').trim()
  const address = String(formData.get('address') || '').trim() || null
  const has_parking = formData.get('has_parking') === 'on'
  const is_gated = formData.get('is_gated') === 'on'
  const is_furnished = formData.get('is_furnished') === 'on'
  const agent_name = String(formData.get('agent_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const whatsapp = String(formData.get('whatsapp') || phone).trim()
  const owner_listed = formData.get('owner_listed') === 'true'

  if (!title || !locality || !price || !agent_name || !phone) {
    return { ok: false, error: 'Please fill in title, locality, price, your name, and phone.' }
  }

  // Upload images if any
  const imageFiles = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0)
  const slugBase = slugify(title)
  const imageUrls = imageFiles.length > 0 ? await uploadMultipleImages(imageFiles, slugBase) : []

  const slug = `${slugBase}-${Date.now().toString().slice(-5)}`

  // Link to signed-in user; if they're listing as owner, promote their role
  const ssr = await createSupabaseServerClient()
  const { data: { user } } = await ssr.auth.getUser()

  if (user && owner_listed) {
    // Promote buyer → owner (never downgrade an agent)
    await ssr
      .from('profiles')
      .update({ role: 'owner' })
      .eq('id', user.id)
      .eq('role', 'buyer')
  }

  const { error } = await supabase.from('properties').insert({
    slug,
    title,
    description: description || null,
    property_type,
    listing_type,
    price,
    area_sqft,
    bedrooms,
    bathrooms,
    locality,
    city,
    address,
    has_parking,
    is_gated,
    is_furnished,
    amenities: [],
    images: imageUrls,
    agent_name,
    phone,
    whatsapp,
    owner_listed,
    status: 'pending',
    agent_id: user?.id || null,
  })

  if (error) {
    console.error('Insert error:', error)
    return { ok: false, error: 'Could not submit listing. Please try again or WhatsApp us.' }
  }

  revalidatePath('/')
  revalidatePath('/rent')

  return { ok: true, slug }
}
