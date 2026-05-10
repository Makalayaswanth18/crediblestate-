'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export type InquiryResult = { ok: true } | { ok: false; error: string }

export async function submitInquiry(propertyId: string, formData: FormData): Promise<InquiryResult> {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const email = String(formData.get('email') || '').trim() || null
  const message = String(formData.get('message') || '').trim() || null

  if (!name || !phone) {
    return { ok: false, error: 'Please share your name and phone so the owner can reach you.' }
  }
  if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
    return { ok: false, error: 'Please enter a valid phone number.' }
  }

  const { error } = await supabase.from('inquiries').insert({
    property_id: propertyId,
    name,
    phone,
    email,
    message,
  })

  if (error) {
    console.error('Inquiry insert error:', error)
    return { ok: false, error: 'Could not send. Please WhatsApp the owner directly.' }
  }

  revalidatePath('/agent/inquiries')
  return { ok: true }
}
