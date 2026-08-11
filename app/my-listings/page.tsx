import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/my-listings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const { data: listings } = await supabase
    .from('businesses')
    .select('*')
    .or(`owner_id.eq.${user.id},submitted_by_email.eq.${profile?.email ?? user.email}`)
    .order('created_at', { ascending: false })

  const { data: pendingEdits } = await supabase
    .from('pending_edits')
    .select('business_id, status')
    .eq('submitted_by', user.id)
    .eq('status', 'pending')

  const pendingByBusinessId = new Set(pendingEdits?.map((e) => e.business_id))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>

      {!listings?.length && (
        <p className="text-gray-500">
          You don't have any listings yet. <Link href="/add-listing" className="text-green-600 underline">Submit one</Link> or claim an existing business.
        </p>
      )}

      <div className="space-y-4">
        {listings?.map((listing) => (
          <div key={listing.id} className="border rounded p-4 flex justify-between items-start gap-4">
            <div>
              <h2 className="font-semibold text-lg">{listing.name}</h2>
              <p className="text-sm text-gray-600">
                {[listing.city, listing.state, listing.country].filter(Boolean).join(', ')}
              </p>
              {pendingByBusinessId.has(listing.id) && (
                <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Edit pending review
                </span>
              )}
            </div>
            <Link
              href={`/my-listings/${listing.id}/edit`}
              className="text-sm bg-green-600 text-white px-4 py-1.5 rounded shrink-0"
            >
              Edit
            </Link>
            <Link
                href={`/my-listings/${listing.id}/feature`}
                className="text-sm border border-green-600 text-green-600 px-4 py-1.5 rounded shrink-0"
                >
                {listing.featured_until && new Date(listing.featured_until) > new Date()
                    ? 'Featured'
                    : 'Get Featured'}
                </Link>
          </div>
        ))}
      </div>
    </div>
  )
}