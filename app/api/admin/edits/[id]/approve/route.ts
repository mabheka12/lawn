import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorized, user, supabase } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: edit, error: fetchError } = await supabase
    .from('pending_edits')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !edit) {
    return NextResponse.json({ error: 'Edit request not found' }, { status: 404 })
  }

  const { error: businessError } = await supabase
    .from('businesses')
    .update(edit.changes)
    .eq('id', edit.business_id)

  if (businessError) {
    return NextResponse.json({ error: businessError.message }, { status: 500 })
  }

  const { error: editError } = await supabase
    .from('pending_edits')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user!.id })
    .eq('id', id)

  if (editError) {
    return NextResponse.json({ error: editError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}