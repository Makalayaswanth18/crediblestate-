import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/signin?intent=agent', request.url))

  await supabase
    .from('properties')
    .update({ status: 'rented', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('agent_id', user.id)

  revalidatePath('/')
  revalidatePath('/rent')
  revalidatePath('/agent/dashboard')

  return NextResponse.redirect(new URL('/agent/dashboard', request.url))
}
