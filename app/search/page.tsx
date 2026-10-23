
import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Search, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import SearchBar from '@/components/Searchbar'

export const metadata: Metadata = {
  title: 'Search Lawn Care & Mower Services Near You',
  description:
    'Search lawn mowing, landscaping, garden care and lawn mower repair businesses by keyword and location.',
  robots: {
    index: false,
    follow: true,
  },
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[]
    location?: string | string[]
  }>
}

type Business = {
  id: number
  name: string
  slug: string
  description: string | null
  city: string | null
  state: string | null
  country: string | null
  address: string | null
  rating: number | string | null
  phone: string | null
  primary_category: string | null
  listing_type: string | null
}

function getSingleParam(
  value: string | string[] | undefined
): string {
  return (Array.isArray(value) ? value[0] : value ?? '').trim()
}

// Remove PostgREST filter syntax characters before building OR filters.
function cleanFilterValue(value: string): string {
  return value
    .replace(/[,%()_*\\]/g, ' ')
    .replace(/[^\p{L}\p{N}\s.'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeOrFilter(
  columns: string[],
  value: string
): string {
  const safeValue = cleanFilterValue(value)

  return columns
    .map((column) => `${column}.ilike.%${safeValue}%`)
    .join(',')
}

function parseCoordinates(value: string) {
  const match = value.match(
    /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/
  )

  if (!match) return null

  const latitude = Number(match[1])
  const longitude = Number(match[2])

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return { latitude, longitude }
}

async function reverseGeocode(location: string) {
  const coordinates = parseCoordinates(location)

  if (!coordinates) {
    return {
      searchLocation: location,
      resolvedCity: '',
      error: '',
    }
  }

  try {
    const url = new URL(
      'https://api.bigdatacloud.net/data/reverse-geocode-client'
    )

    url.searchParams.set(
      'latitude',
      String(coordinates.latitude)
    )
    url.searchParams.set(
      'longitude',
      String(coordinates.longitude)
    )
    url.searchParams.set('localityLanguage', 'en')

    const response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }

    const data = await response.json()

    const city = String(
      data.city ||
      data.locality ||
      data.localityInfo?.administrative?.find(
        (item: { adminLevel?: number }) =>
          item.adminLevel === 8
      )?.name ||
      ''
    ).trim()

    const state = String(
      data.principalSubdivision || ''
    ).trim()

    const country = String(
      data.countryName || ''
    ).trim()

    // Prefer the city to avoid accidentally matching every
    // business in a large state or country.
    const searchLocation = city || state || country

    return {
      searchLocation,
      resolvedCity: city,
      error: searchLocation
        ? ''
        : 'We could not identify a nearby city from your coordinates. Try entering your city or town instead.',
    }
  } catch {
    return {
      searchLocation: '',
      resolvedCity: '',
      error:
        'We could not determine your location. Please search using a city or town name.',
    }
  }
}

function formatRating(value: Business['rating']): number {
  const rating = Number(value)
  return Number.isFinite(rating) ? rating : 0
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams
  const keyword = getSingleParam(params.q).slice(0, 100)
  const rawLocation = getSingleParam(params.location).slice(0, 200)

  const locationResult = rawLocation
    ? await reverseGeocode(rawLocation)
    : {
        searchLocation: '',
        resolvedCity: '',
        error: '',
      }

  const searchLocation = locationResult.searchLocation

  const hasSearch = Boolean(keyword || rawLocation)
  const supabase = await createClient()

  let businesses: Business[] = []
  let searchError = ''

  if (
    hasSearch &&
    (!rawLocation || searchLocation)
  ) {
    let query = supabase
      .from('businesses')
      .select(`
        id,
        name,
        slug,
        description,
        city,
        state,
        country,
        address,
        rating,
        phone,
        primary_category,
        listing_type
      `)
      .eq('status', 'approved')

    if (keyword) {
      const safeKeyword = cleanFilterValue(keyword)

      if (safeKeyword) {
        query = query.or(
          makeOrFilter(
            [
              'name',
              'description',
              'city',
              'state',
              'country',
              'primary_category',
              'listing_type',
            ],
            safeKeyword
          )
        )
      }
    }

    if (searchLocation) {
      const safeLocation = cleanFilterValue(searchLocation)

      if (safeLocation) {
        query = query.or(
          makeOrFilter(
            ['city', 'state', 'country', 'address'],
            safeLocation
          )
        )
      }
    }

    const { data, error } = await query
      .order('rating', {
        ascending: false,
        nullsFirst: false,
      })
      .limit(50)

    if (error) {
      console.error('Business search failed:', error)
      searchError =
        'We could not load search results. Please try again.'
    } else {
      businesses = (data || []) as Business[]
    }
  }

  const resultDescription = locationResult.resolvedCity
    ? `Location identified as ${locationResult.resolvedCity}`
    : searchLocation
      ? `Location: ${searchLocation}`
      : ''

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-700 to-green-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 text-sm text-white/80"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            {' / '}
            <span className="text-white">Search</span>
          </nav>

          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Find Lawn Care Services Near You
          </h1>

          <p className="mb-8 max-w-2xl text-white/90">
            Search lawn mowing, landscaping, garden care and
            lawn mower repair businesses by name, service or location.
          </p>

          <SearchBar
            variant="hero"
            placeholder="Business name, lawn care, landscaping..."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {locationResult.error && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"
          >
            {locationResult.error}
          </div>
        )}

        {searchError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {searchError}
          </div>
        )}

        {!hasSearch ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <Search
              size={36}
              className="mx-auto mb-4 text-green-700"
            />
            <h2 className="text-xl font-semibold">
              Start your search
            </h2>
            <p className="mt-2 text-gray-600">
              Enter a business name, service or location above
              to find matching listings.
            </p>

            <Link
              href="/near-me"
              className="mt-5 inline-block font-semibold text-green-700 hover:underline"
            >
              Browse locations →
            </Link>
          </div>
        ) : !searchError && !locationResult.error ? (
          <>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results
                </h2>

                <p className="mt-1 text-gray-600">
                  {businesses.length > 0
                    ? `${businesses.length} matching ${
                        businesses.length === 1
                          ? 'business'
                          : 'businesses'
                      }${businesses.length === 50 ? ' or more may exist' : ''}`
                    : 'No matching businesses found.'}
                </p>

                {resultDescription && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={15} />
                    {resultDescription}
                  </p>
                )}
              </div>

              <Link
                href="/near-me"
                className="text-sm font-medium text-green-700 hover:underline"
              >
                Browse by location
              </Link>
            </div>

            {businesses.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {businesses.map((business) => {
                  const rating = formatRating(business.rating)

                  return (
                    <article
                      key={business.id}
                      className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            <Link
                              href={`/listings/${business.slug}`}
                              className="hover:text-green-700"
                            >
                              {business.name}
                            </Link>
                          </h3>

                          {business.primary_category && (
                            <p className="mt-1 text-sm text-green-700">
                              {business.primary_category}
                            </p>
                          )}
                        </div>

                        {rating > 0 && (
                          <span className="flex shrink-0 items-center gap-1 rounded bg-amber-50 px-2 py-1 text-sm">
                            <Star
                              size={15}
                              className="fill-yellow-400 text-yellow-500"
                            />
                            {rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {(business.city ||
                        business.state ||
                        business.country) && (
                        <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0"
                          />
                          {[
                            business.city,
                            business.state,
                            business.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}

                      {business.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {business.description}
                        </p>
                      )}

                      <Link
                        href={`/listings/${business.slug}`}
                        className="mt-5 inline-flex font-semibold text-green-700 hover:underline"
                      >
                        View business →
                      </Link>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border bg-white p-8 text-center">
                <MapPin
                  size={36}
                  className="mx-auto mb-4 text-gray-400"
                />
                <h3 className="text-xl font-semibold">
                  No matching businesses found
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-gray-600">
                  Try another spelling, a nearby city, or a broader
                  service keyword. Only approved listings are shown.
                </p>

                <Link
                  href="/add-listing"
                  className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
                >
                  Add a Business
                </Link>
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  )
}
