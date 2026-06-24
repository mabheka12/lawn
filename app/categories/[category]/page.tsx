import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

function unslugify(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseRating(rating: string | null): number {
  if (!rating) return 0
  const parsed = parseFloat(rating)
  return isNaN(parsed) ? 0 : parsed
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params

  if (!category) notFound()

  const supabase = await createClient()

  const categorySlug = category.toLowerCase()
  const categoryNameGuess = unslugify(category)

  // ------------------------------------
  // 1. Validate category from DB
  // ------------------------------------
  const { data: categoryRow } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (!categoryRow) {
    notFound()
  }

  // ------------------------------------
  // 2. Fetch businesses in this category
  // IMPORTANT: primary_category = category.name
  // ------------------------------------
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('primary_category', categoryRow.name)

  if (error) {
    console.error(error)
  }

  const results = businesses || []

  // ------------------------------------
  // 3. Sort by rating (SEO-friendly default)
  // ------------------------------------
  results.sort(
    (a, b) =>
      parseRating(b.rating) - parseRating(a.rating)
  )

  // ------------------------------------
  // 4. Get cities in this category (for SEO linking)
  // ------------------------------------
  const { data: cityData } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .eq('primary_category', categoryRow.name)
    .not('city', 'is', null)

  const uniqueCities = [
    ...new Map(
      (cityData || [])
        .filter(c => c.city && c.city_slug)
        .map(c => [c.city_slug, c])
    ).values()
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
        <div className="container mx-auto px-4">

          <Link
            href="/categories"
            className="text-white/80 hover:text-white text-sm"
          >
            ← Back to Categories
          </Link>

          <h1 className="text-4xl font-bold mt-3">
            {categoryRow.name}
          </h1>

          <p className="text-white/90 mt-2">
            Browse trusted {categoryRow.name.toLowerCase()} services near you
          </p>

          <div className="mt-4 text-white/80">
            {results.length.toLocaleString()} businesses found
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">

        {/* LEFT: BUSINESSES */}
        <div className="lg:w-3/4">

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((b) => (
                <ListingCard key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-lg text-center">
              <h2 className="text-xl font-bold mb-2">
                No businesses found
              </h2>
              <p className="text-gray-500">
                Try checking other categories.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: SEO CITY LINKS */}
        <aside className="lg:w-1/4">

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold mb-4">
             {categoryRow.name} Popular Cities
            </h3>

            <div className="space-y-2">
              {uniqueCities.map((city) => (
                <Link
                  key={city.city_slug}
                  href={`/categories/${categorySlug}/${city.city_slug}`}
                  className="block text-green-600 hover:underline"
                >
                  {city.city}
                </Link>
              ))}
            </div>
          </div>

        </aside>

      </section>
    </div>
  )
}