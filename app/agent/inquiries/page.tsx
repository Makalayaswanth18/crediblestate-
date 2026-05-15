import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// The flat inquiry list has been replaced by /agent/messages, which shows
// threaded conversations between agents and buyers (migration 004).
// We keep the route alive as a redirect so existing dashboard / email links
// don't 404.
export default function InquiriesRedirect() {
  redirect('/agent/messages')
}
