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

  const body = await req.json().catch(() => ({}))

  const { error } = await supabase
    .from('feature_requests')
    .update({
      payment_status: 'paid',
      payment_reference: body.payment_reference || null,
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}