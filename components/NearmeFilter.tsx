'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter, X, Award } from 'lucide-react'
import { useCallback } from 'react'

interface NearMeFiltersProps {
  basePath: string
  city: string
  categoriesInCity: string[]
  totalBusinesses: number
  avgRating: number
  selectedCategory: string
  selectedRating: string
  sortBy: string
}

export default function NearMeFilters({
  basePath,
  city,
  categoriesInCity,
  totalBusinesses,
  avgRating,
  selectedCategory,
  selectedRating,
  sortBy,
}: NearMeFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper to update URL params
  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    const queryString = params.toString()
    const url = `${pathname}${queryString ? `?${queryString}` : ''}`
    router.push(url)
  }, [pathname, router, searchParams])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters('category', e.target.value)
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters('rating', e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters('sort', e.target.value)
  }

  const clearAllFilters = () => {
    router.push(basePath)
  }

  const clearFilter = (key: string) => {
    updateFilters(key, 'all')
  }

  const hasActiveFilters = selectedCategory !== 'all' || selectedRating !== '' || sortBy !== 'rating'

  return (
    <>
      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h3 className="font-bold text-lg">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} />
              Reset All
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Category Filter */}
          {categoriesInCity.length > 0 && (
            <div>
              <label className="font-medium mb-2 block">Category</label>
              <select 
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categoriesInCity.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Rating Filter */}
          <div>
            <label className="font-medium mb-2 block">Minimum Rating</label>
            <select 
              value={selectedRating}
              onChange={handleRatingChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3">3.0+ Stars</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <label className="font-medium mb-2 block">Sort By</label>
            <select 
              value={sortBy}
              onChange={handleSortChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'all' && (
                <button 
                  onClick={() => clearFilter('category')}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs hover:bg-green-200"
                >
                  Category: {selectedCategory}
                  <X size={12} />
                </button>
              )}
              {selectedRating !== '' && (
                <button 
                  onClick={() => clearFilter('rating')}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs hover:bg-green-200"
                >
                  {selectedRating}+ Stars
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* City Stats Card */}
      {totalBusinesses > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award size={20} />
            City Stats
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalBusinesses}</div>
              <div className="text-sm text-gray-600">Total Businesses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{avgRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{categoriesInCity.length}</div>
              <div className="text-sm text-gray-600">Categories Available</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}