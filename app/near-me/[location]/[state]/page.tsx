import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{
    location: string
    state: string
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
  const {
    location: countrySlug,
    state: stateSlug,
  } = await params

  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select(`
      country,
      country_slug,
      state,
      state_slug
    `)
    .eq('country_slug', countrySlug)
    .eq('state_slug', stateSlug)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()

  if (!business) {
    return {
      title: 'Location Not Found | Lawn Mowing Near Me',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title =
    `Lawn Care & Mower Services in ${business.state}, ${business.country}`

  const description =
    `Find lawn care, lawn mowing, landscaping and mower repair businesses across ${business.state}. Browse local services by city.`

  const canonical =
    `/near-me/${business.country_slug}/${business.state_slug}`

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

export default async function StatePage({
  params,
}: PageProps) {
  const {
    location: countrySlug,
    state: stateSlug,
  } = await params

  const supabase = await createClient()

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      country,
      country_slug,
      state,
      state_slug,
      city,
      city_slug
    `)
    .eq('country_slug', countrySlug)
    .eq('state_slug', stateSlug)
    .eq('status', 'approved')

  if (error) {
    console.error('State page query error:', error)
    notFound()
  }

  if (!businesses || businesses.length === 0) {
    notFound()
  }

  const country =
    businesses[0]?.country ||
    slugToReadable(countrySlug)

  const state =
    businesses[0]?.state ||
    slugToReadable(stateSlug)

  const cityMap = new Map<
    string,
    {
      city: string
      citySlug: string
      count: number
    }
  >()

  for (const business of businesses) {
    if (!business.city || !business.city_slug) {
      continue
    }

    const existing = cityMap.get(business.city_slug)

    if (existing) {
      existing.count++
    } else {
      cityMap.set(business.city_slug, {
        city: business.city,
        citySlug: business.city_slug,
        count: 1,
      })
    }
  }

  const cities = Array.from(cityMap.values()).sort(
    (a, b) => b.count - a.count
  )

  const totalBusinesses = businesses.length

  return (
    <>
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
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

            <span>›</span>

            <Link
              href="/near-me"
              className="text-white/80 hover:text-white"
            >
              Near Me
            </Link>

            <span>›</span>

            <Link
              href={`/near-me/${countrySlug}`}
              className="text-white/80 hover:text-white"
            >
              {country}
            </Link>

            <span>›</span>

            <span className="font-semibold">
              {state}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
              <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                <MapPin size={40} />

                Lawn Care & Mower Services in {state}
              </h1>

              <p className="text-xl text-white/90 mt-4 max-w-3xl">
                Find lawn care, lawn mowing,
                landscaping and mower repair
                businesses across {state}, {country}.
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
            Lawn & Mower Services by City in {state}
          </h2>

          <p className="text-gray-600 mt-2">
            Choose a city to browse local businesses.
          </p>
        </div>

        {cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

            {cities.map((city) => (
              <Link
                key={city.citySlug}
                href={`/near-me/${countrySlug}/${stateSlug}/${city.citySlug}`}
                className="bg-white border rounded-xl p-5 hover:border-green-400 hover:shadow-md transition"
              >
                <div className="font-semibold text-lg text-gray-900">
                  {city.city}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  {city.count}{' '}
                  {city.count === 1
                    ? 'business'
                    : 'businesses'}
                </div>
              </Link>
            ))}

          </div>
        ) : (
          <div className="bg-gray-50 border rounded-xl p-8 text-center">
            <p className="text-gray-600">
              No cities are currently available in {state}.
            </p>
          </div>
        )}

      </main>
    </>
  )
}