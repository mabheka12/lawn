'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Navigation,
  Search,
  Star,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface PopularCity {
  name: string
  slug: string
  state: string
  stateSlug: string
  country: string
  countrySlug: string
  count: number
  rating: number
}

interface RecentSearch {
  name: string
  path: string
}

export default function NearMeIndexPage() {
  const [searchCity, setSearchCity] = useState('')
  const [loading, setLoading] = useState(false)

  const [popularCities, setPopularCities] = useState<
    PopularCity[]
  >([])

  const [recentSearches, setRecentSearches] = useState<
    RecentSearch[]
  >([])

  const router = useRouter()

  useEffect(() => {
    // ---------------------------------------------
    // Recent searches
    // ---------------------------------------------

    try {
      const saved = localStorage.getItem(
        'recentCitySearchesV2'
      )

      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error(
        'Could not load recent searches:',
        error
      )
    }

    // ---------------------------------------------
    // Popular cities
    // ---------------------------------------------

    async function fetchPopularCities() {
      const supabase = createClient()

      const { data: businesses, error } =
        await supabase
          .from('businesses')
          .select(`
            city,
            city_slug,
            state,
            state_slug,
            country,
            country_slug,
            rating
          `)
          .eq('status', 'approved')
          .not('city', 'is', null)
          .not('city_slug', 'is', null)
          .not('state', 'is', null)
          .not('state_slug', 'is', null)
          .not('country', 'is', null)
          .not('country_slug', 'is', null)

      if (error) {
        console.error(
          'Error fetching popular cities:',
          error
        )
        return
      }

      if (!businesses) {
        return
      }

      const cityMap = new Map<
        string,
        {
          name: string
          slug: string
          state: string
          stateSlug: string
          country: string
          countrySlug: string
          count: number
          ratingSum: number
          ratingCount: number
        }
      >()

      for (const business of businesses) {
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

        // IMPORTANT:
        // city slug alone is not unique.
        const key = [
          business.country_slug,
          business.state_slug,
          business.city_slug,
        ].join('/')

        if (!cityMap.has(key)) {
          cityMap.set(key, {
            name: business.city,
            slug: business.city_slug,
            state: business.state,
            stateSlug: business.state_slug,
            country: business.country,
            countrySlug: business.country_slug,
            count: 0,
            ratingSum: 0,
            ratingCount: 0,
          })
        }

        const city = cityMap.get(key)

        if (!city) {
          continue
        }

        city.count++

        const rating = Number(business.rating)

        if (
          Number.isFinite(rating) &&
          rating > 0
        ) {
          city.ratingSum += rating
          city.ratingCount++
        }
      }

      const cities: PopularCity[] =
        Array.from(cityMap.values())
          .map((city) => ({
            name: city.name,
            slug: city.slug,
            state: city.state,
            stateSlug: city.stateSlug,
            country: city.country,
            countrySlug: city.countrySlug,
            count: city.count,
            rating:
              city.ratingCount > 0
                ? city.ratingSum /
                  city.ratingCount
                : 0,
          }))
          .sort((a, b) => {
            // Main ranking:
            // number of businesses
            if (b.count !== a.count) {
              return b.count - a.count
            }

            return b.rating - a.rating
          })

      setPopularCities(cities)
    }

    fetchPopularCities()
  }, [])

  // ------------------------------------------------
  // Recent searches
  // ------------------------------------------------

  const saveRecentSearch = (
    name: string,
    path: string
  ) => {
    const newSearch: RecentSearch = {
      name,
      path,
    }

    const updated = [
      newSearch,
      ...recentSearches.filter(
        (search) => search.path !== path
      ),
    ].slice(0, 5)

    setRecentSearches(updated)

    localStorage.setItem(
      'recentCitySearchesV2',
      JSON.stringify(updated)
    )
  }

  // ------------------------------------------------
  // Manual search
  //
  // We intentionally use the legacy resolver here.
  // If somebody searches "Kansas City", the resolver
  // can show Kansas / Missouri instead of guessing.
  // ------------------------------------------------

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    const value = searchCity.trim()

    if (!value) {
      return
    }

    const slug = value
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    router.push(`/near-me/${slug}`)
  }

  // ------------------------------------------------
  // Geolocation
  // ------------------------------------------------

  const handleUseCurrentLocation = () => {
    setLoading(true)

    if (!navigator.geolocation) {
      alert(
        'Geolocation is not supported by your browser'
      )

      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )

          const data = await response.json()

          const city =
            data.city ||
            data.locality ||
            data.principalSubdivision

          if (city) {
            const slug = city
              .toLowerCase()
              .trim()
              .replace(/&/g, 'and')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')

            // Let our legacy resolver determine
            // the canonical country/state/city.
            router.push(`/near-me/${slug}`)
          } else {
            alert(
              'Could not determine your city. Please enter it manually.'
            )
          }
        } catch (error) {
          console.error(
            'Error getting city name:',
            error
          )

          alert(
            'Could not determine your city. Please enter it manually.'
          )
        } finally {
          setLoading(false)
        }
      },

      (error) => {
        console.error(
          'Geolocation error:',
          error
        )

        alert(
          'Unable to get your location. Please enter your city manually.'
        )

        setLoading(false)
      }
    )
  }

  // ------------------------------------------------
  // Country-specific lists
  // ------------------------------------------------

  const usCities = popularCities
    .filter(
      (city) =>
        city.countrySlug === 'united-states'
    )
    .slice(0, 12)

  const australianCities = popularCities
    .filter(
      (city) =>
        city.countrySlug === 'australia'
    )
    .slice(0, 12)

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">

          <MapPin
            size={56}
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lawn Care & Mower Services Near Me
          </h1>

          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Find lawn mowing, lawn care,
            landscaping and lawn mower services
            near you in the United States and
            Australia.
          </p>

          <div className="max-w-2xl mx-auto">

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">

                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  value={searchCity}
                  onChange={(event) =>
                    setSearchCity(
                      event.target.value
                    )
                  }
                  placeholder="Enter your city name"
                  className="w-full pl-12 pr-4 py-4 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  required
                />

              </div>

              <button
                type="submit"
                className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Search
              </button>
            </form>

            <button
              onClick={
                handleUseCurrentLocation
              }
              disabled={loading}
              className="mt-4 text-white/90 hover:text-white flex items-center gap-2 mx-auto disabled:opacity-60"
            >
              <Navigation size={18} />

              {loading
                ? 'Getting your location...'
                : 'Use my current location'}
            </button>

          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">

        {/* RECENT SEARCHES */}
        {recentSearches.length > 0 && (
          <section className="mb-12">

            <h2 className="text-2xl font-bold mb-4">
              Recent Searches
            </h2>

            <div className="flex flex-wrap gap-3">

              {recentSearches.map(
                (search) => (
                  <Link
                    key={search.path}
                    href={search.path}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-gray-700 transition flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    {search.name}
                  </Link>
                )
              )}

            </div>
          </section>
        )}

        {/* COUNTRY CHOOSER */}
        <section className="mb-16">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">
              Browse by Country
            </h2>

            <p className="text-gray-600 mt-2">
              Choose your country to browse
              services by state and city.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            <Link
              href="/near-me/united-states"
              className="border rounded-2xl p-7 bg-white hover:border-green-400 hover:shadow-lg transition"
            >
              <div className="text-3xl mb-3">
                🇺🇸
              </div>

              <h3 className="text-2xl font-bold">
                United States
              </h3>

              <p className="text-gray-600 mt-2">
                Browse lawn care, landscaping
                and mower services across the
                United States.
              </p>

              <div className="mt-5 font-semibold text-green-600">
                Browse United States →
              </div>
            </Link>

            <Link
              href="/near-me/australia"
              className="border rounded-2xl p-7 bg-white hover:border-green-400 hover:shadow-lg transition"
            >
              <div className="text-3xl mb-3">
                🇦🇺
              </div>

              <h3 className="text-2xl font-bold">
                Australia
              </h3>

              <p className="text-gray-600 mt-2">
                Find lawn mowing, garden care,
                landscaping and mower services
                across Australia.
              </p>

              <div className="mt-5 font-semibold text-green-600">
                Browse Australia →
              </div>
            </Link>

          </div>
        </section>

        {/* UNITED STATES */}
        {usCities.length > 0 && (
          <PopularCitySection
            title="Popular Lawn Service Cities in the United States"
            countryPath="/near-me/united-states"
            countryLabel="Browse all United States locations"
            cities={usCities}
            onCityClick={
              saveRecentSearch
            }
          />
        )}

        {/* AUSTRALIA */}
        {australianCities.length > 0 && (
          <PopularCitySection
            title="Popular Lawn Service Cities in Australia"
            countryPath="/near-me/australia"
            countryLabel="Browse all Australian locations"
            cities={australianCities}
            onCityClick={
              saveRecentSearch
            }
          />
        )}

      </main>
    </>
  )
}

