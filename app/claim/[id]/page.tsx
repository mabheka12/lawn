import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ClaimForm from './claim-form'

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const businessId = Number(id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/claim/${id}`)

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, city, state, is_claimed')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  if (business.is_claimed) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Already Claimed</h1>
        <p className="text-gray-600">This listing has already been claimed by its owner.</p>
      </div>
    )
  }

  const { data: existingClaim } = await supabase
    .from('claim_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingClaim) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Claim Pending</h1>
        <p className="text-gray-600">
          You've already submitted a claim for {business.name}. We'll review it shortly.
        </p>
      </div>
    )
  }

  return <ClaimForm business={business} userEmail={user.email ?? ''} />
}