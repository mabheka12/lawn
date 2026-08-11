import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { notifyOwnerFeatured } from '@/lib/email'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorized, user, supabase } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: request, error: fetchError } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'This request has already been reviewed' }, { status: 400 })
  }

  if (request.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment must be confirmed before approving' }, { status: 400 })
  }

  const featuredUntil = new Date()
  featuredUntil.setDate(featuredUntil.getDate() + request.requested_days)

  const { error: businessError } = await supabase
    .from('businesses')
    .update({ featured_until: featuredUntil.toISOString() })
    .eq('id', request.business_id)

  if (businessError) {
    return NextResponse.json({ error: businessError.message }, { status: 500 })
  }

  const { error: requestError } = await supabase
    .from('feature_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user!.id })
    .eq('id', id)

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 })
  }

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', request.user_id)
    .single()

  const { data: businessInfo } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('id', request.business_id)
    .single()

  if (ownerProfile?.email && businessInfo) {
    await notifyOwnerFeatured({
      to: ownerProfile.email,
      business_name: businessInfo.name,
      business_slug: businessInfo.slug,
      featured_until: featuredUntil.toISOString(),
    })
  }
  return NextResponse.json({ success: true })
}