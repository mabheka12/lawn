import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: pendingListings },
    { count: pendingClaims },
    { count: approvedListings },
    { count: rejectedListings },
    { count: pendingEdits },
  ] = await Promise.all([
    supabase.from('pending_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('pending_listings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('pending_listings').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('pending_edits').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('feature_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/listings"
          className="border rounded-lg p-5 bg-white hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500">Pending Listings</p>
            <p className="text-3xl font-bold mt-1">{pendingListings ?? 0}</p>
            <p className="text-sm text-gray-400 mt-1">{pendingEdits ?? 0} pending edits</p>
          </div>
          <span className="text-green-600 text-sm font-medium">Review →</span>
        </Link>
        <Link
          href="/admin/claims"
          className="border rounded-lg p-5 bg-white hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500">Pending Claims</p>
            <p className="text-3xl font-bold mt-1">{pendingClaims ?? 0}</p>
          </div>
          <span className="text-green-600 text-sm font-medium">Review →</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-500">Approved Listings (total)</p>
          <p className="text-2xl font-bold mt-1">{approvedListings ?? 0}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-500">Rejected Listings (total)</p>
          <p className="text-2xl font-bold mt-1">{rejectedListings ?? 0}</p>
        </div>
      </div>
    </div>
  )
}