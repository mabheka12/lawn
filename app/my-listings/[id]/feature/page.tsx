import { canEditBusiness } from '@/lib/can-edit-business'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

import {
  Star,
  Clock,
  CheckCircle,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react'

import FeatureRequestForm from './feature-request-form'

export default async function FeatureRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const businessId =
    Number(id)

  if (
    !Number.isInteger(businessId)
  ) {
    notFound()
  }

  const {
    allowed,
    user,
    supabase,
  } =
    await canEditBusiness(
      businessId
    )

  if (!user) {
    redirect(
      `/login?redirect=/my-listings/${id}/feature`
    )
  }

  if (!allowed) {
    notFound()
  }

  // ----------------------------------------
  // BUSINESS
  // ----------------------------------------

  const {
    data: business,
    error: businessError,
  } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      city,
      state,
      country,
      featured_until
    `)
    .eq(
      'id',
      businessId
    )
    .single()

  if (
    businessError ||
    !business
  ) {
    notFound()
  }

  const now =
    new Date()

  const isCurrentlyFeatured =
    !!business.featured_until &&
    new Date(
      business.featured_until
    ) >
      now

  // ----------------------------------------
  // ACTIVE FEATURED STATE
  // ----------------------------------------

  if (
    isCurrentlyFeatured
  ) {
    const featuredUntil =
      new Date(
        business.featured_until!
      )

    return (
      <div className="min-h-screen bg-gray-50">

        <main className="max-w-3xl mx-auto px-4 py-12">

          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 mb-6"
          >
            <ArrowLeft
              size={16}
            />

            Back to My Listings
          </Link>

          <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">

            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">

              <Star
                size={30}
                className="text-amber-700 fill-current"
              />

            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Featured Listing Active
            </h1>

            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              {business.name} currently has featured placement
              enabled.
            </p>

            <div className="mt-7 bg-amber-50 border border-amber-100 rounded-xl p-5">

              <div className="flex items-center justify-center gap-2 text-amber-800 font-semibold">

                <CalendarDays
                  size={18}
                />

                Featured until

              </div>

              <div className="text-xl font-bold text-gray-900 mt-2">

                {featuredUntil.toLocaleDateString()}

              </div>

            </div>

            <div className="mt-7 text-left bg-gray-50 rounded-xl p-5">

              <h2 className="font-bold text-lg mb-3">
                What featured placement means
              </h2>

              <ul className="space-y-3 text-sm text-gray-600">

                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={17}
                    className="text-green-600 mt-0.5 shrink-0"
                  />

                  Your listing may appear ahead of standard listings
                  where featured placement is supported.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={17}
                    className="text-green-600 mt-0.5 shrink-0"
                  />

                  Your listing is visually marked as featured while the
                  feature period is active.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle
                    size={17}
                    className="text-green-600 mt-0.5 shrink-0"
                  />

                  Featured placement does not guarantee enquiries,
                  clicks, rankings, or sales.
                </li>

              </ul>

            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">

              <Link
                href={`/listings/${business.slug}`}
                className="inline-flex items-center justify-center border border-gray-300 px-5 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                View Listing
              </Link>

              <Link
                href="/my-listings"
                className="inline-flex items-center justify-center bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Back to My Listings
              </Link>

            </div>

          </div>

        </main>

      </div>
    )
  }

  // ----------------------------------------
  // PENDING FEATURE REQUEST
  // ----------------------------------------

  const {
    data: pendingRequest,
    error: pendingError,
  } = await supabase
    .from('feature_requests')
    .select(`
      id,
      status,
      created_at,
      price_cents,
      days
    `)
    .eq(
      'business_id',
      businessId
    )
    .eq(
      'status',
      'pending'
    )
    .maybeSingle()

  if (pendingError) {
    console.error(
      'Feature request lookup error:',
      pendingError
    )
  }

  if (
    pendingRequest
  ) {
    return (
      <div className="min-h-screen bg-gray-50">

        <main className="max-w-3xl mx-auto px-4 py-12">

          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 mb-6"
          >
            <ArrowLeft
              size={16}
            />

            Back to My Listings
          </Link>

          <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">

              <Clock
                size={30}
                className="text-blue-700"
              />

            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Feature Request Pending
            </h1>

            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              A featured-placement request for {business.name} is
              currently pending.
            </p>

            {(pendingRequest.days ||
              pendingRequest.price_cents) && (

              <div className="grid sm:grid-cols-2 gap-4 mt-7 text-left">

                {pendingRequest.days && (
                  <div className="bg-gray-50 border rounded-xl p-5">

                    <p className="text-sm text-gray-500">
                      Requested duration
                    </p>

                    <p className="text-xl font-bold mt-1">
                      {pendingRequest.days} days
                    </p>

                  </div>
                )}

                {typeof pendingRequest.price_cents ===
                  'number' && (

                  <div className="bg-gray-50 border rounded-xl p-5">

                    <p className="text-sm text-gray-500">
                      Requested price
                    </p>

                    <p className="text-xl font-bold mt-1">
                      $
                      {(
                        pendingRequest.price_cents /
                        100
                      ).toFixed(2)}
                    </p>

                  </div>

                )}

              </div>

            )}

            <div className="mt-7 bg-blue-50 border border-blue-100 rounded-xl p-5 text-left">

              <h2 className="font-bold mb-2">
                What happens next?
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                The request remains pending until the required review
                and payment steps are completed. Once approved, the
                listing's featured period can be activated.
              </p>

            </div>

            <Link
              href="/my-listings"
              className="inline-flex mt-7 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Back to My Listings
            </Link>

          </div>

        </main>

      </div>
    )
  }

  // ----------------------------------------
  // REQUEST FORM
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-3xl mx-auto px-4 py-12">

        <Link
          href="/my-listings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft
            size={16}
          />

          Back to My Listings
        </Link>

        <div className="mb-7">

          <div className="flex items-center gap-3 mb-3">

            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">

              <Star
                size={24}
                className="text-amber-700"
              />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-gray-900">
                Feature {business.name}
              </h1>

              <p className="text-gray-600 mt-1">
                Request featured placement for this listing.
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm mb-7">

          <h2 className="text-xl font-bold mb-4">
            About Featured Placement
          </h2>

          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">

            <p>
              Featured listings may receive more prominent placement
              than standard listings on supported directory pages.
            </p>

            <p>
              Featured placement is intended to increase visibility
              within the directory. It does not guarantee a specific
              number of views, enquiries, customers, search rankings,
              or sales.
            </p>

          </div>

        </div>

        <FeatureRequestForm
          business={business}
        />

      </main>

    </div>
  )
}