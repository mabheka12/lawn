import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ClaimActions from './claim-actions'

export const dynamic = 'force-dynamic'

export default async function AdminClaimsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
if (profile?.role !== 'admin') redirect('/')

  const { data: claims, error } = await supabase
    .from('claim_requests')
    .select('*, businesses(name, slug)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Claims ({claims?.length ?? 0})</h1>

      {error && <p className="text-red-600">{error.message}</p>}
      {!claims?.length && <p className="text-gray-500">No pending claims.</p>}

      <div className="space-y-4">
        {claims?.map((claim: any) => (
          <div key={claim.id} className="border rounded p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {claim.businesses?.name ?? `Business #${claim.business_id}`}
              </h2>
              <p className="text-sm text-gray-600">
                Claimed by: {claim.full_name} ({claim.email})
              </p>
              {claim.phone && <p className="text-sm text-gray-600">Phone: {claim.phone}</p>}
              {claim.relationship && (
                <p className="text-sm text-gray-600">Relationship: {claim.relationship}</p>
              )}
              {claim.message && <p className="text-sm mt-2">{claim.message}</p>}
              <p className="text-xs text-gray-400 mt-2">
                Submitted {new Date(claim.created_at).toLocaleString()}
              </p>
            </div>

            <ClaimActions id={claim.id} />
          </div>
        ))}
      </div>
    </div>
  )
}