
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorized, user, supabase } = await requireAdmin()

  if (!authorized || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  const { data: claim, error: fetchError } = await supabase
    .from('claim_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !claim) {
    return NextResponse.json(
      { error: 'Claim not found' },
      { status: 404 }
    )
  }

  if (claim.status !== 'pending') {
    return NextResponse.json(
      { error: 'This claim has already been reviewed' },
      { status: 400 }
    )
  }

  const { data: business, error: businessFetchError } = await supabase
    .from('businesses')
    .select('id, is_claimed')
    .eq('id', claim.business_id)
    .single()

  if (businessFetchError || !business) {
    return NextResponse.json(
      { error: 'Listing not found' },
      { status: 404 }
    )
  }

  if (business.is_claimed) {
    return NextResponse.json(
      { error: 'This listing has already been claimed by someone else' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()

  // Record ownership using the existing businesses columns.
  const { data: updatedBusiness, error: businessError } = await supabase
    .from('businesses')
    .update({
      is_claimed: true,
      claimed_by: claim.user_id,
      claimed_at: now,
    })
    .eq('id', claim.business_id)
    .eq('is_claimed', false)
    .select('id')
    .maybeSingle()

  if (businessError) {
    return NextResponse.json(
      { error: businessError.message },
      { status: 500 }
    )
  }

  if (!updatedBusiness) {
    return NextResponse.json(
      { error: 'The listing was claimed by another user or has changed. Refresh and review the claim.' },
      { status: 409 }
    )
  }

  const { error: claimError } = await supabase
    .from('claim_requests')
    .update({
      status: 'approved',
      reviewed_at: now,
      reviewed_by: user.id,
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (claimError) {
    // Avoid leaving a claimed listing if the claim status update fails.
    const { error: rollbackError } = await supabase
      .from('businesses')
      .update({
        is_claimed: false,
        claimed_by: null,
        claimed_at: null,
      })
      .eq('id', claim.business_id)
      .eq('claimed_by', claim.user_id)

    if (rollbackError) {
      console.error('Claim approval rollback failed:', rollbackError)
    }

    return NextResponse.json(
      { error: claimError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
