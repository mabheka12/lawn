import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/Searchbar'
import CategoryFilters from '@/components/CategoryFilters'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function parseRating(rating: string | null): number {
  if (!rating) return 0

  const normalized = rating.replace(',', '.')
  const parsed = parseFloat(normalized)

  return isNaN(parsed) ? 0 : parsed
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const supabase = await createClient()

  // Get category from categories table
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  const selectedCity =
    (resolvedSearchParams.city as string) || 'all'

  const selectedRating =
    (resolvedSearchParams.rating as string) || 'all'

  const sortBy =
    (resolvedSearchParams.sort as string) || 'rating-desc'

  // Get businesses in this category
  let query = supabase
    .from('businesses')
    .select('*')
    .eq('primary_category', category.name)

  if (selectedCity !== 'all') {
    query = query.eq('city', selectedCity)
  }

  const { data } = await query

  let businesses = data || []

  // Rating filter
  if (selectedRating !== 'all') {
    const minRating = parseFloat(selectedRating)

    businesses = businesses.filter((business) => {
      return parseRating(business.rating) >= minRating
    })
  }

  // Sorting
  switch (sortBy) {
    case 'rating-desc':
      businesses.sort(
        (a, b) =>
          parseRating(b.rating) - parseRating(a.rating)
      )
      break

    case 'rating-asc':
      businesses.sort(
        (a, b) =>
          parseRating(a.rating) - parseRating(b.rating)
      )
      break

    case 'name-asc':
      businesses.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      )
      break

    case 'name-desc':
      businesses.sort((a, b) =>
        (b.name || '').localeCompare(a.name || '')
      )
      break

    case 'recent':
      businesses.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
      break
  }

  // Cities for filters
  const { data: cityData } = await supabase
    .from('businesses')
    .select('city')
    .eq('primary_category', category.name)
    .not('city', 'is', null)
    .neq('city', '')

  const uniqueCities = [
    ...new Set(
      cityData
        ?.map((item) => item.city)
        .filter(Boolean) || []
    ),
  ]

  const cityCounts: Record<string, number> = {}

  uniqueCities.forEach((city) => {
    cityCounts[city] =
      businesses.filter((b) => b.city === city).length
  })

  const ratingCounts = {
    '4.5': 0,
    '4.0': 0,
    '3.5': 0,
    '3.0': 0,
  }

  businesses.forEach((business) => {
    const rating = parseRating(business.rating)

    if (rating >= 4.5) ratingCounts['4.5']++
    else if (rating >= 4.0) ratingCounts['4.0']++
    else if (rating >= 3.5) ratingCounts['3.5']++
    else if (rating >= 3.0) ratingCounts['3.0']++
  })

  const hasActiveFilters =
    selectedCity !== 'all' ||
    selectedRating !== 'all' ||
    sortBy !== 'rating-desc'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4"
            >
              <ArrowLeft size={20} />
              Back to Categories
            </Link>

            <h1 className="text-4xl font-bold mb-4">
              {category.name}
            </h1>

            <p className="text-xl mb-4">
              Browse trusted {category.name.toLowerCase()} businesses near you
            </p>

            <div className="max-w-2xl">
              <SearchBar
                variant="compact"
                placeholder={`Search ${category.name} businesses...`}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <CategoryFilters
                categorySlug={slug}
                uniqueCities={uniqueCities}
                cityCounts={cityCounts}
                ratingCounts={ratingCounts}
                totalBusinesses={businesses.length}
                selectedCity={selectedCity}
                selectedRating={selectedRating}
                sortBy={sortBy}
              />
            </div>

            {/* Listings */}
            <div className="lg:w-3/4">
              <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <p className="text-gray-600">
                  Found{' '}
                  <span className="font-semibold text-green-600">
                    {businesses.length}
                  </span>{' '}
                  businesses
                  {selectedCity !== 'all' && (
                    <span>
                      {' '}
                      in{' '}
                      <span className="font-semibold">
                        {selectedCity}
                      </span>
                    </span>
                  )}
                </p>

                {hasActiveFilters && (
                  <Link
                    href={`/categories/${slug}`}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    Clear all filters
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {businesses.length > 0 ? (
                  businesses.map((business) => (
                    <ListingCard
                      key={business.id}
                      business={business}
                      variant="default"
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <p className="text-gray-500">
                      No businesses found matching your filters.
                    </p>

                    <Link
                      href={`/categories/${slug}`}
                      className="inline-block mt-4 text-green-600 hover:underline"
                    >
                      Clear all filters
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}