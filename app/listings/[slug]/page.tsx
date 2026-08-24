import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Star,
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

import MapWrapper from '@/components/MapWrapper'
import WeatherWidget from '@/components/WeatherWidget'
import RequestQuoteForm from '@/components/leads/RequestQuoteForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

type DayHours = {
  open: string | null
  close: string | null
}

type OpenHours = Record<string, DayHours>

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const SERVICE_SLUGS: Record<string, string> = {
  'Lawn Care': 'lawn-care',
  Landscaping: 'landscaping',
  'Garden Design': 'garden-design',
  'Tree Services': 'tree-services',
  Hardscaping: 'hardscaping',
  Repairs: 'mower-repair',
}

function to12h(time24: string) {
  const [hStr, m] = time24.split(':')
  let h = parseInt(hStr, 10)

  const ap = h >= 12 ? 'PM' : 'AM'

  h = h % 12 || 12

  return `${h}:${m} ${ap}`
}

function getServiceSlug(
  primaryCategory?: string | null,
  listingType?: string | null
) {
  if (listingType === 'repairs') {
    return 'mower-repair'
  }

  if (!primaryCategory) {
    return null
  }

  return SERVICE_SLUGS[primaryCategory] || null
}

function getServiceLabel(
  primaryCategory?: string | null,
  listingType?: string | null
) {
  if (listingType === 'repairs') {
    return 'Lawn Mower Repair'
  }

  return primaryCategory || 'Lawn Services'
}

