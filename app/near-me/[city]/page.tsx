import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SearchBar, ListingCard } from '@/components'
import NearMeFilters from '@/components/NearmeFilter'
import CityContent from '@/components/CityContent'
import WeatherWidget from '@/components/WeatherWidget'
import { MapPin, PlusCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ city: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function decodeCity(citySlug: string): string {
  return decodeURIComponent(citySlug).replace(/-/g, ' ')
}

// Helper to safely parse rating from text
function parseRating(rating: string | null): number {
  if (!rating) return 0
  const parsed = parseFloat(rating)
  return isNaN(parsed) ? 0 : parsed
}

export default async function NearMePage({ params, searchParams }: PageProps) {
  // Ensure params and searchParams are properly awaited
  if (!params) {
    console.error('Params is undefined')
    notFound()
  }
  
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams || {}
  
  const citySlug = resolvedParams.city
  if (!citySlug) {
    console.error('City slug is missing')
    notFound()
  }
  
  const city = decodeCity(citySlug)
  
  const supabase = await createClient()
  
  // Get filter values from URL
  const selectedCategory = (resolvedSearchParams.category as string) || 'all'
  const selectedRating = (resolvedSearchParams.rating as string) || ''
  const sortBy = (resolvedSearchParams.sort as string) || 'rating'
  
  // 🔍 STEP 1: Get ALL businesses in this city (for stats and CityContent)
  console.log(`🔍 Searching for businesses in city: ${city}`)
  
  // Try exact match first
  let { data: allCityBusinesses, error: allError } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city)
  
  // If no results, try case-insensitive search
  if (!allCityBusinesses || allCityBusinesses.length === 0) {
    console.log('🔄 Trying case-insensitive search...')
    const { data: fallbackBusinesses } = await supabase
      .from('businesses')
      .select('*')
      .ilike('city', `%${city}%`)
    
    if (fallbackBusinesses && fallbackBusinesses.length > 0) {
      allCityBusinesses = fallbackBusinesses
      console.log(`✅ Found ${allCityBusinesses.length} businesses with case-insensitive search`)
    }
  }

  const firstBusiness = allCityBusinesses?.[0]
  const state = firstBusiness?.state || ''
  const country = firstBusiness?.country || 'US' || 'USA' || 'Australia' || 'Aus'

  
  // Calculate city-wide stats (for CityContent)
  const totalCityBusinesses = allCityBusinesses?.length || 0
  
  // Calculate city-wide average rating
  let cityAvgRating = 0
  if (totalCityBusinesses > 0) {
    const ratingSum = allCityBusinesses?.reduce((acc, b) => acc + parseRating(b.rating), 0) || 0
    cityAvgRating = ratingSum / totalCityBusinesses
  }
  
  // Get all categories in the city (for CityContent)
  const allCategoriesInCity = [...new Set(allCityBusinesses?.map(b => b.category).filter(Boolean) || [])]
  
  // 🔍 STEP 2: Apply filters for the listing results
  let filteredBusinesses = allCityBusinesses ? [...allCityBusinesses] : []
  
  // Apply category filter
  if (selectedCategory && selectedCategory !== 'all') {
    filteredBusinesses = filteredBusinesses.filter(b => b.category === selectedCategory)
  }
  
  // Apply rating filter
  if (selectedRating && filteredBusinesses) {
    const minRating = parseFloat(selectedRating)
    filteredBusinesses = filteredBusinesses.filter(b => {
      const rating = parseRating(b.rating)
      return rating >= minRating
    })
  }
  
  // Apply sorting
  if (filteredBusinesses && filteredBusinesses.length > 0) {
    switch (sortBy) {
      case 'rating':
        filteredBusinesses.sort((a, b) => parseRating(b.rating) - parseRating(a.rating))
        break
      case 'name':
        filteredBusinesses.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'recent':
        filteredBusinesses.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        break
      default:
        filteredBusinesses.sort((a, b) => parseRating(b.rating) - parseRating(a.rating))
    }
  }
  
  const totalFilteredBusinesses = filteredBusinesses?.length || 0
  const hasActiveFilters = selectedCategory !== 'all' || selectedRating !== '' || sortBy !== 'rating'

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-white/80 hover:text-white">Home</Link>
            <span>›</span>
            <Link href="/countries" className="text-white/80 hover:text-white">Countries</Link>
            <span>›</span>
            <span className="font-semibold">{city}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <MapPin size={36} />
                Lawn Mower Services in {city}
              </h1>
              <p className="text-xl text-white/90">
                Find trusted local professionals for all your lawn mower needs
              </p>
              <p className="text-sm text-white/80 mt-2">
              If you need lawn mower repair, a new lawn mower, replacement parts, or routine servicing in {city}, 
              you're in the right place. 
              From homeowners maintaining their gardens to professional landscapers keeping their equipment in top condition, 
              {city} has a range of trusted businesses ready to help.
              </p>
              <p className="text-sm text-white/80 mt-2">
              Whether you're dealing with a mower that won't start, dull blades, engine problems, or simply need seasonal maintenance, 
              local lawn mower specialists in {city} can provide expert repairs and servicing. 
              Many shops also stock new and used lawn mowers, genuine replacement parts, and accessories for leading brands
              </p>
              <p className="text-sm text-white/80 mt-2">
                Don't let a broken mower slow you down. Get it fixed by a local expert today!
              </p>
              <p className="text-sm text-white/80 mt-2">
                <strong>Tip:</strong> Check the business ratings and reviews to find the most reliable lawn mower services in {city}.
              </p>
              <p className="text-sm text-white/80 mt-2">
                Looking to buy a new mower? Businesses throughout {city} offer everything from compact push mowers for small yards to powerful ride-on mowers for larger properties.
                 Friendly staff can help you choose the right equipment based on your lawn size, budget, and mowing needs.
              </p>
              <p className="text-sm text-white/80 mt-2">
                Keeping your lawn equipment in excellent condition can save you time and money in the long run. 
                Browse our directory to find reputable lawn mower repair shops, dealers, and service centers in {city}, compare your options, and connect with a local expert today.
              </p>
            </div>
            <div>
            
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-3xl font-bold">{totalCityBusinesses}</div>
              <div className="text-sm">Businesses Found</div>
                {totalCityBusinesses > 0 && (
              <WeatherWidget 
                city={city} 
                state={state} 
                country={country}
              />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 🆕 50/50 Layout - Full width two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT COLUMN - Sidebar with Filters and City Content */}
          <div className="space-y-2 text-xs">
            {/* Filters */}
            <NearMeFilters
              citySlug={citySlug}
              city={city}
              categoriesInCity={allCategoriesInCity}
              totalBusinesses={totalCityBusinesses}
              avgRating={cityAvgRating}
              selectedCategory={selectedCategory}
              selectedRating={selectedRating}
              sortBy={sortBy}
            />

            {/* 🟢 CityContent - Full version in sidebar with more space */}
            {totalCityBusinesses > 0 && (
              <CityContent 
                city={city} 
                totalBusinesses={totalCityBusinesses} 
                avgRating={cityAvgRating}
                categoriesInCity={allCategoriesInCity}
              />
            )}
          </div>

          {/* RIGHT COLUMN - Business Listings */}
          <div className="space-y-6">
            <div>
              <SearchBar variant="compact" placeholder={`Search in ${city}...`} />
            </div>
            
            {totalFilteredBusinesses > 0 ? (
              <>
                <div className="bg-white rounded-lg p-4 flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Showing <span className="font-semibold text-green-600">{totalFilteredBusinesses}</span> results in {city}
                      {hasActiveFilters && (
                        <span className="text-sm text-gray-400 ml-2">(filtered)</span>
                      )}
                      {totalCityBusinesses > totalFilteredBusinesses && (
                        <span className="text-sm text-gray-400 ml-2">
                          (out of {totalCityBusinesses} total)
                        </span>
                      )}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Link 
                      href={`/near-me/${citySlug}`}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                    >
                      Clear all filters
                    </Link>
                  )}
                </div>
                
                <div className="space-y-4">
                  {filteredBusinesses?.map((business) => (
                    <ListingCard key={business.id} business={business} variant="default" />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <MapPin size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {totalCityBusinesses > 0 ? 'No matching businesses found' : `No businesses found in ${city}`}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {totalCityBusinesses > 0 
                    ? `We found ${totalCityBusinesses} businesses in ${city}, but none match your filter criteria. Try adjusting your filters.`
                    : hasActiveFilters 
                      ? "No businesses match your filter criteria. Try adjusting your filters."
                      : "We couldn't find any lawn mower services in this area yet. Be the first to list your business!"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center">
                    <PlusCircle size={20} />
                    Suggest a Business
                  </button>
                  <Link href="/countries" className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
                    Browse Other Locations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Popular Cities Section - Only show if no businesses at all */}
      {totalCityBusinesses === 0 && (
        <section className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Popular Cities Nearby</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/near-me/Los%20Angeles" className="bg-white p-4 rounded-lg text-center hover:shadow-md transition">
                <div className="font-semibold">Los Angeles</div>
                <div className="text-sm text-gray-500">24 businesses</div>
              </Link>
              <Link href="/near-me/San%20Diego" className="bg-white p-4 rounded-lg text-center hover:shadow-md transition">
                <div className="font-semibold">San Diego</div>
                <div className="text-sm text-gray-500">18 businesses</div>
              </Link>
              <Link href="/near-me/San%20Francisco" className="bg-white p-4 rounded-lg text-center hover:shadow-md transition">
                <div className="font-semibold">San Francisco</div>
                <div className="text-sm text-gray-500">15 businesses</div>
              </Link>
              <Link href="/near-me/Sacramento" className="bg-white p-4 rounded-lg text-center hover:shadow-md transition">
                <div className="font-semibold">Sacramento</div>
                <div className="text-sm text-gray-500">9 businesses</div>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}