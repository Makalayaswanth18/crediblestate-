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
