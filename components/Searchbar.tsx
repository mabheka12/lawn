
'use client'

import { useState, type FormEvent } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  className?: string
  variant?: 'hero' | 'compact'
}

export default function SearchBar({
  placeholder = 'Search by city, keyword, or business name...',
  className = '',
  variant = 'hero',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const router = useRouter()

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const params = new URLSearchParams()
    const cleanQuery = query.trim()
    const cleanLocation = location.trim()

    if (cleanQuery) params.set('q', cleanQuery)
    if (cleanLocation) params.set('location', cleanLocation)

    if (!cleanQuery && !cleanLocation) return

    router.push(`/search?${params.toString()}`)
  }

  function handleUseCurrentLocation() {
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location services.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setLocation(`${latitude},${longitude}`)
        setLocating(false)
      },
      (error) => {
        setLocating(false)

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission was denied. Enter your city instead.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Your location is unavailable. Please enter your city.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.')
            break
          default:
            setLocationError('Unable to get your location. Please enter your city.')
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`mx-auto w-full max-w-4xl ${className}`}>
        <form
          onSubmit={handleSearch}
          className="overflow-hidden rounded-lg bg-white shadow-lg"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search businesses"
                className="w-full px-4 py-4 pl-12 text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="relative flex-1 border-t border-gray-200 md:border-l md:border-t-0">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setLocationError('')
                }}
                placeholder="City, province, or coordinates"
                aria-label="Location"
                className="w-full px-4 py-4 pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-700 hover:underline disabled:opacity-60"
              >
                {locating ? 'Locating...' : 'Use my location'}
              </button>
            </div>

            <button
              type="submit"
              disabled={!query.trim() && !location.trim()}
              className="bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </div>

          {locationError && (
            <p role="alert" className="px-4 py-2 text-sm text-red-600">
              {locationError}
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            className="w-full border-t px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
          >
            {showFilters ? 'Hide' : 'Show'} advanced filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 border-t bg-green-50 p-4 md:grid-cols-3">
              <label className="text-sm text-gray-700">
                Category
                <select
                  name="category"
                  className="mt-1 w-full rounded-lg border bg-white p-2"
                  defaultValue=""
                >
                  <option value="">All categories</option>
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="sales">Sales</option>
                  <option value="sharpening">Sharpening</option>
                </select>
              </label>

              <label className="text-sm text-gray-700">
                Search radius
                <select
                  name="radius"
                  className="mt-1 w-full rounded-lg border bg-white p-2"
                  defaultValue=""
                >
                  <option value="">Any distance</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </label>

              <label className="text-sm text-gray-700">
                Minimum rating
                <select
                  name="rating"
                  className="mt-1 w-full rounded-lg border bg-white p-2"
                  defaultValue=""
                >
                  <option value="">Any rating</option>
                  <option value="4">4+ stars</option>
                  <option value="3">3+ stars</option>
                  <option value="2">2+ stars</option>
                </select>
              </label>
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`relative ${className}`}
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search businesses"
        className="w-full rounded-lg border py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </form>
  )
}
