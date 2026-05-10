import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Support both new (PUBLISHABLE_KEY) and legacy (ANON_KEY) env var names
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions matching our database schema
export type Property = {
  id: string
  slug: string
  title: string
  description: string | null
  property_type: 'flat' | 'villa' | 'pg' | 'plot' | 'commercial'
  listing_type: 'rent' | 'sale'
  price: number
  area_sqft: number | null
  bedrooms: number | null
  bathrooms: number | null
  locality: string
  city: string
  address: string | null
  has_parking: boolean
  is_gated: boolean
  is_furnished: boolean
  amenities: string[] | null
  images: string[] | null
  agent_name: string | null
  phone: string | null
  whatsapp: string | null
  status: 'pending' | 'verified' | 'rejected' | 'rented' | 'sold'
  created_at: string
  updated_at: string
}

export type Inquiry = {
  id: string
  property_id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  created_at: string
}
