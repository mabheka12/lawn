
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Search,
  Calculator,
  Globe,
  ChevronDown,
  CirclePlus,
  Home,
  MapPin,
  Tags,
  Sprout,
  Wrench,
  BookOpen,
  Package,
  Info,
  Mail,
  MoreHorizontal,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const mainLinks = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Near Me',
    href: '/near-me',
    icon: MapPin,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  {
    label: 'Lawn Mowing',
    href: '/type/mowing',
    icon: Sprout,
  },
  {
    label: 'Repairs',
    href: '/type/repairs',
    icon: Wrench,
  },
  {
    label: 'Cost Calculator',
    href: '/lawn-mowing-cost-calculator',
    icon: Calculator,
  },
]

const moreLinks = [
  {
    label: 'Locations',
    href: '/locations',
    icon: MapPin,
  },
  {
    label: 'Lawn Products',
    href: '/lawn-products',
    icon: Package,
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: BookOpen,
  },
  {
    label: 'About',
    href: '/about',
    icon: Info,
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: Mail,
  },
]

function getCountrySlug(country: string) {
  const normalized = country.trim().toLowerCase()

  if (
    normalized === 'usa' ||
    normalized === 'us' ||
    normalized === 'united states' ||
    normalized === 'united states of america'
  ) {
    return 'united-states'
  }

  if (
    normalized === 'au' ||
    normalized === 'australia'
  ) {
    return 'australia'
  }

  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getLocalFlagPath(country: string) {
  const normalized = country.trim().toLowerCase()

  const fileMapping: Record<string, string> = {
    usa: 'us.png',
    us: 'us.png',
    'united states': 'us.png',
    'united states of america': 'us.png',
    australia: 'au.png',
    au: 'au.png',
  }

  return `/flags/${fileMapping[normalized] || 'default.png'}`
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
  const [countries, setCountries] = useState<string[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [citySearch, setCitySearch] = useState('')

  const router = useRouter()
  const pathname = usePathname()

  const fetchCountries = useCallback(async () => {
    try {
      setIsLoadingCountries(true)

      const supabase = createClient()

      const { data, error } = await supabase
        .from('businesses')
        .select('country')
        .not('country', 'is', null)
        .eq('status', 'approved')

      if (error) {
        console.error('Error fetching countries:', error)
        return
      }

      const uniqueCountries = [
        ...new Set(
          (data ?? [])
            .map((business) => business.country?.trim())
            .filter((country): country is string => Boolean(country))
        ),
      ].sort((a, b) => a.localeCompare(b))

      setCountries(uniqueCountries)
    } catch (error) {
      console.error('Failed to fetch countries:', error)
    } finally {
      setIsLoadingCountries(false)
    }
  }, [])

  useEffect(() => {
    void fetchCountries()
  }, [fetchCountries])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsCountryDropdownOpen(false)
    setIsMoreDropdownOpen(false)
  }, [pathname])

  const handleCountrySelect = (country: string) => {
    const slug = getCountrySlug(country)

    setIsCountryDropdownOpen(false)
    setIsMenuOpen(false)

    router.push(`/near-me/${slug}`)
  }

  const handleCitySearch = () => {
    const city = citySearch.trim()

    if (!city) return

    setCitySearch('')
    setIsMenuOpen(false)

    // Preserves the existing city-search route convention.
    router.push(`/near-me/${encodeURIComponent(city.replace(/\s+/g, '-'))}`)
  }

  const linkIsActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const searchInputClass =
    'w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* TOP ROW: Logo, country, search and primary action */}
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Lawn Mowing Near Me homepage"
          >
            <Image
              src="/law-logo.png"
              alt="Lawn Mowing Near Me"
              width={50}
              height={50}
              className="h-12 w-12 object-contain"
              priority
            />
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Country selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCountryDropdownOpen((open) => !open)
                  setIsMoreDropdownOpen(false)
                }}
                aria-expanded={isCountryDropdownOpen}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-green-700 sm:px-3"
              >
                <Globe size={17} />
                <span className="hidden sm:inline">Country</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${
                    isCountryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCountryDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close country selector"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsCountryDropdownOpen(false)}
                  />

                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Choose your country
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Browse services in your market.
                      </p>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                      {isLoadingCountries ? (
                        <p className="px-3 py-3 text-sm text-gray-500">
                          Loading countries...
                        </p>
                      ) : countries.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-gray-500">
                          No countries available.
                        </p>
                      ) : (
                        countries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                          >
                            <Image
                              src={getLocalFlagPath(country)}
                              alt=""
                              width={24}
                              height={16}
                              className="h-4 w-6 rounded-sm border border-gray-100 object-cover"
                              unoptimized
                            />
                            <span>{country}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* City search: visible on tablet and desktop */}
            <div className="relative hidden w-40 lg:block xl:w-52">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleCitySearch()
                }}
                placeholder="Search city..."
                aria-label="Search by city"
                className={searchInputClass}
              />
            </div>

            {/* Add Listing */}
            <Link
              href="/add-listing"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 sm:px-4"
            >
              <CirclePlus size={18} />
              <span className="hidden sm:inline">Add Listing</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 hover:text-green-700 md:hidden"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {/* SECOND ROW: Icon-based navigation */}
        <div className="hidden border-t border-gray-100 md:block">
          <div className="flex items-stretch justify-center gap-1 py-1">
            {mainLinks.map((item) => {
              const Icon = item.icon
              const active = linkIsActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                    active
                      ? 'bg-green-50 text-green-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}

            {/* More menu */}
            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsMoreDropdownOpen((open) => !open)
                  setIsCountryDropdownOpen(false)
                }}
                aria-expanded={isMoreDropdownOpen}
                className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                  isMoreDropdownOpen
                    ? 'bg-green-50 text-green-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                }`}
              >
                <MoreHorizontal size={19} strokeWidth={1.8} />
                <span>More</span>
              </button>

              {isMoreDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close more menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  />

                  <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    {moreLinks.map((item) => {
                      const Icon = item.icon
                      const active = linkIsActive(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            active
                              ? 'bg-green-50 font-medium text-green-800'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                          }`}
                        >
                          <Icon size={17} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-100 py-4 md:hidden">
            {/* Mobile city search */}
            <div className="relative mb-4 px-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleCitySearch()
                }}
                placeholder="Search city..."
                aria-label="Search by city"
                className={searchInputClass}
              />
            </div>

            {/* Country links */}
            <div className="mb-3 rounded-xl bg-gray-50 p-3">
              <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Globe size={14} />
                Browse by country
              </p>

              {isLoadingCountries ? (
                <p className="px-1 py-2 text-sm text-gray-500">
                  Loading countries...
                </p>
              ) : countries.length === 0 ? (
                <p className="px-1 py-2 text-sm text-gray-500">
                  No countries available.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {countries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-left text-sm text-gray-700 transition hover:text-green-700"
                    >
                      <Image
                        src={getLocalFlagPath(country)}
                        alt=""
                        width={24}
                        height={16}
                        className="h-4 w-6 rounded-sm border border-gray-100 object-cover"
                        unoptimized
                      />
                      <span className="truncate">{country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary navigation */}
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Explore
            </p>

            {mainLinks.map((item) => {
              const Icon = item.icon
              const active = linkIsActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    active
                      ? 'bg-green-50 font-medium text-green-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              )
            })}

            {/* Secondary navigation */}
            <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              More
            </p>

            {moreLinks.map((item) => {
              const Icon = item.icon
              const active = linkIsActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    active
                      ? 'bg-green-50 font-medium text-green-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              )
            })}

            <Link
              href="/add-listing"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              <CirclePlus size={19} />
              Add Listing
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
