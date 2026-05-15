import type { Property, SavedSearch } from './supabase'
import { formatPrice } from './format'

/**
 * Render the saved-search email. Returns subject + HTML + plain-text.
 *
 * We hand-roll the HTML (no React-Email or MJML) for three reasons:
 *   1. Email clients are the wild west — fewer abstractions = fewer surprises.
 *   2. No extra deps, no extra build step.
 *   3. The layout is intentionally small (max 5 listings + a "see all" CTA),
 *      so the markup is short enough to read in one screen.
 *
 * Site origin is passed in so we don't hard-code crediblestate.com here —
 * lets the dev server use http://localhost:3000 if you ever preview locally.
 */
export function renderSavedSearchEmail({
  buyerName,
  search,
  matches,
  origin,
}: {
  buyerName: string | null
  search: SavedSearch
  matches: Property[]
  origin: string
}): { subject: string; html: string; text: string } {
  const count = matches.length
  const subject =
    count === 1
      ? `1 new property matches "${search.name}"`
      : `${count} new properties match "${search.name}"`

  const greeting = buyerName ? `Hi ${buyerName.split(' ')[0]},` : 'Hi,'

  const accountLink = `${origin}/account`

  // Rebuild the search URL so the "See all matches" button takes them
  // straight to the filter set they saved.
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(search.filters || {})) {
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv))
    else if (v) params.set(k, String(v))
  }
  const searchUrl = `${origin}/rent?${params.toString()}`

  const cards = matches
    .map((p) => renderCardHtml(p, origin))
    .join('')

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#100E0B;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #DDD7CF;">

        <!-- Brand header -->
        <tr><td style="padding:24px 28px;background:linear-gradient(160deg,#1A120A,#2C1A0E);color:#fff;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;letter-spacing:-0.01em;">
            Credible<span style="color:rgba(255,255,255,0.55);font-weight:400;">State</span>
          </div>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:24px;line-height:1.25;color:#100E0B;">
            ${count === 1 ? 'A new property matches' : `${count} new properties match`}
            <em style="color:#B84A1E;font-style:italic;">${escapeHtml(search.name)}</em>
          </h1>
          <p style="margin:0 0 8px;color:#4A4238;line-height:1.55;font-size:14px;">
            ${escapeHtml(greeting)} verified listings just went live in Hyderabad that match the search you saved.
          </p>
        </td></tr>

        <!-- Cards -->
        ${cards}

        <!-- CTA -->
        <tr><td style="padding:8px 28px 28px;" align="center">
          <a href="${searchUrl}" style="display:inline-block;background:#B84A1E;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;">See all matches →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 28px;background:#FAF7F2;border-top:1px solid #EEEAE3;font-size:12px;color:#9C9488;line-height:1.55;">
          You're getting this because email alerts are on for the saved search <strong>${escapeHtml(search.name)}</strong>.
          <br />
          <a href="${accountLink}" style="color:#B84A1E;text-decoration:none;">Manage your saved searches</a> to mute or delete it.
          <br /><br />
          CredibleState · Hyderabad's verified property platform
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `${greeting}

${count === 1 ? 'A new property matches' : `${count} new properties match`} "${search.name}":

${matches.map((p) => `• ${p.title} — ${formatPrice(Number(p.price))}${p.listing_type === 'rent' ? '/mo' : ''} · ${p.locality}
  ${origin}/property/${p.slug}`).join('\n\n')}

See all matches: ${searchUrl}

— CredibleState
Manage alerts: ${accountLink}
`

  return { subject, html, text }
}

function renderCardHtml(p: Property, origin: string): string {
  const url = `${origin}/property/${p.slug}`
  const priceStr = `${formatPrice(Number(p.price))}${p.listing_type === 'rent' ? '/mo' : ''}`
  const hero = p.images?.[0] ?? null
  const meta: string[] = []
  if (p.bedrooms != null) meta.push(`${p.bedrooms} BHK`)
  if (p.area_sqft) meta.push(`${p.area_sqft} sqft`)
  if (p.is_furnished) meta.push('Furnished')
  const metaStr = meta.join(' · ')

  return `<tr><td style="padding:0 28px 16px;">
    <a href="${url}" style="text-decoration:none;color:inherit;display:block;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;border-radius:12px;border:1px solid #EEEAE3;overflow:hidden;">
        ${hero ? `<tr><td><img src="${escapeAttr(hero)}" width="504" alt="" style="display:block;width:100%;height:180px;object-fit:cover;" /></td></tr>` : ''}
        <tr><td style="padding:14px 16px;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:18px;color:#B84A1E;line-height:1.2;margin-bottom:4px;">${escapeHtml(priceStr)}</div>
          <div style="font-size:14px;font-weight:600;color:#100E0B;margin-bottom:4px;">${escapeHtml(p.title)}</div>
          <div style="font-size:12px;color:#9C9488;">${escapeHtml(`📍 ${p.locality}${metaStr ? ' · ' + metaStr : ''}`)}</div>
        </td></tr>
      </table>
    </a>
  </td></tr>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s)
}
