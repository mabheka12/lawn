import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RelatedLawnProducts from '@/components/products/RelatedLawnProducts'
import {
  SERVICE_PRODUCT_CATEGORIES,
} from '@/lib/service-product-categories'

import {
  ListingCard,
  SearchBar,
} from '@/components'

import {
  ArrowLeft,
  MapPin,
  PlusCircle,
} from 'lucide-react'

import RequestQuoteForm from '@/components/leads/RequestQuoteForm'
import TrackedLink from '@/components/analytics/TrackedLink'

interface PageProps {
  params: Promise<{
    location: string
    state: string
    city: string
    service: string
  }>

  searchParams: Promise<{
    [key: string]:
      | string
      | string[]
      | undefined
  }>
}

type ServiceDefinition = {
  slug: string
  label: string
  description: string

  primaryCategories?: string[]
  listingTypes?: string[]
}

const services: Record<
  string,
  ServiceDefinition
> = {
  'lawn-care': {
    slug:
      'lawn-care',

    label:
      'Lawn Care',

    description:
      'Find local lawn care professionals for mowing, lawn maintenance, edging, fertilization, cleanups and general yard care.',

    primaryCategories: [
      'Lawn Care',
    ],
  },

  landscaping: {
    slug:
      'landscaping',

    label:
      'Landscaping',

    description:
      'Compare local landscaping companies for garden improvements, landscape maintenance, planting and outdoor projects.',

    primaryCategories: [
      'Landscaping',
    ],
  },

  'garden-design': {
    slug:
      'garden-design',

    label:
      'Garden Design',

    description:
      'Find local garden designers and landscape professionals for garden planning, planting and outdoor design.',

    primaryCategories: [
      'Garden Design',
    ],
  },

  hardscaping: {
    slug:
      'hardscaping',

    label:
      'Hardscaping',

    description:
      'Find local hardscaping professionals for patios, pathways, retaining walls and other outdoor construction projects.',

    primaryCategories: [
      'Hardscaping',
    ],
  },

  'tree-services': {
    slug:
      'tree-services',

    label:
      'Tree Services',

    description:
      'Find local tree care professionals for pruning, trimming, tree maintenance and related services.',

    primaryCategories: [
      'Tree Services',
    ],
  },

  'turf-installation': {
    slug:
      'turf-installation',

    label:
      'Turf Installation',

    description:
      'Find local turf and sod professionals for new lawns, turf replacement and lawn installation projects.',

    primaryCategories: [
      'Turf Installation',
    ],
  },

  'mower-repair': {
    slug:
      'mower-repair',

    label:
      'Lawn Mower Repair',

    description:
      'Find nearby lawn mower repair shops, small engine specialists and outdoor power equipment repair services.',

    listingTypes: [
      'repairs',
    ],
  },
}

function parseRating(
  rating:
    | string
    | number
    | null
): number {
  if (
    rating === null ||
    rating === undefined
  ) {
    return 0
  }

  const parsed =
    typeof rating ===
    'number'
      ? rating
      : parseFloat(
          rating
        )

  return Number.isNaN(
    parsed
  )
    ? 0
    : parsed
}

function getServiceDefinition(
  slug: string
): ServiceDefinition | null {
  return (
    services[slug] ||
    null
  )
}

