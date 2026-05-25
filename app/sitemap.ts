import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { POPULAR_LOCALITIES } from '@/lib/localities'

const SITE_URL = 'https://crediblestate.com'

export const revalidate = 3600 // refresh hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/rent`, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/rent?type=rent`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/rent?type=sale`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/list`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/verified`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Locality landing pages
  const localityPages: MetadataRoute.Sitemap = POPULAR_LOCALITIES.map(loc => ({
    url: `${SITE_URL}/rent/${loc.slug}`,
    changeFrequency: 'daily',
    priority: 0.85,
  }))

  // All verified property pages
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase
      .from('properties')
      .select('slug, updated_at')
      .eq('status', 'verified')
      .limit(5000)

    if (data) {
      propertyPages = data.map((p: { slug: string; updated_at: string }) => ({
        url: `${SITE_URL}/property/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (err) {
    console.error('Sitemap error:', err)
  }

  return [...staticPages, ...localityPages, ...propertyPages]
}
