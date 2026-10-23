// app/near-me/[location]/[state]/[city]/page.tsx

import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  SearchBar,
  ListingCard,
} from '@/components'

import NearMeFilters from '@/components/NearmeFilter'
import CityContent from '@/components/CityContent'
import WeatherWidget from '@/components/WeatherWidget'
import RequestQuoteForm from '@/components/leads/RequestQuoteForm'
import TrackedLink from '@/components/analytics/TrackedLink'

import {
  MapPin,
  PlusCircle,
  Star,
  Layers3,
} from 'lucide-react'

interface PageProps {
  params: Promise<{
    location: string
    state: string
    city: string
  }>

  searchParams: Promise<{
    [key: string]:
      | string
      | string[]
      | undefined
  }>
}

const cityServices = [
  {
    slug: 'lawn-care',
    label: 'Lawn Care',
    primaryCategory: 'Lawn Care',
  },
  {
    slug: 'landscaping',
    label: 'Landscaping',
    primaryCategory: 'Landscaping',
  },
  {
    slug: 'garden-design',
    label: 'Garden Design',
    primaryCategory: 'Garden Design',
  },
  {
    slug: 'tree-services',
    label: 'Tree Services',
    primaryCategory: 'Tree Services',
  },
  {
    slug: 'hardscaping',
    label: 'Hardscaping',
    primaryCategory: 'Hardscaping',
  },
  {
    slug: 'mower-repair',
    label: 'Lawn Mower Repair',
    listingType: 'repairs',
  },
]

function slugToReadable(
  slug: string
) {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    )
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
    typeof rating === 'number'
      ? rating
      : parseFloat(rating)

  return Number.isNaN(parsed)
    ? 0
    : parsed
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
  } = await params

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

  const title =
    `Lawn Care & Mower Services in ${location.city}, ${location.state}`

  const description =
    `Find lawn care, lawn mowing, landscaping and mower services in ${location.city}, ${location.state}. Compare local businesses, ratings and services.`

  const canonical =
    `/near-me/${location.country_slug}/${location.state_slug}/${location.city_slug}`

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

