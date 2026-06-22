'use client'

import { useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  className?: string
  variant?: 'hero' | 'compact'
}

export default function SearchBar({ 
  placeholder = "Search by city, keyword, or business name...", 
  className = "",
  variant = 'hero'
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query || location) {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (location) params.append('location', location)
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // In a real app, you'd reverse geocode this
        setLocation(`${position.coords.latitude},${position.coords.longitude}`)
      })
    }
  }

  if (variant === 'hero') {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 relative border-t md:border-t-0 md:border-l border-gray-200">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or zip code"
                className="w-full pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600 text-sm hover:underline"
              >
                Use my location
              </button>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-4 hover:bg-green-700 transition font-semibold"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 border-t"
          >
            {showFilters ? 'Hide' : 'Show'} advanced filters
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 border-t bg-green-600 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="p-2 border rounded-lg bg-gray-500 text-white">
                <option value="">All Categories</option>
                <option value="repair">Repair</option>
                <option value="maintenance">Maintenance</option>
                <option value="sales">Sales</option>
                <option value="sharpening">Sharpening</option>
              </select>
              <select className="p-2 border rounded-lg bg-gray-500 text-white">
                <option value="">Radius</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
              <select className="p-2 border rounded-lg bg-gray-500 text-white">
                <option value="">Rating</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
              </select>
            </div>
          )}
        </form>
      </div>
    )
  }

  // Compact variant for sidebar/navbar
  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <X size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </form>
  )
}