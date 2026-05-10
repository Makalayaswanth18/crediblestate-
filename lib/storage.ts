import { supabase } from './supabase'

const BUCKET = 'property-images'

/**
 * Upload an image File to Supabase Storage and return its public URL.
 * Returns null if upload fails.
 */
export async function uploadPropertyImage(
  file: File,
  prefix: string = 'listing',
): Promise<string | null> {
  if (!file || file.size === 0) return null

  // Sanity checks
  if (file.size > 5_242_880) return null
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) return null

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadMultipleImages(
  files: File[],
  prefix: string = 'listing',
): Promise<string[]> {
  const validFiles = files.filter(f => f && f.size > 0 && f.size <= 5_242_880)
  const results = await Promise.all(validFiles.map(f => uploadPropertyImage(f, prefix)))
  return results.filter((url): url is string => url !== null)
}
