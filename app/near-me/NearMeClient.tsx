import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { SearchBar, ListingCard } from '@/components'
import NearMeFilters from '@/components/NearmeFilter'
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

export const revalidate = 3600;

export default async function NearMePage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params
  const resolvedSearchParams = await searchParams
  const city = decodeCity(citySlug)
  
  const supabase = await createClient()
  
  // Get filter values from URL
  const selectedCategory = (resolvedSearchParams.category as string) || 'all'
  const selectedRating = (resolvedSearchParams.rating as string) || ''
  const sortBy = (resolvedSearchParams.sort as string) || 'rating'
  
  // Get businesses in this city
  let query = supabase
    .from('businesses')
    .select('*')
    .eq('city', city)
  
  // Apply category filter
  if (selectedCategory && selectedCategory !== 'all') {
    query = query.eq('category', selectedCategory)
  }
  
  let { data: businesses } = await query
  
  // Apply rating filter
  if (selectedRating && businesses) {
    const minRating = parseFloat(selectedRating)
    businesses = businesses.filter(b => {
      const rating = parseRating(b.rating)
      return rating >= minRating
    })
  }
  
  // Apply sorting
  if (businesses) {
    switch (sortBy) {
      case 'rating':
        businesses.sort((a, b) => parseRating(b.rating) - parseRating(a.rating))
        break
      case 'name':
        businesses.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'recent':
        businesses.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        break
      default:
        businesses.sort((a, b) => parseRating(b.rating) - parseRating(a.rating))
    }
  }
  
  // Get unique categories in this city
  const categoriesInCity = [...new Set(businesses?.map(b => b.category).filter(Boolean) || [])]
  const totalBusinesses = businesses?.length || 0
  
  // Calculate average rating
  let avgRating = 0
  if (totalBusinesses > 0) {
    const ratingSum = businesses?.reduce((acc, b) => acc + parseRating(b.rating), 0) || 0
    avgRating = ratingSum / totalBusinesses
  }

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
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="text-3xl font-bold">{totalBusinesses}</div>
              <div className="text-sm">Businesses Found</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Now using Client Component for filters */}
          <div className="lg:w-1/4">
          <NearMeFilters
            basePath={`/near-me/${citySlug}`}
            city={city}
            categoriesInCity={categoriesInCity}
            totalBusinesses={totalBusinesses}
            avgRating={avgRating}
            selectedCategory={selectedCategory}
            selectedRating={selectedRating}
            sortBy={sortBy}
          />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <SearchBar variant="compact" placeholder={`Search in ${city}...`} />
            </div>
            
            {totalBusinesses > 0 ? (
              <>
                <div className="bg-white rounded-lg p-4 mb-4 flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-gray-600">
                      Showing <span className="font-semibold text-green-600">{businesses?.length || 0}</span> results in {city}
                      {hasActiveFilters && (
                        <span className="text-sm text-gray-400 ml-2">(filtered)</span>
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
                  {businesses?.map((business) => (
                    <ListingCard key={business.id} business={business} variant="default" />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <MapPin size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No businesses found in {city}</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {hasActiveFilters 
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
      
      {/* Popular Cities Section - Only show if no results or always? */}
      {totalBusinesses === 0 && (
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