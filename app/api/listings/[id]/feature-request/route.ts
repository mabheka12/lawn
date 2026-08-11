import { NextResponse } from 'next/server'
import { canEditBusiness } from '@/lib/can-edit-business'
import { notifyAdminNewFeatureRequest } from '@/lib/email'

const FEATURE_PRICE_CENTS = 4900
const FEATURE_DAYS = 30

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const businessId = Number(id)
  const { allowed, user, supabase } = await canEditBusiness(businessId)

  if (!allowed || !user) {
    return NextResponse.json({ error: 'Not authorized for this listing' }, { status: 403 })
  }

  const { data: existing } = await supabase
    .from('feature_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'A feature request is already pending for this listing' }, { status: 400 })
  }

  const body = await req.json()

  const { data: request, error } = await supabase
    .from('feature_requests')
    .insert([{
      business_id: businessId,
      user_id: user.id,
      requested_days: FEATURE_DAYS,
      price_cents: FEATURE_PRICE_CENTS,
      message: body.message || null,
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: businessInfo } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', businessId)
    .single()

  await notifyAdminNewFeatureRequest({
    business_name: businessInfo?.name ?? 'Unknown business',
    price_cents: FEATURE_PRICE_CENTS,
    days: FEATURE_DAYS,
  })

  return NextResponse.json({ success: true, request })
}