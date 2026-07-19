-- ============================================================
-- Migration 009 — Lock down profiles PII
-- Run in Supabase SQL Editor.
--
-- Problem: the "Profiles are public" policy (04_buyers_messaging_reviews.sql)
-- allows `select using (true)` on the full `profiles` row to anon +
-- authenticated. That row includes `phone` and `agent_kyc_notes`, which are
-- readable by anyone via a direct REST call to
-- /rest/v1/profiles?select=* using the public anon key — no login needed.
-- The app's own queries only ever *display* safe fields, but RLS operates
-- below the app layer, so the UI's restraint doesn't actually protect this.
--
-- Fix: restrict full-row SELECT to the owner (admins already have their own
-- "Admins manage profiles" policy from migration 004, untouched here).
-- Add a `public_profiles` view with only the fields that are meant to be
-- public, and grant that to anon/authenticated instead.
-- ============================================================

drop policy if exists "Profiles are public" on profiles;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create or replace view public.public_profiles as
select
  id,
  role,
  full_name,
  avatar_url,
  bio,
  is_verified_agent,
  agent_verified_at,
  created_at
from public.profiles;

grant select on public.public_profiles to anon, authenticated;
