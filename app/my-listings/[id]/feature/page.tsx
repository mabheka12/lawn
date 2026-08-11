import { canEditBusiness } from '@/lib/can-edit-business'
import { redirect, notFound } from 'next/navigation'
import FeatureRequestForm from './feature-request-form'

export default async function FeatureRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const businessId = Number(id)
  const { allowed, user, supabase } = await canEditBusiness(businessId)

  if (!user) redirect(`/login?redirect=/my-listings/${id}/feature`)
  if (!allowed) notFound()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, featured_until')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  const isCurrentlyFeatured = business.featured_until && new Date(business.featured_until) > new Date()

  if (isCurrentlyFeatured) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Already Featured</h1>
        <p className="text-gray-600">
          {business.name} is featured until {new Date(business.featured_until!).toLocaleDateString()}.
        </p>
      </div>
    )
  }

  const { data: pendingRequest } = await supabase
    .from('feature_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingRequest) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Request Pending</h1>
        <p className="text-gray-600">
          Your request to feature {business.name} is awaiting payment confirmation.
        </p>
      </div>
    )
  }

  return <FeatureRequestForm business={business} />
}