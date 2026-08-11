import { canEditBusiness } from '@/lib/can-edit-business'
import { redirect, notFound } from 'next/navigation'
import EditForm from './edit-form'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const businessId = Number(id)
  const { allowed, user, supabase } = await canEditBusiness(businessId)

  if (!user) redirect(`/login?redirect=/my-listings/${id}/edit`)
  if (!allowed) notFound()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (!business) notFound()

  return <EditForm business={business} />
}