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

  const { data: claim, error: fetchError } = await supabase
    .from('claim_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  }

  if (claim.status !== 'pending') {
    return NextResponse.json({ error: 'This claim has already been reviewed' }, { status: 400 })
  }

  const { data: business, error: businessFetchError } = await supabase
    .from('businesses')
    .select('is_claimed')
    .eq('id', claim.business_id)
    .single()

  if (businessFetchError || !business) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (business.is_claimed) {
    return NextResponse.json(
      { error: 'This listing has already been claimed by someone else' },
      { status: 400 }
    )
  }

  const { error: businessError } = await supabase
    .from('businesses')
    .update({
      owner_id: claim.user_id,
      is_claimed: true,
      claimed_by: claim.user_id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', claim.business_id)

  if (businessError) {
    return NextResponse.json({ error: businessError.message }, { status: 500 })
  }

  const { error: claimError } = await supabase
    .from('claim_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user!.id,
    })
    .eq('id', id)

  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}