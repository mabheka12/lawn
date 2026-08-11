import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { notifyAdminNewClaim } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { business_id, full_name, email, phone, relationship, message } = body

  if (!business_id || !full_name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, is_claimed')
    .eq('id', business_id)
    .single()

  if (businessError || !business) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  if (business.is_claimed) {
    return NextResponse.json({ error: 'This listing has already been claimed' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('claim_requests')
    .select('id')
    .eq('business_id', business_id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You already have a pending claim for this listing' }, { status: 400 })
  }

  const { data: claim, error: insertError } = await supabase
    .from('claim_requests')
    .insert([{
      business_id,
      user_id: user.id,
      full_name,
      email,
      phone: phone || null,
      relationship: relationship || null,
      message: message || null,
    }])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await notifyAdminNewClaim({
    full_name,
    email,
    business_name: business.name,
  })

  return NextResponse.json({ success: true, claim })
}