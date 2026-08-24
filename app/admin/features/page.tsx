import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

import {
  Star,
  Clock,
  CheckCircle,
  ExternalLink,
  CreditCard,
} from 'lucide-react'

import FeatureActions from './feature-actions'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturesPage() {
  const supabase = await createClient()

  const {
    data: requests,
    error,
  } = await supabase
    .from('feature_requests')
    .select(`
      id,
      business_id,
      user_id,
      status,
      payment_status,
      payment_reference,
      price_cents,
      requested_days,
      message,
      created_at,
      businesses (
        id,
        name,
        slug,
        city,
        state,
        featured_until
      )
    `)
    .eq('status', 'pending')
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    console.error(
      'Feature requests query error:',
      error
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Feature Requests
        </h1>

        <p className="text-gray-600 mt-2">
          Review payment status and activate
          featured placement for approved requests.
        </p>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          Could not load feature requests.
        </div>
      )}

      {/* EMPTY */}

      {!requests?.length && !error && (
        <div className="bg-white border rounded-2xl p-10 text-center">

          <Star
            size={38}
            className="text-gray-400 mx-auto mb-4"
          />

          <h2 className="text-xl font-bold">
            No pending feature requests
          </h2>

          <p className="text-gray-500 mt-2">
            New featured-placement requests will
            appear here.
          </p>

        </div>
      )}

      {/* REQUESTS */}

      <div className="space-y-5">

        {requests?.map((req: any) => {
          const business =
            req.businesses

          const isPaid =
            req.payment_status === 'paid'

          const alreadyFeatured =
            !!business?.featured_until &&
            new Date(
              business.featured_until
            ) > new Date()

          return (
            <div
              key={req.id}
              className="bg-white border rounded-2xl p-6"
            >

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                {/* DETAILS */}

                <div className="flex-1 min-w-0">

                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <h2 className="text-xl font-bold text-gray-900">
                      {business?.name ||
                        'Unknown Business'}
                    </h2>

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">

                        <CheckCircle size={13} />

                        Paid

                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">

                        <Clock size={13} />

                        Awaiting Payment

                      </span>
                    )}

                    {alreadyFeatured && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">

                        <Star
                          size={13}
                          className="fill-current"
                        />

                        Already Featured

                      </span>
                    )}

                  </div>

                  {/* LOCATION */}

                  {(business?.city ||
                    business?.state) && (

                    <p className="text-sm text-gray-500">
                      {[
                        business.city,
                        business.state,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>

                  )}

                  {/* PACKAGE */}

                  <div className="grid sm:grid-cols-2 gap-3 mt-5">

                    <div className="bg-gray-50 border rounded-xl p-4">

                      <p className="text-xs text-gray-500 uppercase">
                        Price
                      </p>

                      <p className="text-lg font-bold mt-1">
                        $
                        {(
                          req.price_cents /
                          100
                        ).toFixed(2)}
                      </p>

                    </div>

                    <div className="bg-gray-50 border rounded-xl p-4">

                      <p className="text-xs text-gray-500 uppercase">
                        Duration
                      </p>

                      <p className="text-lg font-bold mt-1">
                        {req.requested_days}{' '}
                        days
                      </p>

                    </div>

                  </div>

                  {/* MESSAGE */}

                  {req.message && (

                    <div className="mt-5 bg-gray-50 border rounded-xl p-4">

                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Request Message
                      </p>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {req.message}
                      </p>

                    </div>

                  )}

                  {/* PAYMENT REFERENCE */}

                  {req.payment_reference && (

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">

                      <CreditCard size={15} />

                      <span>
                        Payment reference:{' '}
                        <strong>
                          {req.payment_reference}
                        </strong>
                      </span>

                    </div>

                  )}

                  {/* SUBMITTED */}

                  <p className="text-xs text-gray-400 mt-4">
                    Submitted{' '}
                    {new Date(
                      req.created_at
                    ).toLocaleString()}
                  </p>

                  {/* VIEW BUSINESS */}

                  {business?.slug && (

                    <Link
                      href={`/listings/${business.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium mt-4 hover:underline"
                    >
                      View Listing
                      <ExternalLink size={14} />
                    </Link>

                  )}

                </div>

                {/* ACTIONS */}

                <div className="lg:w-56 shrink-0">

                  <FeatureActions
                    id={req.id}
                    paymentStatus={
                      req.payment_status
                    }
                  />

                </div>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}