// app/admin/page.tsx

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  Inbox,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
  Pencil,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Service-role client for leads because the leads
  // table is intentionally protected by RLS.
  const adminSupabase = createAdminClient()

  const [
    { count: pendingListings },
    { count: pendingClaims },
    { count: approvedListings },
    { count: rejectedListings },
    { count: pendingEdits },
    { count: pendingFeatures },

    { count: newLeads },
    { count: contactedLeads },
    { count: closedLeads },
  ] = await Promise.all([
    // --------------------------------
    // LISTINGS
    // --------------------------------

    supabase
      .from('pending_listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    // --------------------------------
    // CLAIMS
    // --------------------------------

    supabase
      .from('claim_requests')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    // --------------------------------
    // APPROVED SUBMISSIONS
    // --------------------------------

    supabase
      .from('pending_listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'approved'),

    // --------------------------------
    // REJECTED SUBMISSIONS
    // --------------------------------

    supabase
      .from('pending_listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'rejected'),

    // --------------------------------
    // EDITS
    // --------------------------------

    supabase
      .from('pending_edits')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    // --------------------------------
    // FEATURE REQUESTS
    // --------------------------------

    supabase
      .from('feature_requests')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    // --------------------------------
    // NEW LEADS
    // --------------------------------

    adminSupabase
      .from('leads')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'new'),

    // --------------------------------
    // CONTACTED LEADS
    // --------------------------------

    adminSupabase
      .from('leads')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'contacted'),

    // --------------------------------
    // CLOSED LEADS
    // --------------------------------

    adminSupabase
      .from('leads')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'closed'),
  ])

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Review business submissions, claims,
          edits and customer enquiries.
        </p>

      </div>

      {/* -------------------------------- */}
      {/* ACTION ITEMS */}
      {/* -------------------------------- */}

      <section className="mb-10">

        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Needs Attention
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* PENDING LISTINGS */}
          <Link
            href="/admin/listings"
            className="group border rounded-xl p-5 bg-white hover:border-green-300 hover:shadow-md transition"
          >

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">

                <FileText
                  size={22}
                  className="text-green-700"
                />

              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition"
              />

            </div>

            <p className="text-sm text-gray-500 mt-5">
              Pending Listings
            </p>

            <p className="text-3xl font-bold mt-1 text-gray-900">
              {pendingListings ?? 0}
            </p>

            <div className="flex items-center gap-1 text-sm text-gray-500 mt-3">

              <Pencil size={14} />

              {pendingEdits ?? 0}{' '}
              {(pendingEdits ?? 0) === 1
                ? 'pending edit'
                : 'pending edits'}

            </div>

          </Link>

          {/* CLAIMS */}
          <Link
            href="/admin/claims"
            className="group border rounded-xl p-5 bg-white hover:border-green-300 hover:shadow-md transition"
          >

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">

                <ShieldCheck
                  size={22}
                  className="text-blue-700"
                />

              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition"
              />

            </div>

            <p className="text-sm text-gray-500 mt-5">
              Pending Claims
            </p>

            <p className="text-3xl font-bold mt-1 text-gray-900">
              {pendingClaims ?? 0}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Business ownership requests
            </p>

          </Link>

          {/* LEADS */}
          <Link
            href="/admin/leads"
            className="group border rounded-xl p-5 bg-white hover:border-green-300 hover:shadow-md transition"
          >

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center">

                <Inbox
                  size={22}
                  className="text-purple-700"
                />

              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition"
              />

            </div>

            <p className="text-sm text-gray-500 mt-5">
              New Leads
            </p>

            <p className="text-3xl font-bold mt-1 text-gray-900">
              {newLeads ?? 0}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Quote requests awaiting action
            </p>

          </Link>

          {/* FEATURE REQUESTS */}
          <Link
            href="/admin/features"
            className="group border rounded-xl p-5 bg-white hover:border-green-300 hover:shadow-md transition"
          >

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">

                <Star
                  size={22}
                  className="text-amber-700"
                />

              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition"
              />

            </div>

            <p className="text-sm text-gray-500 mt-5">
              Feature Requests
            </p>

            <p className="text-3xl font-bold mt-1 text-gray-900">
              {pendingFeatures ?? 0}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Pending featured listing requests
            </p>

          </Link>

        </div>

      </section>

      {/* -------------------------------- */}
      {/* LEAD PIPELINE */}
      {/* -------------------------------- */}

      <section className="mb-10">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-bold text-gray-900">
            Lead Pipeline
          </h2>

          <Link
            href="/admin/leads"
            className="text-sm font-medium text-green-700 hover:underline"
          >
            View all leads →
          </Link>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <Link
            href="/admin/leads?status=new"
            className="border rounded-xl p-5 bg-white hover:shadow-sm transition"
          >

            <p className="text-sm text-gray-500">
              New
            </p>

            <p className="text-3xl font-bold mt-1 text-blue-700">
              {newLeads ?? 0}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Awaiting follow-up
            </p>

          </Link>

          <Link
            href="/admin/leads?status=contacted"
            className="border rounded-xl p-5 bg-white hover:shadow-sm transition"
          >

            <p className="text-sm text-gray-500">
              Contacted
            </p>

            <p className="text-3xl font-bold mt-1 text-amber-700">
              {contactedLeads ?? 0}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Follow-up started
            </p>

          </Link>

          <Link
            href="/admin/leads?status=closed"
            className="border rounded-xl p-5 bg-white hover:shadow-sm transition"
          >

            <p className="text-sm text-gray-500">
              Closed
            </p>

            <p className="text-3xl font-bold mt-1 text-green-700">
              {closedLeads ?? 0}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Completed enquiries
            </p>

          </Link>

        </div>

      </section>

      {/* -------------------------------- */}
      {/* SUBMISSION STATS */}
      {/* -------------------------------- */}

      <section>

        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Listing Submission History
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="border rounded-xl p-5 bg-white">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Approved Listings
                </p>

                <p className="text-3xl font-bold mt-1">
                  {approvedListings ?? 0}
                </p>

              </div>

              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">

                <CheckCircle
                  size={22}
                  className="text-green-700"
                />

              </div>

            </div>

          </div>

          <div className="border rounded-xl p-5 bg-white">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Rejected Listings
                </p>

                <p className="text-3xl font-bold mt-1">
                  {rejectedListings ?? 0}
                </p>

              </div>

              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">

                <XCircle
                  size={22}
                  className="text-red-700"
                />

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  )
}