// --------------------------------------------------
// METADATA
// --------------------------------------------------

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const id = Number(slug.split('-').pop())

  if (Number.isNaN(id)) {
    return {
      title: 'Business Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      description,
      city,
      state,
      country,
      primary_category,
      listing_type,
      status
    `)
    .eq('id', id)
    .maybeSingle()

  if (!business || business.status !== 'approved') {
    return {
      title: 'Business Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const service = getServiceLabel(
    business.primary_category,
    business.listing_type
  )

  const title =
    `${business.name} - ${service} in ${business.city}, ${business.state}`

  const description = business.description
    ? business.description.slice(0, 155)
    : `${business.name} provides ${service.toLowerCase()} services in ${business.city}, ${business.state}. View contact details, ratings, hours and business information.`

  const canonical =
    `https://www.lawnmowingnearme.org/listings/${business.slug}`

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

export default async function ListingPage({
  params,
}: PageProps) {
  const { slug } = await params

  const supabase = await createClient()

  const id = Number(slug.split('-').pop())

  if (Number.isNaN(id)) {
    notFound()
  }

  // --------------------------------------------------
  // BUSINESS
  // --------------------------------------------------

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!business) {
    notFound()
  }

  // Canonical slug
  if (slug !== business.slug) {
    permanentRedirect(
      `/listings/${business.slug}`
    )
  }

  const cityPath =
    business.country_slug &&
    business.state_slug &&
    business.city_slug
      ? `/near-me/${business.country_slug}/${business.state_slug}/${business.city_slug}`
      : null

  const serviceSlug = getServiceSlug(
    business.primary_category,
    business.listing_type
  )

  const serviceLabel = getServiceLabel(
    business.primary_category,
    business.listing_type
  )

  const servicePath =
    cityPath && serviceSlug
      ? `${cityPath}/${serviceSlug}`
      : null

  // --------------------------------------------------
  // SIMILAR BUSINESSES
  // Keep these geographically relevant.
  // --------------------------------------------------

  let similarQuery = supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      city,
      state,
      rating,
      google_reviews_count,
      primary_category,
      listing_type
    `)
    .eq('status', 'approved')
    .neq('id', business.id)

  if (business.country_slug) {
    similarQuery = similarQuery.eq(
      'country_slug',
      business.country_slug
    )
  }

  if (business.state_slug) {
    similarQuery = similarQuery.eq(
      'state_slug',
      business.state_slug
    )
  }

  if (business.city_slug) {
    similarQuery = similarQuery.eq(
      'city_slug',
      business.city_slug
    )
  }

  if (business.listing_type === 'repairs') {
    similarQuery = similarQuery.eq(
      'listing_type',
      'repairs'
    )
  } else if (business.primary_category) {
    similarQuery = similarQuery.eq(
      'primary_category',
      business.primary_category
    )
  }

  const { data: similar } =
    await similarQuery
      .order('rating', {
        ascending: false,
        nullsFirst: false,
      })
      .limit(4)

  // --------------------------------------------------
  // CLAIM / EDIT STATE
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isOwnerOrSubmitter = false
  let hasPendingEdit = false
  let hasPendingClaim = false

  if (user) {
    isOwnerOrSubmitter =
      business.owner_id === user.id ||
      (
        !!business.submitted_by_email &&
        business.submitted_by_email.toLowerCase() ===
          (user.email ?? '').toLowerCase()
      )

    if (isOwnerOrSubmitter) {
      const { data: pendingEdit } =
        await supabase
          .from('pending_edits')
          .select('id')
          .eq(
            'business_id',
            business.id
          )
          .eq(
            'submitted_by',
            user.id
          )
          .eq('status', 'pending')
          .maybeSingle()

      hasPendingEdit = !!pendingEdit
    } else if (!business.is_claimed) {
      const { data: pendingClaim } =
        await supabase
          .from('claim_requests')
          .select('id')
          .eq(
            'business_id',
            business.id
          )
          .eq(
            'user_id',
            user.id
          )
          .eq('status', 'pending')
          .maybeSingle()

      hasPendingClaim = !!pendingClaim
    }
  }

  // --------------------------------------------------
  // HOURS
  // --------------------------------------------------

  const openHours =
    business.open_hours as OpenHours | null

  const hasAnyHours =
    !!openHours &&
    DAY_ORDER.some(
      (day) =>
        openHours[day]?.open &&
        openHours[day]?.close
    )

  // --------------------------------------------------
  // RATING
  // --------------------------------------------------

  const rating =
    business.rating &&
    Number(business.rating) > 0
      ? Number(business.rating)
      : null

  const reviewCount =
    business.google_reviews_count
      ? parseInt(
          String(
            business.google_reviews_count
          ).replace(/[^\d]/g, ''),
          10
        )
      : null

  // --------------------------------------------------
  // SCHEMA
  // --------------------------------------------------

  const businessUrl =
    `https://www.lawnmowingnearme.org/listings/${business.slug}`

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',

    '@id': businessUrl,

    name: business.name,

    url: businessUrl,

    ...(business.phone && {
      telephone: business.phone,
    }),

    ...(business.website && {
      sameAs: [business.website],
    }),

    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          business.address,
        addressLocality:
          business.city || undefined,
        addressRegion:
          business.state || undefined,
        addressCountry:
          business.country || undefined,
      },
    }),

    ...(rating &&
      reviewCount &&
      reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        },
      }),
  }

  const breadcrumbItems = [
    {
      name: 'Home',
      url:
        'https://www.lawnmowingnearme.org',
    },

    {
      name: 'Near Me',
      url:
        'https://www.lawnmowingnearme.org/near-me',
    },

    ...(business.country_slug
      ? [
          {
            name: business.country,
            url:
              `https://www.lawnmowingnearme.org/near-me/${business.country_slug}`,
          },
        ]
      : []),

    ...(business.country_slug &&
    business.state_slug
      ? [
          {
            name: business.state,
            url:
              `https://www.lawnmowingnearme.org/near-me/${business.country_slug}/${business.state_slug}`,
          },
        ]
      : []),

    ...(cityPath
      ? [
          {
            name: business.city,
            url:
              `https://www.lawnmowingnearme.org${cityPath}`,
          },
        ]
      : []),

    {
      name: business.name,
      url: businessUrl,
    },
  ]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',

    itemListElement:
      breadcrumbItems.map(
        (item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })
      ),
  }

  return (
    <>
      {/* STRUCTURED DATA */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              localBusinessSchema
            ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* -------------------------------- */}
        {/* HEADER / HERO */}
        {/* -------------------------------- */}

        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-7"
            >

              <Link
                href="/"
                className="hover:text-green-600"
              >
                Home
              </Link>
              <span>›</span>
              <Link
                href="/near-me"
                className="hover:text-green-600"
              >
                Near Me
              </Link>
              {business.country_slug && (
                <>
                  <span>›</span>
                  <Link
                    href={`/near-me/${business.country_slug}`}
                    className="hover:text-green-600"
                  >
                    {business.country}
                  </Link>
                </>
              )}
              {business.state_slug && (
                <>
                  <span>›</span>
                  <Link
                    href={`/near-me/${business.country_slug}/${business.state_slug}`}
                    className="hover:text-green-600"
                  >
                    {business.state}
                  </Link>
                </>
              )}
              {cityPath && (
                <>
                  <span>›</span>
                  <Link
                    href={cityPath}
                    className="hover:text-green-600"
                  >
                    {business.city}
                  </Link>
                </>
              )}
              <span>›</span>
              <span className="text-gray-800">
                {business.name}
              </span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl shrink-0">
                  {business.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      {serviceLabel}
                    </span>
                    {business.is_claimed && (
                      <span className="inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <ShieldCheck size={15} />
                        Claimed
                      </span>
                    )}
                    {business.featured_until &&
                      new Date(
                        business.featured_until
                      ) > new Date() && (
                        <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                          ★ Featured
                        </span>
                      )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  {business.city && (
                    <div className="flex items-center gap-2 text-gray-600 mt-3">
                      <MapPin size={18} />
                      <span>
                        {business.city}
                        {business.state &&
                          `, ${business.state}`}
                      </span>
                    </div>
                  )}
                  {rating !== null && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Star
                        size={20}
                        className="text-yellow-500 fill-current"
                      />
                      <strong>
                        {rating.toFixed(1)}
                      </strong>
                      <span className="text-gray-500">
                        Google rating
                      </span>
                      {reviewCount !== null &&
                        reviewCount > 0 && (
                          <span className="text-gray-500">
                            ({reviewCount.toLocaleString()}{' '}
                            Google reviews)
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
              {/* Claim / edit */}
              <div>
                {isOwnerOrSubmitter ? (
                  hasPendingEdit ? (
                    <span className="inline-block text-sm bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                      Edit pending review
                    </span>
                  ) : (
                    <Link
                      href={`/my-listings/${business.id}/edit`}
                      className="inline-block bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                      Edit Listing
                    </Link>
                  )
                ) : business.is_claimed ? (
                  <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-3 rounded-lg">
                    <CheckCircle size={17} />
                    Claimed Listing
                  </span>
                ) : hasPendingClaim ? (
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg">
                    Claim pending review
                  </span>
                ) : (
                  <Link
                    href={`/claim/${business.id}`}
                    className="inline-block border border-green-600 text-green-700 px-5 py-3 rounded-lg hover:bg-green-50 transition"
                  >
                    Claim This Business
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* -------------------------------- */}
        {/* PAGE CONTENT */}
        {/* -------------------------------- */}

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ============================ */}
            {/* MAIN */}
            {/* ============================ */}
            <main className="lg:col-span-2 space-y-7">
              {/* CONTACT CTA */}
              <section className="bg-white border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-5">
                  Contact {business.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">

                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      <Phone size={19} />
                      Call {business.phone}
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 border border-gray-300 px-5 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      <Globe size={19} />
                      Visit Website
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
                {business.address && (
                  <div className="flex items-start gap-3 mt-6 pt-5 border-t text-gray-700">
                    <MapPin
                      size={19}
                      className="mt-1 shrink-0 text-gray-500"
                    />
                    <div>
                      <div>
                        {business.address}
                      </div>

                      <div className="text-gray-500">
                        {business.city}
                        {business.state &&
                          `, ${business.state}`}
                        {business.country &&
                          `, ${business.country}`}
                      </div>
                    </div>
                  </div>
                )}
              </section>
              {/* ABOUT */}
              <section className="bg-white border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">
                  About {business.name}
                </h2>
                {business.description ? (

                  <p className="text-gray-700 leading-7">
                    {business.description}
                  </p>

                ) : (
                  <p className="text-gray-700 leading-7">
                    {business.name} provides{' '}
                    {serviceLabel.toLowerCase()}{' '}
                    services in {business.city}
                    {business.state &&
                      `, ${business.state}`}.
                    Contact the business directly
                    for current services, pricing
                    and availability.
                  </p>
                )}
                {servicePath && (
                  <div className="mt-5">
                    <Link
                      href={servicePath}
                      className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline"
                    >
                      View more {serviceLabel} services
                      in {business.city}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </section>
              {/* BUSINESS HOURS */}
              <section className="bg-white border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="text-green-600" />
                  <h2 className="text-2xl font-bold">
                    Business Hours
                  </h2>
                </div>
                {hasAnyHours ? (

                  <div className="divide-y">

                    {DAY_ORDER.map(
                      (day) => {
                        const hours =
                          openHours![day]

                        const isOpen =
                          hours?.open &&
                          hours?.close

                        return (
                          <div
                            key={day}
                            className="flex justify-between gap-4 py-3"
                          >

                            <span className="capitalize font-medium text-gray-700">
                              {day}
                            </span>
                            <span className="text-gray-600">
                              {isOpen
                                ? `${to12h(
                                    hours.open!
                                  )} – ${to12h(
                                    hours.close!
                                  )}`
                                : 'Closed'}
                            </span>
                          </div>
                        )
                      }
                    )}
                    <p className="text-sm text-gray-500 pt-4">
                      Business hours may change.
                      Contact the business to
                      confirm before visiting.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Business hours have not been
                    listed. Contact the business
                    directly to confirm availability.
                  </p>
                )}
              </section>
              {/* BUSINESS INFORMATION */}
              <section className="bg-white border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-5">
                  Business Information
                </h2>
                <dl className="divide-y">
                  <div className="flex justify-between gap-6 py-3">
                    <dt className="text-gray-500">
                      Service
                    </dt>
                    <dd className="font-medium text-right">
                      {serviceLabel}
                    </dd>
                  </div>
                  {business.city && (
                    <div className="flex justify-between gap-6 py-3">
                      <dt className="text-gray-500">
                        Location
                      </dt>
                      <dd className="font-medium text-right">
                        {business.city}
                        {business.state &&
                          `, ${business.state}`}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-6 py-3">
                    <dt className="text-gray-500">
                      Listing status
                    </dt>
                    <dd className="font-medium text-right">
                      {business.is_claimed
                        ? 'Claimed'
                        : 'Unclaimed'}
                    </dd>
                  </div>
                  {rating !== null && (
                    <div className="flex justify-between gap-6 py-3">
                      <dt className="text-gray-500">
                        Google rating
                      </dt>
                      <dd className="font-medium text-right">
                        {rating.toFixed(1)} / 5
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
              {/* DISCOVER MORE */}
              {cityPath && (
                <section className="bg-green-50 border border-green-100 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Looking for more services in {business.city}?
                  </h2>
                  <p className="text-gray-600 mt-2 mb-4">
                    Compare other lawn care,
                    landscaping and mower businesses
                    serving the area.
                  </p>
                  <Link
                    href={cityPath}
                    className="inline-flex items-center gap-2 text-green-700 font-semibold"
                  >
                    Browse {business.city}
                    <ArrowRight size={17} />
                  </Link>
                </section>
              )}

            </main>
          {/* ============================ */}
            {/* SIDEBAR */}
            {/* ============================ */}
            <aside className="space-y-6">
              <WeatherWidget
                city={business.city || ''}
              />
              {business.address && (
                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="p-5 border-b">
                    <h2 className="font-bold text-lg">
                      Location
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {business.city}
                      {business.state &&
                        `, ${business.state}`}
                    </p>
                  </div>
                  <MapWrapper
                    businessName={
                      business.name
                    }
                    address={
                      business.address || ''
                    }
                    city={
                      business.city || ''
                    }
                    state={
                      business.state || ''
                    }
                    country={
                      business.country || ''
                    }
                  />
                </div>
              )}
              {/* SIMILAR BUSINESSES */}
              {similar &&
                similar.length > 0 && (
                  <section className="bg-white border rounded-xl p-5">
                    <h2 className="font-bold text-xl mb-1">
                      Similar Businesses
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                      More {serviceLabel.toLowerCase()}{' '}
                      providers in {business.city}.
                    </p>
                    <div className="divide-y">
                      {similar.map(
                        (biz) => (
                          <Link
                            key={biz.id}
                            href={`/listings/${biz.slug}`}
                            className="block py-4 first:pt-0 last:pb-0 group"
                          >
                            <div className="font-semibold text-gray-900 group-hover:text-green-600">
                              {biz.name}
                            </div>
                            <div className="flex items-center justify-between gap-3 mt-2">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin size={13} />
                                {biz.city}
                              </div>
                              {biz.rating &&
                                Number(
                                  biz.rating
                                ) > 0 && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Star
                                      size={13}
                                      className="text-yellow-500 fill-current"
                                    />
                                    {Number(
                                      biz.rating
                                    ).toFixed(1)}
                                  </div>
                                )}
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  </section>

                )}

              {/* CLAIM CTA */}

              {!business.is_claimed &&
                !isOwnerOrSubmitter &&
                !hasPendingClaim && (

                  <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">

                    <ShieldCheck className="text-blue-600 mb-3" />

                    <h2 className="font-bold text-lg">
                      Is this your business?
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 mb-4">
                      Claim this listing to manage
                      your business information and
                      keep your profile accurate.
                    </p>
                    <Link
                      href={`/claim/${business.id}`}
                      className="inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Claim This Business
                    </Link>
                  </section>
                )}
            </aside>
             {/* REQUEST A QUOTE */}
                        <div
                          id="request-quote"
                          className="mt-10 scroll-mt-24"
                        >
                          <RequestQuoteForm
                            businessId={business.id}
                            businessName={business.name}
                          />
                        </div>
          </div>
        </div>
      </div>
    </>
  )
}