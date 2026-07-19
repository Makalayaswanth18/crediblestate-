cd ~/crediblestate

# 1. Add the migration file to your repo (record of the DB change —
#    you still have to run the SQL in Supabase's SQL Editor separately)
mkdir -p db/migrations
cat > db/migrations/009_lock_down_profiles_pii.sql << 'EOF'
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
EOF

# 2. Repoint the 3 places that show OTHER users' profiles publicly
#    at the new safe view instead of the raw table.
sed -i '' "s|supabase.from('profiles').select('\*').eq('id', id).maybeSingle()|supabase.from('public_profiles').select('*').eq('id', id).maybeSingle()|" "app/agent/[id]/page.tsx"
sed -i '' "s|supabase.from('profiles').select('\*').eq('id', c.agent_id).maybeSingle()|supabase.from('public_profiles').select('*').eq('id', c.agent_id).maybeSingle()|" "app/messages/[id]/page.tsx"
sed -i '' "s|supabase.from('profiles').select('id, full_name, is_verified_agent').eq('id', p.agent_id).maybeSingle()|supabase.from('public_profiles').select('id, full_name, is_verified_agent').eq('id', p.agent_id).maybeSingle()|" "app/property/[slug]/page.tsx"

# 3. Add baseline security headers to next.config.ts
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

/**
 * Cache headers for anonymous traffic.
 *
 * Why `CDN-Cache-Control` and not just `Cache-Control`?
 * Vercel intentionally rewrites outgoing `Cache-Control` headers — it strips
 * `s-maxage` and `stale-while-revalidate` and replaces them with
 * `public, max-age=0, must-revalidate` so browsers always re-request. That's
 * fine for protecting against stale client caches, but it kills our ability
 * to let a CDN (Cloudflare) cache HTML in front of Vercel.
 *
 * Vercel passes `CDN-Cache-Control` through untouched. Cloudflare reads
 * `CDN-Cache-Control` with higher priority than `Cache-Control`, so this is
 * what we use to tell Cloudflare's edge "cache for 2 min, serve stale for
 * 10 min while revalidating."
 *
 * Authenticated pages set `CDN-Cache-Control: private, no-store` so
 * Cloudflare's edge never caches them — these all go cookie-aware to the
 * Vercel origin every request.
 */
const PUBLIC_CDN_CACHE   = 'public, s-maxage=120, stale-while-revalidate=600'
const PROPERTY_CDN_CACHE = 'public, s-maxage=300, stale-while-revalidate=1800'
const NO_CDN_CACHE       = 'private, no-store'

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Baseline security headers — applies to every route.
      // Not included: Content-Security-Policy. A CSP needs to be built against
      // every third-party origin this app actually calls (Supabase REST +
      // Realtime websocket, Resend, image hosts) or it'll break the site.
      // Worth doing as a follow-up, tested in staging first.
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },

      // Public listing pages — short freshness, long stale window.
      { source: '/',                                  headers: [{ key: 'CDN-Cache-Control', value: PUBLIC_CDN_CACHE }] },
      { source: '/rent',                              headers: [{ key: 'CDN-Cache-Control', value: PUBLIC_CDN_CACHE }] },
      { source: '/rent/:locality',                    headers: [{ key: 'CDN-Cache-Control', value: PUBLIC_CDN_CACHE }] },
      { source: '/about',                             headers: [{ key: 'CDN-Cache-Control', value: PUBLIC_CDN_CACHE }] },

      // Property detail + public agent profile — cacheable for longer.
      { source: '/property/:slug',                    headers: [{ key: 'CDN-Cache-Control', value: PROPERTY_CDN_CACHE }] },
      { source: '/agent/:id([0-9a-f-]{36})',          headers: [{ key: 'CDN-Cache-Control', value: PROPERTY_CDN_CACHE }] },

      // Auth-gated pages — never cache at the edge.
      { source: '/account/:path*',                    headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/messages/:path*',                   headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/agent/dashboard/:path*',            headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/agent/messages/:path*',             headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/admin/:path*',                      headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/signin',                            headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      // Auth + API routes set session cookies — they MUST NOT be cached at the edge.
      // Cloudflare would otherwise cache the 302 from /auth/callback?code=xxx and
      // subsequent magic-link clicks would skip the route handler entirely,
      // landing at /account with no session and looping back to /signin.
      { source: '/auth/:path*',                       headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
      { source: '/api/:path*',                        headers: [{ key: 'CDN-Cache-Control', value: NO_CDN_CACHE }] },
    ]
  },
};

export default nextConfig;
EOF

# 4. Fix dependency vulnerabilities.
#    Your next.js version (16.2.5) has a HIGH severity, publicly known
#    auth-bypass bug (CVE-2026-45109 / GHSA-26hh-7cqf-hhc6) that can let
#    requests skip middleware.ts entirely — i.e. potentially bypass the
#    exact auth checks protecting /admin, /account, /messages. Fixed in
#    16.2.6+. This also resolves the high-severity `ws` issue.
#    --force is required here but only bumps next 16.2.5 -> ^16.2.10
#    (patch-level, same minor line) — not a breaking major upgrade.
npm audit fix --force

echo ""
echo "NOTE: after this, 'npm audit' will still show a moderate postcss"
echo "warning nested inside next's own build tooling. That's expected —"
echo "npm's suggested fix for it is to downgrade next to 9.3.3, which is"
echo "wrong. Leave it; it's a build-time-only dependency, not something"
echo "exposed to site visitors."

echo ""
echo "=== Done. Review the diff below, then: ==="
echo "git diff --stat"
git diff --stat
