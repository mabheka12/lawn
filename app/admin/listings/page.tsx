import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ListingActions from './listing-actions'

export const dynamic = 'force-dynamic'

export default async function AdminListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
if (profile?.role !== 'admin') redirect('/')

  const { data: listings, error } = await supabase
    .from('pending_listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Listings ({listings?.length ?? 0})</h1>

      {error && <p className="text-red-600">{error.message}</p>}
      {!listings?.length && <p className="text-gray-500">No pending listings.</p>}

      <div className="space-y-4">
        {listings?.map((listing) => (
          <div key={listing.id} className="border rounded p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{listing.name}</h2>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{listing.listing_type}</span>
              </div>
              <p className="text-sm text-gray-600">
                {[listing.address, listing.city, listing.state, listing.country].filter(Boolean).join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                {listing.phone} {listing.website ? `· ${listing.website}` : ''}
              </p>
              {listing.category && <p className="text-sm text-gray-500">Category: {listing.category}</p>}
              {listing.description && <p className="text-sm mt-2">{listing.description}</p>}
              <p className="text-xs text-gray-400 mt-2">
                Submitted {new Date(listing.created_at).toLocaleString()}
              </p>
            </div>

            <ListingActions id={listing.id} />
          </div>
        ))}
      </div>
    </div>
  )
}