import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = ['yaswanthganesh39@gmail.com']

export async function middleware(request: NextRequest) {
  // Defensive: never let middleware crash the whole site.
  // If Supabase isn't reachable, just allow the request through.
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If env vars aren't set, fall through (auth is broken but site works)
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    })

    // Refresh expiring auth tokens
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Protect agent routes (except login)
    if (path.startsWith('/agent') && !path.startsWith('/agent/login')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/agent/login'
        url.searchParams.set('next', path)
        return NextResponse.redirect(url)
      }
    }

    // Protect admin routes
    if (path.startsWith('/admin')) {
      if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        const url = request.nextUrl.clone()
        url.pathname = '/agent/login'
        url.searchParams.set('next', path)
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (err) {
    // Log + pass through. Never crash the site over middleware issues.
    console.error('[middleware] error, passing through:', err)
    return NextResponse.next({ request })
  }
}

export const config = {
  // Only run middleware where it actually matters.
  // Public pages don't need auth checks.
  matcher: ['/agent/:path*', '/admin/:path*', '/auth/:path*'],
}
