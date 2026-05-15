import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { findMatchesForSavedSearch } from '@/lib/saved-search-match'
import { renderSavedSearchEmail } from '@/lib/email-templates'
import type { SavedSearch } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
// 60s should be plenty; raise if the buyer list grows huge.
export const maxDuration = 60

/**
 * Daily cron — saved-search email alerts.
 *
 * Triggered by Vercel Cron once a day (see vercel.json). Vercel signs the
 * request with a Bearer token equal to the value of the CRON_SECRET env var
 * that the user sets in their project. We reject anything else so this
 * endpoint isn't externally invokable.
 *
 * For each saved search with email_alerts = true:
 *   - find verified listings created since last_alerted_at that match the
 *     stored filter set,
 *   - if any, look up the buyer's auth email,
 *   - render + send a digest via Resend,
 *   - bump last_alerted_at so the same listing isn't sent twice.
 *
 * Failures are logged but don't stop the loop — one bad row shouldn't kill
 * the whole batch.
 */
export async function GET(request: NextRequest) {
  // 1. Auth — only Vercel Cron (or a manual run with the secret) gets through.
  const auth = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM = process.env.EMAIL_FROM || 'CredibleState <alerts@crediblestate.com>'
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
    console.error('cron/saved-search-alerts: missing env vars', {
      hasResend: !!RESEND_API_KEY,
      hasSupabase: !!SUPABASE_URL,
      hasServiceRole: !!SERVICE_ROLE,
    })
    return NextResponse.json({ error: 'missing_env' }, { status: 500 })
  }

  // Service-role client bypasses RLS — we're a trusted background job.
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const resend = new Resend(RESEND_API_KEY)

  // Origin for links inside the email.
  const host = request.headers.get('host') ?? 'crediblestate.com'
  const origin = host.includes('localhost') ? `http://${host}` : `https://${host.replace(/^www\./, '')}`

  // 2. Pull every saved search with alerts on.
  const { data: rows, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('email_alerts', true)

  if (error) {
    console.error('cron/saved-search-alerts: fetch searches failed', error)
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 })
  }

  const searches = (rows as SavedSearch[]) ?? []
  const stats = {
    searches: searches.length,
    matched: 0,
    emails_sent: 0,
    errors: 0,
  }

  // 3. Loop over each search, send if we have new listings.
  for (const search of searches) {
    try {
      const matches = await findMatchesForSavedSearch(
        supabase,
        search.filters,
        search.last_alerted_at,
        5,
      )

      if (matches.length === 0) {
        // No new listings → just bump last_alerted_at so next run starts
        // from this checkpoint (cheaper than re-scanning every day).
        await supabase
          .from('saved_searches')
          .update({ last_alerted_at: new Date().toISOString() })
          .eq('id', search.id)
        continue
      }
      stats.matched++

      // Look up the buyer's email. Supabase keeps email on auth.users,
      // not on profiles, so we use the admin API.
      const { data: userResp, error: userErr } = await supabase.auth.admin.getUserById(search.buyer_id)
      if (userErr || !userResp?.user?.email) {
        console.error('cron/saved-search-alerts: missing email for', search.buyer_id, userErr)
        stats.errors++
        continue
      }
      const to = userResp.user.email

      // Pull display name from profiles in one shot.
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', search.buyer_id)
        .maybeSingle()

      const { subject, html, text } = renderSavedSearchEmail({
        buyerName: (profile?.full_name as string | null) ?? null,
        search,
        matches,
        origin,
      })

      const { error: sendErr } = await resend.emails.send({
        from: FROM,
        to,
        subject,
        html,
        text,
        // Resend supports List-Unsubscribe via headers — wires up the Gmail
        // one-click "unsubscribe" button to the /account page.
        headers: {
          'List-Unsubscribe': `<${origin}/account>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })

      if (sendErr) {
        console.error('cron/saved-search-alerts: resend error for', to, sendErr)
        stats.errors++
        continue
      }
      stats.emails_sent++

      await supabase
        .from('saved_searches')
        .update({ last_alerted_at: new Date().toISOString() })
        .eq('id', search.id)

      // Tiny pause — Resend free is 10 emails/sec, this keeps us well under.
      await new Promise((r) => setTimeout(r, 120))
    } catch (err) {
      console.error('cron/saved-search-alerts: unexpected error on search', search.id, err)
      stats.errors++
    }
  }

  return NextResponse.json({ ok: true, ...stats })
}
