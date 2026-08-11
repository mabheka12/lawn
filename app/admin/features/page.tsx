import { createClient } from '@/utils/supabase/server'
import FeatureActions from './feature-actions'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturesPage() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('feature_requests')
    .select('*, businesses(name, slug)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Feature Requests ({requests?.length ?? 0})</h1>

      {error && <p className="text-red-600">{error.message}</p>}
      {!requests?.length && <p className="text-gray-500">No pending feature requests.</p>}

      <div className="space-y-4">
        {requests?.map((req: any) => (
          <div key={req.id} className="border rounded p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{req.businesses?.name}</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    req.payment_status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {req.payment_status === 'paid' ? 'Paid' : 'Awaiting Payment'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                ${(req.price_cents / 100).toFixed(2)} · {req.requested_days} days
              </p>
              {req.message && <p className="text-sm mt-2">{req.message}</p>}
              {req.payment_reference && (
                <p className="text-xs text-gray-400 mt-1">Ref: {req.payment_reference}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Submitted {new Date(req.created_at).toLocaleString()}
              </p>
            </div>
            <FeatureActions id={req.id} paymentStatus={req.payment_status} />
          </div>
        ))}
      </div>
    </div>
  )
}