import type { SupabaseClient } from '@supabase/supabase-js'
import type { Property, SavedSearchFilters } from './supabase'

/**
 * Apply a SavedSearchFilters object to a Supabase query against the
 * `properties` table. Mirrors the filter logic on /rent (app/rent/page.tsx)
 * one-to-one so a saved-search email shows the same listings the buyer would
 * see if they re-ran the search in the browser.
 *
 * NB: the type of `query` is left loose intentionally — Supabase's
 * PostgrestFilterBuilder isn't re-exported in a form we can name without a
 * lot of generics gymnastics, and every method we use returns the same shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySavedSearchFilters(query: any, filters: SavedSearchFilters): any {
  if (!filters) return query

  if (filters.type === 'rent' || filters.type === 'sale') {
    query = query.eq('listing_type', filters.type)
  }
  if (filters.property_type) {
    query = query.eq('property_type', filters.property_type)
  }
  if (filters.localities && filters.localities.length > 0) {
    const orExpr = filters.localities
      .map((loc) => `locality.ilike.%${loc.replace(/[,]/g, '')}%`)
      .join(',')
    query = query.or(orExpr)
  }
  if (filters.bhk) {
    if (filters.bhk === '4+') {
      query = query.gte('bedrooms', 4)
    } else {
      const n = Number(filters.bhk)
      if (Number.isFinite(n)) query = query.eq('bedrooms', n)
    }
  }
  if (filters.min) query = query.gte('price', Number(filters.min))
  if (filters.max) query = query.lte('price', Number(filters.max))
  if (filters.furnished === 'yes') query = query.eq('is_furnished', true)
  if (filters.parking === 'yes') query = query.eq('has_parking', true)
  if (filters.gated === 'yes') query = query.eq('is_gated', true)
  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,locality.ilike.%${filters.q}%`,
    )
  }
  return query
}

/**
 * Find new verified listings created since `since` that match the saved
 * search's filters. Returns at most `limit` rows, newest first.
 */
export async function findMatchesForSavedSearch(
  supabase: SupabaseClient,
  filters: SavedSearchFilters,
  since: string | null,
  limit = 5,
): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select('id, slug, title, description, locality, city, price, listing_type, bedrooms, bathrooms, area_sqft, property_type, images, has_parking, is_gated, is_furnished, agent_id, agent_name, created_at')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Only listings newer than the last alert. If the search has never been
  // alerted, fall back to 7 days so the first batch isn't an empty digest.
  const cutoff = since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  query = query.gt('created_at', cutoff)

  query = applySavedSearchFilters(query, filters)

  const { data, error } = await query
  if (error) {
    console.error('findMatchesForSavedSearch error:', error)
    return []
  }
  return (data as Property[]) ?? []
}
