// app/near-me/[location]/page.tsx

import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  notFound,
  permanentRedirect,
} from 'next/navigation'
import { MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{
    location: string
  }>
}

function slugToReadable(slug: string) {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { location } = await params

  const supabase = await createClient()

  // First check whether this is a country
  const { data: countryBusiness } = await supabase
    .from('businesses')
    .select('country, country_slug')
    .eq('country_slug', location)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()

  if (countryBusiness) {
    const title =
      `Lawn Care & Mower Services in ${countryBusiness.country}`

    const description =
      `Find lawn care, lawn mowing, landscaping and mower repair businesses across ${countryBusiness.country}. Browse services by state and city.`

    return {
      title,
      description,

      alternates: {
        canonical: `/near-me/${countryBusiness.country_slug}`,
      },

      openGraph: {
        title,
        description,
        url: `/near-me/${countryBusiness.country_slug}`,
        type: 'website',
      },
    }
  }

  // Otherwise it may be an old city URL.
  // Don't index the legacy resolver page.
  return {
    title: `${slugToReadable(location)} Lawn Services`,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function LocationPage({
  params,
}: PageProps) {
  const { location } = await params

  const supabase = await createClient()

  // ====================================================
  // 1. CHECK WHETHER LOCATION IS A COUNTRY
  // ====================================================

  const { data: countryBusinesses, error: countryError } =
    await supabase
      .from('businesses')
      .select(`
        country,
        country_slug,
        state,
        state_slug
      `)
      .eq('country_slug', location)
      .eq('status', 'approved')

  if (countryError) {
    console.error(
      'Country lookup error:',
      countryError
    )
  }

  if (
    countryBusinesses &&
    countryBusinesses.length > 0
  ) {
    const country =
      countryBusinesses[0]?.country ||
      slugToReadable(location)

    const stateMap = new Map<
      string,
      {
        state: string
        stateSlug: string
        count: number
      }
    >()

    for (const business of countryBusinesses) {
      if (
        !business.state ||
        !business.state_slug
      ) {
        continue
      }

      const existing =
        stateMap.get(business.state_slug)

      if (existing) {
        existing.count++
      } else {
        stateMap.set(business.state_slug, {
          state: business.state,
          stateSlug: business.state_slug,
          count: 1,
        })
      }
    }

    const states = Array.from(
      stateMap.values()
    ).sort((a, b) =>
      a.state.localeCompare(b.state)
    )

    const totalBusinesses =
      countryBusinesses.length

    return (
      <>
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
          <div className="container mx-auto px-4">

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm mb-5"
            >
              <Link
                href="/"
                className="text-white/80 hover:text-white"
              >
                Home
              </Link>

              <span>›</span>

              <Link
                href="/countries"
                className="text-white/80 hover:text-white"
              >
                Countries
              </Link>

              <span>›</span>

              <span className="font-semibold">
                {country}
              </span>
            </nav>

            <div className="flex flex-col md:flex-row justify-between gap-6">

              <div>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  <MapPin size={40} />

                  Lawn Care & Mower Services in{' '}
                  {country}
                </h1>

                <p className="text-xl text-white/90 mt-4 max-w-3xl">
                  Browse lawn mowing, lawn care,
                  landscaping and lawn mower
                  services across {country}.
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-5 min-w-[200px]">
                <div className="text-4xl font-bold">
                  {totalBusinesses}
                </div>

                <div className="text-sm text-white/90">
                  Listed Businesses
                </div>
              </div>

            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-12">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Browse by State or Region
            </h2>

            <p className="text-gray-600 mt-2">
              Choose a state or region to find
              local lawn and mower businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {states.map((state) => (
              <Link
                key={state.stateSlug}
                href={`/near-me/${location}/${state.stateSlug}`}
                className="bg-white border rounded-xl p-5 hover:border-green-400 hover:shadow-md transition"
              >
                <div className="font-semibold text-lg text-gray-900">
                  {state.state}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  {state.count}{' '}
                  {state.count === 1
                    ? 'business'
                    : 'businesses'}
                </div>
              </Link>
            ))}
          </div>

        </main>
      </>
    )
  }

  // ====================================================
  // 2. NOT A COUNTRY:
  //    TREAT AS LEGACY CITY URL
  // ====================================================

  const { data: cityBusinesses, error: cityError } =
    await supabase
      .from('businesses')
      .select(`
        city,
        city_slug,
        state,
        state_slug,
        country,
        country_slug
      `)
      .eq('city_slug', location)
      .eq('status', 'approved')

  if (cityError) {
    console.error(
      'Legacy city lookup error:',
      cityError
    )

    notFound()
  }

  if (
    !cityBusinesses ||
    cityBusinesses.length === 0
  ) {
    notFound()
  }

  const locationMap = new Map<
    string,
    {
      city: string
      citySlug: string
      state: string
      stateSlug: string
      country: string
      countrySlug: string
    }
  >()

  for (const business of cityBusinesses) {
    if (
      !business.city ||
      !business.city_slug ||
      !business.state ||
      !business.state_slug ||
      !business.country ||
      !business.country_slug
    ) {
      continue
    }

    const key =
      `${business.country_slug}/${business.state_slug}/${business.city_slug}`

    if (!locationMap.has(key)) {
      locationMap.set(key, {
        city: business.city,
        citySlug: business.city_slug,
        state: business.state,
        stateSlug: business.state_slug,
        country: business.country,
        countrySlug: business.country_slug,
      })
    }
  }

  const cityLocations =
    Array.from(locationMap.values())

  if (cityLocations.length === 0) {
    notFound()
  }

  // One clear result:
  // old URL permanently redirects.
  if (cityLocations.length === 1) {
    const city = cityLocations[0]

    permanentRedirect(
      `/near-me/${city.countrySlug}/${city.stateSlug}/${city.citySlug}`
    )
  }

  // Multiple cities with same name.
  const readableCity =
    cityBusinesses[0]?.city ||
    slugToReadable(location)

  return (
    <main className="min-h-[70vh] bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
            <MapPin
              size={30}
              className="text-green-600"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Choose {readableCity} Location
          </h1>

          <p className="text-gray-600 mt-3">
            We found more than one location named{' '}
            {readableCity}. Choose the state or
            region you are looking for.
          </p>
        </div>

        <div className="space-y-4">
          {cityLocations.map((city) => (
            <Link
              key={`${city.countrySlug}-${city.stateSlug}-${city.citySlug}`}
              href={`/near-me/${city.countrySlug}/${city.stateSlug}/${city.citySlug}`}
              className="block bg-white border rounded-xl p-6 hover:border-green-400 hover:shadow-md transition"
            >
              <div className="font-semibold text-xl text-gray-900">
                {city.city}, {city.state}
              </div>

              <div className="text-gray-500 mt-1">
                {city.country}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}