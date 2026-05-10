-- ============================================================
-- Migration 002 — Property images bucket
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Create the public bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,  -- 5 MB max per file
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Public can read images
drop policy if exists "Public can read property images" on storage.objects;
create policy "Public can read property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- Anyone (incl. anonymous form submitters) can upload — file size + mime type protect us
drop policy if exists "Anyone can upload property images" on storage.objects;
create policy "Anyone can upload property images"
  on storage.objects for insert
  with check (bucket_id = 'property-images');

-- Only owners (uploader) can delete their files
drop policy if exists "Owners can delete their images" on storage.objects;
create policy "Owners can delete their images"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.uid() = owner);