// ==================================================
// METADATA
// ==================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    location:
      countrySlug,
    state:
      stateSlug,
    city:
      citySlug,
    service:
      serviceSlug,
  } = await params

  const service =
    getServiceDefinition(
      serviceSlug
    )

  if (!service) {
    return {
      title:
        'Service Not Found | Lawn Mowing Near Me',

      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const supabase =
    await createClient()

  const {
    data: location,
  } = await supabase
    .from('businesses')
    .select(`
      city,
      city_slug,
      state,
      state_slug,
      country,
      country_slug
    `)
    .eq(
      'country_slug',
      countrySlug
    )
    .eq(
      'state_slug',
      stateSlug
    )
    .eq(
      'city_slug',
      citySlug
    )
    .eq(
      'status',
      'approved'
    )
    .limit(1)
    .maybeSingle()

  if (!location) {
    return {
      title:
        'Location Not Found | Lawn Mowing Near Me',

      robots: {
        index: false,
        follow: false,
      },
    }
  }

  let countQuery =
    supabase
      .from(
        'businesses'
      )
      .select(
        'id',
        {
          count: 'exact',
          head: true,
        }
      )
      .eq(
        'country_slug',
        countrySlug
      )
      .eq(
        'state_slug',
        stateSlug
      )
      .eq(
        'city_slug',
        citySlug
      )
      .eq(
        'status',
        'approved'
      )

  if (
    service.primaryCategories &&
    service.primaryCategories.length >
      0
  ) {
    countQuery =
      countQuery.in(
        'primary_category',
        service.primaryCategories
      )
  }

  if (
    service.listingTypes &&
    service.listingTypes.length >
      0
  ) {
    countQuery =
      countQuery.in(
        'listing_type',
        service.listingTypes
      )
  }

  const {
    count,
  } = await countQuery

  const title =
    `${service.label} in ${location.city}, ${location.state}`

  const description =
    `Find ${service.label.toLowerCase()} businesses in ${location.city}, ${location.state}. Compare local providers, ratings, contact details and services.`

  const canonical =
    `/near-me/${location.country_slug}/${location.state_slug}/${location.city_slug}/${service.slug}`

  const shouldIndex =
    (count || 0) >=
    3

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    robots: {
      index:
        shouldIndex,

      follow:
        true,
    },

    openGraph: {
      title,
      description,
      url:
        canonical,
      type:
        'website',
    },
  }
}

// ==================================================
// PAGE
// ==================================================

