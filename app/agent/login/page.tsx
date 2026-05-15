import { redirect } from 'next/navigation'

/**
 * Legacy route — the dedicated agent-login page is gone. All authentication
 * funnels through /signin now. We keep this route alive only so old emails,
 * bookmarks, and any deep links continue to work; everyone gets bounced to
 * /signin with intent=agent preserved so the UI knows to surface the agent
 * variant of the sign-in form.
 */
export default function AgentLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  void searchParams // not used here, callers can fall back to /signin defaults
  redirect('/signin?intent=agent')
}
