'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Navigation, Search, Award, Building, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function NearMeIndexPage() {
  const [searchCity, setSearchCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [popularCities, setPopularCities] = useState<Array<{name: string, slug: string, count: number, rating: number}>>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentCitySearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Fetch popular cities from database
    async function fetchPopularCities() {
      const supabase = createClient()
      const { data: businesses } = await supabase
        .from('businesses')
        .select('city, city_slug, rating')
        .not('city', 'is', null)
        .not('city_slug', 'is', null)

      if (businesses) {
        const cityMap = new Map()
        businesses.forEach(biz => {
          const key = biz.city_slug   // group by the canonical slug, not the raw name
          if (!cityMap.has(key)) {
            cityMap.set(key, { name: biz.city, slug: biz.city_slug, count: 0, ratingSum: 0, ratingCount: 0 })
          }
          const city = cityMap.get(key)
          city.count++
          if (biz.rating) {
            city.ratingSum += parseFloat(biz.rating)
            city.ratingCount++
          }
        })

        const cities = Array.from(cityMap.values())
          .map(c => ({
            name: c.name,
            slug: c.slug,
            count: c.count,
            rating: c.ratingCount > 0 ? c.ratingSum / c.ratingCount : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)

        setPopularCities(cities)
      }
    }

    fetchPopularCities()
  }, [])

  const saveRecentSearch = (city: string) => {
    const updated = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentCitySearches', JSON.stringify(updated))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCity.trim()) {
      saveRecentSearch(searchCity.trim())
      router.push(`/near-me/${encodeURIComponent(searchCity.trim().replace(/ /g, '-'))}`)
    }
  }

  const handleUseCurrentLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            )
            const data = await response.json()
            const city = data.city || data.locality || data.principalSubdivision
            if (city) {
              saveRecentSearch(city)
              router.push(`/near-me/${encodeURIComponent(city.replace(/ /g, '-'))}`)
            }
          } catch (error) {
            console.error('Error getting city name:', error)
            alert('Could not determine your city. Please enter it manually.')
          }
          setLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please enter your city manually.')
          setLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
      setLoading(false)
    }
  }

  return (
    <>
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <MapPin size={56} className="mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Lawn Mower Services Near Me</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover trusted lawn mower repair, maintenance, and sales professionals in your local area
          </p>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Enter your city name (e.g., Los Angeles, Miami, Chicago)"
                  className="w-full pl-12 pr-4 py-4 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Search
              </button>
            </form>
            
            <button
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="mt-4 text-white/90 hover:text-white flex items-center gap-2 mx-auto"
            >
              <Navigation size={18} />
              {loading ? 'Getting your location...' : 'Use my current location'}
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {recentSearches.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Recent Searches</h2>
            <div className="flex flex-wrap gap-3">
              {recentSearches.map((city) => (
                <Link
                  key={city}
                  href={`/near-me/${encodeURIComponent(city.replace(/ /g, '-'))}`}
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-gray-700 transition flex items-center gap-2"
                >
                  <MapPin size={16} />
                  {city}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/near-me/${city.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <MapPin size={32} className="text-blue-600" />
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{city.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">
                  {city.name}
                </h3>
                <div className="text-gray-500 text-sm">
                  {city.count} business{city.count !== 1 ? 'es' : ''}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}