export default async function ServiceCityPage({
  params,
  searchParams,
}: PageProps) {
  const {
    location:
      countrySlug,
    state:
      stateSlug,
    city:
      citySlug,
    service:
      serviceSlug,
  } = await params

  const resolvedSearchParams =
    (await searchParams) ||
    {}

  const service =
    getServiceDefinition(
      serviceSlug
    )

  if (!service) {
    notFound()
  }

  const supabase =
    await createClient()

  const sortBy =
    typeof resolvedSearchParams.sort ===
    'string'
      ? resolvedSearchParams.sort
      : 'rating'

  const selectedRating =
    typeof resolvedSearchParams.rating ===
    'string'
      ? resolvedSearchParams.rating
      : ''

  // ==================================================
  // LOAD LOCATION
  // ==================================================

  const {
    data: location,
  } = await supabase
    .from('businesses')
    .select(`
      city,
      city_slug,
      state,
      state_slug,
      country,
      country_slug
    `)
    .eq(
      'country_slug',
      countrySlug
    )
    .eq(
      'state_slug',
      stateSlug
    )
    .eq(
      'city_slug',
      citySlug
    )
    .eq(
      'status',
      'approved'
    )
    .limit(1)
    .maybeSingle()

  if (!location) {
    notFound()
  }

  // ==================================================
  // LOAD SERVICE BUSINESSES
  // ==================================================

  let query =
    supabase
      .from(
        'businesses'
      )
      .select('*')
      .eq(
        'country_slug',
        countrySlug
      )
      .eq(
        'state_slug',
        stateSlug
      )
      .eq(
        'city_slug',
        citySlug
      )
      .eq(
        'status',
        'approved'
      )

  if (
    service.primaryCategories &&
    service.primaryCategories.length >
      0
  ) {
    query =
      query.in(
        'primary_category',
        service.primaryCategories
      )
  }

  if (
    service.listingTypes &&
    service.listingTypes.length >
      0
  ) {
    query =
      query.in(
        'listing_type',
        service.listingTypes
      )
  }

  const {
    data:
      serviceBusinesses,
    error,
  } = await query

  if (error) {
    console.error(
      'Service city query error:',
      error
    )

    notFound()
  }

  if (
    !serviceBusinesses ||
    serviceBusinesses.length ===
      0
  ) {
    notFound()
  }

  let businesses = [
    ...serviceBusinesses,
  ]

  // ==================================================
  // RATING FILTER
  // ==================================================

  if (
    selectedRating
  ) {
    const minRating =
      parseFloat(
        selectedRating
      )

    if (
      !Number.isNaN(
        minRating
      )
    ) {
      businesses =
        businesses.filter(
          (
            business
          ) =>
            parseRating(
              business.rating
            ) >=
            minRating
        )
    }
  }

  // ==================================================
  // SORTING
  // ==================================================

  const now =
    new Date()

  businesses.sort(
    (
      a,
      b
    ) => {
      const aFeatured =
        a.featured_until &&
        new Date(
          a.featured_until
        ) >
          now

      const bFeatured =
        b.featured_until &&
        new Date(
          b.featured_until
        ) >
          now

      if (
        aFeatured &&
        !bFeatured
      ) {
        return -1
      }

      if (
        !aFeatured &&
        bFeatured
      ) {
        return 1
      }

      switch (
        sortBy
      ) {
        case 'name':
          return (
            a.name ||
            ''
          ).localeCompare(
            b.name ||
              ''
          )

        case 'recent':
          return (
            new Date(
              b.created_at ||
                0
            ).getTime() -
            new Date(
              a.created_at ||
                0
            ).getTime()
          )

        case 'rating':
        default:
          return (
            parseRating(
              b.rating
            ) -
            parseRating(
              a.rating
            )
          )
      }
    }
  )

  const city =
    location.city

  const state =
    location.state

  const country =
    location.country

  const totalBusinesses =
    serviceBusinesses.length

  const ratedBusinesses =
    serviceBusinesses.filter(
      (
        business
      ) =>
        parseRating(
          business.rating
        ) > 0
    )

  const avgRating =
    ratedBusinesses.length >
    0
      ? ratedBusinesses.reduce(
          (
            total,
            business
          ) =>
            total +
            parseRating(
              business.rating
            ),
          0
        ) /
        ratedBusinesses.length
      : 0

  const basePath =
    `/near-me/${countrySlug}/${stateSlug}/${citySlug}/${serviceSlug}`

  const cityPath =
    `/near-me/${countrySlug}/${stateSlug}/${citySlug}`

  const hasActiveFilters =
    selectedRating !==
      '' ||
    sortBy !==
      'rating'

  return (
    <>
      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">

        <div className="container mx-auto px-4">

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm mb-5"
          >

            <Link
              href="/"
              className="text-white/80 hover:text-white"
            >
              Home
            </Link>

            <span>
              ›
            </span>

            <Link
              href="/near-me"
              className="text-white/80 hover:text-white"
            >
              Near Me
            </Link>

            <span>
              ›
            </span>

            <Link
              href={`/near-me/${countrySlug}`}
              className="text-white/80 hover:text-white"
            >
              {country}
            </Link>

            <span>
              ›
            </span>

            <Link
              href={`/near-me/${countrySlug}/${stateSlug}`}
              className="text-white/80 hover:text-white"
            >
              {state}
            </Link>

            <span>
              ›
            </span>

            <Link
              href={
                cityPath
              }
              className="text-white/80 hover:text-white"
            >
              {city}
            </Link>

            <span>
              ›
            </span>

            <span className="font-semibold">
              {
                service.label
              }
            </span>

          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

            <div className="max-w-4xl">

              <h1 className="text-4xl md:text-5xl font-bold flex items-start gap-3">

                <MapPin
                  size={40}
                  className="shrink-0 mt-1"
                />

                <span>

                  {
                    service.label
                  }{' '}
                  in{' '}
                  {city},{' '}
                  {state}

                </span>

              </h1>

              <p className="text-xl text-white/90 mt-4 max-w-3xl">

                {
                  service.description
                }

              </p>

            </div>

            <div className="bg-white/20 backdrop-blur rounded-xl p-5 min-w-[210px]">

              <div className="text-4xl font-bold">
                {
                  totalBusinesses
                }
              </div>

              <div className="text-sm text-white/90">

                {
                  service.label
                }{' '}

                {totalBusinesses ===
                1
                  ? 'Business'
                  : 'Businesses'}

              </div>

              {avgRating >
                0 && (

                <div className="mt-3 text-sm">

                  Average rating:{' '}

                  <strong>
                    {
                      avgRating.toFixed(
                        1
                      )
                    }
                  </strong>

                </div>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* QUICK QUOTE CTA */}

      <section className="border-b bg-green-50">

        <div className="container mx-auto px-4 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="font-bold text-gray-900 text-lg">

                Need{' '}
                {service.label.toLowerCase()}{' '}
                in{' '}
                {city}?

              </p>

              <p className="text-sm text-gray-600 mt-1">

                Tell us what you need
                and submit a free quote
                request.

              </p>

            </div>

            <a
              href="#request-quote"
              className="inline-flex items-center justify-center bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
            >
              Get a Free Quote
            </a>

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================== */}

      <main className="container mx-auto px-4 py-10">

        <div className="mb-6">

          <Link
            href={
              cityPath
            }
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >

            <ArrowLeft
              size={18}
            />

            All services in{' '}
            {city}

          </Link>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* SIDEBAR */}

          <aside className="lg:col-span-1">

            <div className="bg-white border rounded-xl p-6 sticky top-24">

              <h2 className="text-xl font-bold mb-5">
                Filter Results
              </h2>

              {/* RATING */}

              <div className="mb-6">

                <label
                  htmlFor="rating"
                  className="block font-medium text-gray-900 mb-2"
                >
                  Minimum Rating
                </label>

                <div className="space-y-2">

                  {[
                    '',
                    '4',
                    '4.5',
                  ].map(
                    (
                      rating
                    ) => {
                      const params =
                        new URLSearchParams()

                      if (
                        rating
                      ) {
                        params.set(
                          'rating',
                          rating
                        )
                      }

                      if (
                        sortBy !==
                        'rating'
                      ) {
                        params.set(
                          'sort',
                          sortBy
                        )
                      }

                      const href =
                        params.toString()
                          ? `${basePath}?${params.toString()}`
                          : basePath

                      return (
                        <Link
                          key={
                            rating ||
                            'all'
                          }
                          href={
                            href
                          }
                          className={`block px-3 py-2 rounded-lg ${
                            selectedRating ===
                            rating
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >

                          {rating
                            ? `${rating}+ stars`
                            : 'All ratings'}

                        </Link>
                      )
                    }
                  )}

                </div>

              </div>

              {/* SORT */}

              <div>

                <div className="font-medium text-gray-900 mb-2">
                  Sort By
                </div>

                <div className="space-y-2">

                  {[
                    {
                      value:
                        'rating',
                      label:
                        'Highest Rated',
                    },
                    {
                      value:
                        'name',
                      label:
                        'Business Name',
                    },
                    {
                      value:
                        'recent',
                      label:
                        'Recently Added',
                    },
                  ].map(
                    (
                      option
                    ) => {
                      const params =
                        new URLSearchParams()

                      if (
                        selectedRating
                      ) {
                        params.set(
                          'rating',
                          selectedRating
                        )
                      }

                      if (
                        option.value !==
                        'rating'
                      ) {
                        params.set(
                          'sort',
                          option.value
                        )
                      }

                      const href =
                        params.toString()
                          ? `${basePath}?${params.toString()}`
                          : basePath

                      return (
                        <Link
                          key={
                            option.value
                          }
                          href={
                            href
                          }
                          className={`block px-3 py-2 rounded-lg ${
                            sortBy ===
                            option.value
                              ? 'bg-green-100 text-green-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {
                            option.label
                          }
                        </Link>
                      )
                    }
                  )}

                </div>

              </div>

              {hasActiveFilters && (

                <Link
                  href={
                    basePath
                  }
                  className="block text-center mt-6 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear Filters
                </Link>

              )}

            </div>

          </aside>

          {/* RESULTS */}

          <section className="lg:col-span-2">

            <SearchBar
              variant="compact"
              placeholder={`Search ${service.label.toLowerCase()} in ${city}...`}
            />

            <div className="bg-white border rounded-xl p-4 my-5">

              <p className="text-gray-600 text-sm">

                Showing{' '}

                <strong className="text-green-600">
                  {
                    businesses.length
                  }
                </strong>{' '}

                {service.label.toLowerCase()}{' '}

                {businesses.length ===
                1
                  ? 'business'
                  : 'businesses'}{' '}

                in{' '}
                {city},{' '}
                {state}
              </p>
            </div>
            {businesses.length >
            0 ? (
              <div className="space-y-4">
                {businesses.map(
                  (
                    business
                  ) => (
                    <ListingCard
                      key={business.id}
                      business={business}variant="default"
                    />
                  )
                )}
              </div>
            ) : (

              <div className="border rounded-xl p-10 text-center bg-white">
                <MapPin
                  size={38}
                  className="text-green-600 mx-auto mb-4"
                />
                <h2 className="text-xl font-bold">
                  No matching businesses
                </h2>
                <p className="text-gray-500 mt-2">
                  Try removing your filters.
                </p>
                <Link
                  href={basePath}className="inline-block mt-5 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
                >
                  Clear Filters
                </Link>
              </div>
            )}

            {/* REQUEST A QUOTE */}
              <div
                id="request-quote"
                className="mt-10 scroll-mt-24"
              >
                <RequestQuoteForm
                  city={city}
                  state={state}
                  country={country}
                  service={service.label}
                  sourcePage={basePath}
                  title={`Request a ${service.label} Quote in ${city}`}
                />
              </div>

              {/* RELATED PRODUCTS */}
              {SERVICE_PRODUCT_CATEGORIES[serviceSlug]?.length > 0 && (
                <div className="mt-10">
                  <RelatedLawnProducts
                    categories={
                      SERVICE_PRODUCT_CATEGORIES[
                        serviceSlug
                      ]
                    }
                    title={`${service.label} Products & Equipment`}
                    description={`Browse equipment and lawn-care products related to ${service.label.toLowerCase()}.`}
                    limit={3}
                  />
                </div>
              )}


          </section>
        </div>
      </main>
      {/* ================================================== */}
      {/* LOCAL CONTENT */}
      {/* ================================================== */}

      <section className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold">
              Finding{' '}
              {service.label}{' '}
              in{' '}
              {city}
            </h2>
            <p className="text-gray-600 leading-relaxed mt-4">
              Looking for{' '}
              {service.label.toLowerCase()}{' '}
              in{' '}
              {city},{' '}
              {state}?
              Compare local
              businesses above
              based on ratings,
              services and contact
              information. Contact
              providers directly to
              discuss availability,
              pricing and the
              specific work you
              need.
            </p>
            <h2 className="text-2xl font-bold mt-8">
              Choosing a Local Provider
            </h2>
            <p className="text-gray-600 leading-relaxed mt-4">
              Before hiring a local
              provider, compare
              experience, customer
              ratings, the services
              offered and whether
              the company works in
              your specific area.
              For larger jobs,
              consider requesting
              estimates from more
              than one business
              before making a
              decision.
            </p>
          </div>
        </div>
      </section>
      {/* ================================================== */}
      {/* BUSINESS CTA */}
      {/* ================================================== */}

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
            <PlusCircle
              size={36}
              className="text-green-600 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold">
              Offer{' '}
              {
                service.label
              }{' '}
              in{' '}
              {city}?
            </h2>
            <p className="text-gray-600 mt-2 mb-5">
              Add your business to
              Lawn Mowing Near Me
              and reach people
              searching for local
              services.
            </p>
            <TrackedLink
              href="/submit-business"
              event="submit-business"
              properties={{
                city,
                state,
                country,
                service:
                  service.label,
              }}
              className="inline-flex bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Suggest a Business
            </TrackedLink>
          </div>
        </div>
      </section>
    </>
  )
}