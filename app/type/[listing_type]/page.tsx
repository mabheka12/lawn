import { createClient } from '@/utils/supabase/server'
import ListingCard from '@/components/ListingCard'
import { notFound } from 'next/navigation'

export default async function TypePage({
  params,
}: {
  params: Promise<{ listing_type: string }>
}) {
  const { listing_type } = await params
  const supabase = await createClient()

  const validTypes = ['mowing', 'repairs']

  if (!validTypes.includes(listing_type)) {
    notFound()
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('listing_type', listing_type)

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {listing_type === 'mowing'
          ? 'Lawn Mowing Services'
          : 'Lawn Mower Repairs'}
      </h1>

      <div className="grid gap-4">
        {businesses?.map((biz) => (
          <ListingCard key={biz.id} business={biz} />
        ))}
      </div>
    </div>
  )
}