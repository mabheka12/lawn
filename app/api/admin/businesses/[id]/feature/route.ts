import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorized, supabase } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const days = Number(body.days) || 30

  const featuredUntil = new Date()
  featuredUntil.setDate(featuredUntil.getDate() + days)

  const { error } = await supabase
    .from('businesses')
    .update({ featured_until: featuredUntil.toISOString() })
    .eq('id', Number(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, featured_until: featuredUntil.toISOString() })
}