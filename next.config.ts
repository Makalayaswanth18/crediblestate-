import type { NextConfig } from "next";

/**
 * Cache headers for anonymous traffic.
 *
 * Browse + listing pages are public, change on a per-listing timescale of
 * minutes, and represent ~95% of inbound traffic. Setting Cache-Control:
 * public, s-maxage=N, stale-while-revalidate=N*5 means Cloudflare (or any
 * CDN sitting in front of Vercel) will serve cached HTML for the first
 * `s-maxage` window and revalidate in the background for the next 5x window.
 *
 * Signed-in pages (/account, /messages, /agent/dashboard, /admin/*) MUST NOT
 * be cached publicly. We send private+no-store on those.
 *
 * Why not just rely on Next's `revalidate` hint? Next uses it for its own
 * data cache but emits `cache-control: private, no-store` on the user-facing
 * response by default. Cloudflare ignores responses without an explicit
 * `public` directive. These headers fix that.
 */
const PUBLIC_CACHE = 'public, s-maxage=120, stale-while-revalidate=600'
const PROPERTY_CACHE = 'public, s-maxage=300, stale-while-revalidate=1800'
const NO_CACHE = 'private, no-store, max-age=0, must-revalidate'

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Public listing pages — short freshness, long stale window.
      { source: '/', headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE }] },
      { source: '/rent', headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE }] },
      { source: '/rent/:locality', headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE }] },
      { source: '/about', headers: [{ key: 'Cache-Control', value: PUBLIC_CACHE }] },
      // Property detail pages can be cached for longer — they change less.
      { source: '/property/:slug', headers: [{ key: 'Cache-Control', value: PROPERTY_CACHE }] },
      // Public agent profile pages — same cadence as property detail.
      { source: '/agent/:id([0-9a-f-]{36})', headers: [{ key: 'Cache-Control', value: PROPERTY_CACHE }] },

      // Auth-gated pages — never cache publicly.
      { source: '/account/:path*', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/messages/:path*', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/agent/dashboard/:path*', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/agent/messages/:path*', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
      { source: '/signin', headers: [{ key: 'Cache-Control', value: NO_CACHE }] },
    ]
  },
};

export default nextConfig;
