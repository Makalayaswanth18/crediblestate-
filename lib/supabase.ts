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
  owner_listed: boolean
  agent_id: string | null
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

// ===========================================
// New types — buyer accounts, messaging, reviews
// (added in migration 004)
// ===========================================

export type UserRole = 'buyer' | 'agent' | 'owner'

export type Profile = {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  is_verified_agent: boolean
  agent_verified_at: string | null
  agent_kyc_notes: string | null
  favorites: string[]
  created_at: string
  updated_at: string
}

export type ConversationStatus =
  | 'open'
  | 'closed_rented'
  | 'closed_sold'
  | 'closed_other'

export type Conversation = {
  id: string
  property_id: string
  buyer_id: string | null
  agent_id: string | null
  buyer_name: string
  buyer_phone: string
  buyer_email: string | null
  status: ConversationStatus
  last_message_at: string
  last_message_preview: string | null
  created_at: string
  updated_at: string
}

export type MessageRole = 'buyer' | 'agent' | 'system'

export type Message = {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_role: MessageRole
  body: string
  created_at: string
}

export type SavedSearchFilters = {
  q?: string
  type?: 'rent' | 'sale'
  property_type?: string
  localities?: string[]
  bhk?: string
  min?: string
  max?: string
  furnished?: 'yes' | 'no'
  parking?: 'yes' | 'no'
  gated?: 'yes' | 'no'
  owner_only?: 'yes'
}

export type SavedSearch = {
  id: string
  buyer_id: string
  name: string
  filters: SavedSearchFilters
  email_alerts: boolean
  last_alerted_at: string | null
  created_at: string
}

export type Review = {
  id: string
  agent_id: string
  buyer_id: string | null
  conversation_id: string | null
  property_id: string | null
  rating: number
  body: string | null
  created_at: string
}

export type AgentRatingSummary = {
  agent_id: string
  review_count: number
  rating_avg: number | null
}
