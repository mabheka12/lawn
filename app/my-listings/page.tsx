import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import {
  MapPin,
  Pencil,
  Star,
  Clock,
  CheckCircle,
  PlusCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyListingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/my-listings')
  }

  // -----------------------------------------
  // PROFILE
  // -----------------------------------------

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .maybeSingle()

  const ownerEmail =
    profile?.email ||
    user.email ||
    ''

  // -----------------------------------------
  // USER LISTINGS
  // -----------------------------------------

  const { data: listings, error: listingsError } =
    await supabase
      .from('businesses')
      .select(`
        id,
        name,
        slug,
        city,
        state,
        country,
        featured_until,
        status,
        created_at
      `)
      .or(
        `owner_id.eq.${user.id},submitted_by_email.eq.${ownerEmail}`
      )
      .order('created_at', {
        ascending: false,
      })

  if (listingsError) {
    console.error(
      'My listings error:',
      listingsError
    )
  }

  const listingIds =
    listings?.map(
      (listing) => listing.id
    ) || []

  // -----------------------------------------
  // PENDING EDITS
  // -----------------------------------------

  let pendingEditIds =
    new Set<number>()

  if (listingIds.length > 0) {
    const { data: pendingEdits } =
      await supabase
        .from('pending_edits')
        .select('business_id')
        .eq(
          'submitted_by',
          user.id
        )
        .eq(
          'status',
          'pending'
        )
        .in(
          'business_id',
          listingIds
        )

    pendingEditIds =
      new Set(
        pendingEdits?.map(
          (edit) =>
            edit.business_id
        ) || []
      )
  }

  // -----------------------------------------
  // FEATURE REQUESTS
  // -----------------------------------------

  let pendingFeatureIds =
    new Set<number>()

  if (listingIds.length > 0) {
    const {
      data: featureRequests,
      error: featureError,
    } = await supabase
      .from('feature_requests')
      .select(`
        business_id,
        status
      `)
      .in(
        'business_id',
        listingIds
      )
      .eq(
        'status',
        'pending'
      )

    if (featureError) {
      console.error(
        'Feature request query error:',
        featureError
      )
    }

    pendingFeatureIds =
      new Set(
        featureRequests?.map(
          (request) =>
            request.business_id
        ) || []
      )
  }

  const now =
    new Date()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Listings
          </h1>

          <p className="text-gray-600 mt-2">
            Manage your business listings,
            updates and featured placement.
          </p>
        </div>

        <Link
          href="/submit-business"
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          <PlusCircle size={18} />

          Add a Business
        </Link>

      </div>

      {/* EMPTY STATE */}

      {!listings ||
      listings.length === 0 ? (

        <div className="bg-white border rounded-2xl p-10 text-center">

          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin
              size={26}
              className="text-green-700"
            />
          </div>

          <h2 className="text-xl font-bold">
            No listings yet
          </h2>

          <p className="text-gray-600 mt-2 mb-6">
            Submit a business or claim an
            existing listing to manage it
            here.
          </p>

          <Link
            href="/submit-business"
            className="inline-flex bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Submit a Business
          </Link>

        </div>

      ) : (

        <div className="space-y-5">

          {listings.map(
            (listing) => {
              const isFeatured =
                !!listing.featured_until &&
                new Date(
                  listing.featured_until
                ) > now

              const hasPendingFeature =
                pendingFeatureIds.has(
                  listing.id
                )

              const hasPendingEdit =
                pendingEditIds.has(
                  listing.id
                )

              return (
                <div
                  key={listing.id}
                  className="bg-white border rounded-2xl p-5 md:p-6"
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    {/* BUSINESS INFO */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <h2 className="text-xl font-bold text-gray-900">
                          {listing.name}
                        </h2>

                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">

                            <Star
                              size={13}
                              className="fill-current"
                            />

                            Featured

                          </span>
                        )}

                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <MapPin
                          size={15}
                          className="shrink-0"
                        />

                        <span>
                          {[
                            listing.city,
                            listing.state,
                            listing.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>

                      </div>

                      {/* STATUS */}

                      <div className="flex flex-wrap gap-2 mt-4">

                        {hasPendingEdit && (
                          <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full">

                            <Clock size={13} />

                            Edit pending review

                          </span>
                        )}
                        {hasPendingFeature && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                            <Clock size={13} />
                            Feature request pending
                          </span>
                        )}
                        {isFeatured &&
                          listing.featured_until && (

                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                            <CheckCircle
                              size={13}
                            />
                            Featured until{' '}
                            {new Date(
                              listing.featured_until
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
                      <Link
                        href={`/listings/${listing.slug}`}
                        className="inline-flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        View
                      </Link>
                      <Link
                        href={`/my-listings/${listing.id}/edit`}
                        className="inline-flex items-center gap-2 border border-green-600 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition"
                      >
                        <Pencil size={15} />
                        Edit
                      </Link>
                      {/* FEATURE ACTION */}
                      {isFeatured ? (
                        <Link
                          href={`/my-listings/${listing.id}/feature`}
                          className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-200 transition"
                        >
                          <Star
                            size={15}
                            className="fill-current"
                          />
                          Featured
                        </Link>
                      ) : hasPendingFeature ? (
                        <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                          <Clock size={15} />
                          Request Pending
                        </span>
                      ) : (

                        <Link
                          href={`/my-listings/${listing.id}/feature`}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                        >
                          <Star size={15} />
                          Get Featured
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}