// ==================================================
// PAGE
// ==================================================
export const revalidate = 3600;
export default async function CityPage({
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
  } = await params

  const resolvedSearchParams =
    (await searchParams) || {}

  const supabase =
    await createClient()

  const selectedCategory =
    typeof resolvedSearchParams.category ===
    'string'
      ? resolvedSearchParams.category
      : 'all'

  const selectedRating =
    typeof resolvedSearchParams.rating ===
    'string'
      ? resolvedSearchParams.rating
      : ''

  const sortBy =
    typeof resolvedSearchParams.sort ===
    'string'
      ? resolvedSearchParams.sort
      : 'rating'

  // ==================================================
  // LOAD BUSINESSES
  // ==================================================

  const {
    data:
      allCityBusinesses,
    error,
  } = await supabase
    .from('businesses')
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

  if (error) {
    console.error(
      'City page query error:',
      error
    )

    notFound()
  }

  if (
    !allCityBusinesses ||
    allCityBusinesses.length ===
      0
  ) {
    notFound()
  }

  const firstBusiness =
    allCityBusinesses[0]

  const city =
    firstBusiness.city ||
    slugToReadable(
      citySlug
    )

  const state =
    firstBusiness.state ||
    slugToReadable(
      stateSlug
    )

  const country =
    firstBusiness.country ||
    slugToReadable(
      countrySlug
    )

  // ==================================================
  // STATS
  // ==================================================

  const totalCityBusinesses =
    allCityBusinesses.length

  const ratedBusinesses =
    allCityBusinesses.filter(
      (business) =>
        parseRating(
          business.rating
        ) > 0
    )

  const cityAvgRating =
    ratedBusinesses.length >
    0
      ? ratedBusinesses.reduce(
          (
            sum,
            business
          ) =>
            sum +
            parseRating(
              business.rating
            ),
          0
        ) /
        ratedBusinesses.length
      : 0

  const allCategoriesInCity =
    [
      ...new Set(
        allCityBusinesses
          .map(
            (
              business
            ) =>
              business.primary_category
          )
          .filter(
            (
              category
            ): category is string =>
              Boolean(
                category
              )
          )
      ),
    ].sort()

  // ==================================================
  // SERVICE COUNTS
  // ==================================================

  const serviceCounts =
    cityServices
      .map(
        (
          service
        ) => {
          const count =
            allCityBusinesses.filter(
              (
                business
              ) => {
                if (
                  service.primaryCategory
                ) {
                  return (
                    business.primary_category ===
                    service.primaryCategory
                  )
                }

                if (
                  service.listingType
                ) {
                  return (
                    business.listing_type ===
                    service.listingType
                  )
                }

                return false
              }
            ).length

          return {
            ...service,
            count,
          }
        }
      )
      .filter(
        (
          service
        ) =>
          service.count >
          0
      )

  // ==================================================
  // FILTERING
  // ==================================================

  let businesses = [
    ...allCityBusinesses,
  ]

  if (
    selectedCategory !==
      'all' &&
    selectedCategory
  ) {
    businesses =
      businesses.filter(
        (
          business
        ) =>
          business.primary_category ===
          selectedCategory
      )
  }

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

  const hasActiveFilters =
    selectedCategory !==
      'all' ||
    selectedRating !==
      '' ||
    sortBy !== 'rating'

  // ==================================================
  // OTHER CITIES
  // ==================================================

  const {
    data:
      stateBusinesses,
  } =
    await supabase
      .from(
        'businesses'
      )
      .select(`
        city,
        city_slug
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
        'status',
        'approved'
      )
      .neq(
        'city_slug',
        citySlug
      )

  const nearbyCityMap =
    new Map<
      string,
      {
        city: string
        citySlug: string
        count: number
      }
    >()

  for (
    const business of
    stateBusinesses ||
    []
  ) {
    if (
      !business.city ||
      !business.city_slug
    ) {
      continue
    }

    const existing =
      nearbyCityMap.get(
        business.city_slug
      )

    if (existing) {
      existing.count++
    } else {
      nearbyCityMap.set(
        business.city_slug,
        {
          city:
            business.city,

          citySlug:
            business.city_slug,

          count: 1,
        }
      )
    }
  }

  const nearbyCities =
    Array.from(
      nearbyCityMap.values()
    )
      .sort(
        (
          a,
          b
        ) =>
          b.count -
          a.count
      )
      .slice(
        0,
        8
      )

  const basePath =
    `/near-me/${countrySlug}/${stateSlug}/${citySlug}`

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

            <span className="font-semibold">
              {city}
            </span>

          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

            <div className="max-w-4xl">

              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-start gap-3">

                <MapPin
                  size={40}
                  className="shrink-0 mt-1"
                />

                <span>
                  Lawn Care & Mower
                  Services in{' '}
                  {city},{' '}
                  {state}
                </span>

              </h1>

              <p className="text-xl text-white/90 max-w-3xl">

                Compare local
                lawn care,
                landscaping and
                lawn mower
                professionals
                serving{' '}
                {city}.

              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 w-full lg:w-auto">

              <div className="bg-white/20 backdrop-blur rounded-xl p-4 min-w-[180px]">

                <div className="text-3xl font-bold">
                  {
                    totalCityBusinesses
                  }
                </div>

                <div className="text-sm text-white/90">
                  Local Businesses
                </div>

              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4 min-w-[180px]">

                <div className="flex items-center gap-2">

                  <Star
                    size={22}
                    className="fill-current"
                  />

                  <div className="text-3xl font-bold">

                    {cityAvgRating >
                    0
                      ? cityAvgRating.toFixed(
                          1
                        )
                      : '—'}

                  </div>

                </div>

                <div className="text-sm text-white/90">
                  Average Rating
                </div>

              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-4 min-w-[180px]">

                <div className="flex items-center gap-2">

                  <Layers3
                    size={22}
                  />

                  <div className="text-3xl font-bold">
                    {
                      serviceCounts.length
                    }
                  </div>

                </div>

                <div className="text-sm text-white/90">
                  Service Types
                </div>

              </div>

            </div>

          </div>

          <div className="mt-6 max-w-md">

            <WeatherWidget
              city={city}
              state={state}
              country={country}
            />

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* SERVICE SHORTCUTS */}
      {/* ================================================== */}

      {serviceCounts.length >
        0 && (

        <section className="bg-white border-b py-10">

          <div className="container mx-auto px-4">

            <div className="mb-6">

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Find Services in{' '}
                {city}
              </h2>

              <p className="text-gray-600 mt-2">

                Choose the type of
                lawn or mower service
                you need.

              </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

              {serviceCounts.map(
                (
                  service
                ) => (

                  <Link
                    key={
                      service.slug
                    }
                    href={`${basePath}/${service.slug}`}
                    className="group border rounded-xl p-4 text-center hover:border-green-400 hover:shadow-sm transition"
                  >

                    <div className="font-semibold text-gray-900 group-hover:text-green-600 transition">
                      {
                        service.label
                      }
                    </div>

                    <div className="text-sm text-gray-500 mt-2">

                      {
                        service.count
                      }{' '}

                      {service.count ===
                      1
                        ? 'business'
                        : 'businesses'}

                    </div>

                  </Link>

                )
              )}

            </div>

          </div>

        </section>

      )}

      {/* ================================================== */}
      {/* BUSINESS LISTINGS */}
      {/* ================================================== */}

      <section className="container mx-auto px-4 py-12">

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-gray-900">

            Local Lawn & Mower
            Businesses in{' '}
            {city}

          </h2>

          <p className="text-gray-600 mt-2 max-w-3xl">

            Compare local
            providers, ratings,
            services and contact
            details.

          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FILTERS */}

          <aside className="lg:col-span-1">

            <div className="lg:sticky lg:top-24">

              <NearMeFilters
                basePath={
                  basePath
                }
                city={
                  city
                }
                categoriesInCity={
                  allCategoriesInCity
                }
                totalBusinesses={
                  totalCityBusinesses
                }
                avgRating={
                  cityAvgRating
                }
                selectedCategory={
                  selectedCategory
                }
                selectedRating={
                  selectedRating
                }
                sortBy={
                  sortBy
                }
              />

            </div>

          </aside>

          {/* RESULTS */}

          <div className="lg:col-span-2">

            <div className="mb-5">

              <SearchBar
                variant="compact"
                placeholder={`Search lawn services in ${city}...`}
              />

            </div>

            <div className="bg-white border rounded-xl p-4 mb-5 flex flex-wrap justify-between items-center gap-3">

              <p className="text-gray-600 text-sm">

                Showing{' '}

                <span className="font-semibold text-green-600">
                  {
                    businesses.length
                  }
                </span>{' '}

                {businesses.length ===
                1
                  ? 'business'
                  : 'businesses'}{' '}

                in{' '}
                {city},{' '}
                {state}

                {hasActiveFilters && (

                  <span className="text-gray-400 ml-2">
                    (filtered)
                  </span>

                )}

              </p>

              {hasActiveFilters && (

                <Link
                  href={
                    basePath
                  }
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Clear all filters
                </Link>

              )}

            </div>

            {businesses.length >
            0 ? (

              <div className="space-y-4">

                {businesses.map(
                  (
                    business
                  ) => (

                    <ListingCard
                      key={
                        business.id
                      }
                      business={
                        business
                      }
                      variant="default"
                    />

                  )
                )}

              </div>

            ) : (

              <div className="bg-white border rounded-xl p-12 text-center">

                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">

                  <MapPin
                    size={40}
                    className="text-green-600"
                  />

                </div>

                <h2 className="text-2xl font-bold mb-3">
                  No matching businesses found
                </h2>

                <p className="text-gray-500 mb-6">

                  No businesses
                  match your current
                  filters.

                </p>

                <Link
                  href={
                    basePath
                  }
                  className="inline-flex bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Clear Filters
                </Link>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* CITY CONTENT */}
      {/* ================================================== */}

      <section className="bg-gray-50 border-t py-12">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl">

            <CityContent
              city={
                city
              }
              totalBusinesses={
                totalCityBusinesses
              }
              avgRating={
                cityAvgRating
              }
              categoriesInCity={
                allCategoriesInCity
              }
            />

          </div>

        </div>

      </section>

      {/* ================================================== */}
      {/* NEARBY CITIES */}
      {/* ================================================== */}

      {nearbyCities.length >
        0 && (

        <section className="border-t py-12">

          <div className="container mx-auto px-4">

            <div className="mb-7">

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">

                More Lawn Services
                in{' '}
                {state}

              </h2>

              <p className="text-gray-600 mt-2">

                Browse lawn and
                mower businesses
                in other cities
                across{' '}
                {state}.

              </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {nearbyCities.map(
                (
                  nearbyCity
                ) => (

                  <Link
                    key={
                      nearbyCity.citySlug
                    }
                    href={`/near-me/${countrySlug}/${stateSlug}/${nearbyCity.citySlug}`}
                    className="bg-white border rounded-xl p-4 hover:shadow-md hover:border-green-300 transition"
                  >

                    <div className="font-semibold text-gray-900">
                      {
                        nearbyCity.city
                      }
                    </div>

                    <div className="text-sm text-gray-500 mt-1">

                      {
                        nearbyCity.count
                      }{' '}

                      {nearbyCity.count ===
                      1
                        ? 'business'
                        : 'businesses'}

                    </div>

                  </Link>

                )
              )}

            </div>

          </div>

        </section>

      )}

      {/* ================================================== */}
      {/* BUSINESS CTA */}
      {/* ================================================== */}

      <section className="bg-green-50 border-t py-12">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto text-center">

            <PlusCircle
              size={40}
              className="text-green-600 mx-auto mb-4"
            />

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">

              Own a Lawn or
              Mower Business in{' '}
              {city}?

            </h2>

            <p className="text-gray-600 mt-3 mb-6 max-w-2xl mx-auto">

              Add your business to
              Lawn Mowing Near Me
              and reach customers
              looking for lawn
              care, landscaping
              and mower services
              in your area.

            </p>

            <TrackedLink
              href="/submit-business"
              event="submit-business"
              properties={{
                city,
                state,
                country,
                service:
                  'All Services',
              }}
              className="inline-flex bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Suggest a Business
            </TrackedLink>

          </div>

        </div>

        <div className="container mx-auto px-4 mt-10">

          <div
            id="request-quote"
            className="max-w-4xl mx-auto scroll-mt-24"
          >

            <RequestQuoteForm
              city={
                city
              }
              state={
                state
              }
              country={
                country
              }
              service="Lawn Care"
              sourcePage={
                basePath
              }
              title={`Request a Lawn Care Quote in ${city}`}
            />

          </div>

        </div>

      </section>
    </>
  )
}