interface PopularCitySectionProps {
  title: string
  countryPath: string
  countryLabel: string
  cities: PopularCity[]
  onCityClick: (
    name: string,
    path: string
  ) => void
}

function PopularCitySection({
  title,
  countryPath,
  countryLabel,
  cities,
  onCityClick,
}: PopularCitySectionProps) {
  return (
    <section className="mb-16">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">

        <div>
          <h2 className="text-3xl font-bold">
            {title}
          </h2>

          <p className="text-gray-600 mt-2">
            Browse cities with the most listed
            local businesses.
          </p>
        </div>

        <Link
          href={countryPath}
          className="text-green-600 hover:text-green-700 font-semibold"
        >
          {countryLabel} →
        </Link>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {cities.map((city) => {
          const path =
            `/near-me/${city.countrySlug}/${city.stateSlug}/${city.slug}`

          const displayName =
            `${city.name}, ${city.state}`

          return (
            <Link
              key={`${city.countrySlug}-${city.stateSlug}-${city.slug}`}
              href={path}
              onClick={() =>
                onCityClick(
                  displayName,
                  path
                )
              }
              className="bg-white border rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition group"
            >

              <div className="flex justify-between items-start mb-3">

                <MapPin
                  size={30}
                  className="text-green-600"
                />

                {city.rating > 0 && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">

                    <Star
                      size={14}
                      className="text-yellow-500 fill-current"
                    />

                    <span className="text-sm font-medium">
                      {city.rating.toFixed(1)}
                    </span>

                  </div>
                )}

              </div>

              <h3 className="text-xl font-bold group-hover:text-green-600 transition">
                {city.name}
              </h3>

              <div className="text-gray-500 text-sm mt-1">
                {city.state}
              </div>

              <div className="text-gray-500 text-sm mt-3">
                {city.count}{' '}
                {city.count === 1
                  ? 'business'
                  : 'businesses'}
              </div>

            </Link>
          )
        })}

      </div>
    </section>
  )
}