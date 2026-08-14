import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import { generateCategoryCityIntro } from '@/lib/content/categoryCityIntro'
import Link from 'next/link'

import type { Metadata } from 'next'



export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, city } = await params
  const supabase = await createClient()
  const categorySlug = category.toLowerCase()
  const citySlug = city.toLowerCase()
  const cityName = unslugify(city)

  const { data: categoryRow } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (!categoryRow) {
    return { title: 'Not Found | LawnMowingNearMe' }
  }

  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('primary_category', categoryRow.name)
    .eq('city_slug', citySlug)

  const businessCount = count || 0
  const categoryName = categoryRow.name
  const title = `${categoryName} in ${cityName} | ${businessCount} Local Businesses`
  const description = `Compare ${businessCount} trusted ${categoryName.toLowerCase()} providers in ${cityName}. Read verified reviews, check ratings, and find the right local business for your ${categoryName.toLowerCase()} needs.`
  const url = `https://www.lawnmowingnearme.org/categories/${categorySlug}/${citySlug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: businessCount > 0, follow: true },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

interface PageProps {
  params: Promise<{
    category: string
    city: string
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

export default async function CategoryCityPage({ params }: PageProps) {
  const { category, city } = await params
  console.log('🔥 CategoryCityPage rendering for', category, city)

  if (!category || !city) notFound()

  const supabase = await createClient()

  const categorySlug = category.toLowerCase()
  const citySlug = city.toLowerCase()

  const categoryName = unslugify(category)
  const cityName = unslugify(city)

  // -----------------------------
  // 1. Get category (validation)
  // -----------------------------
  const { data: categoryRow } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (!categoryRow) {
    notFound()
  }

  // -----------------------------
  // 2. Get businesses
  // -----------------------------
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('primary_category', categoryRow.name)
    .eq('city_slug', citySlug)

  if (error) {
    console.error(error)
  }

  const results = businesses || []

  // -----------------------------
  // 3. Optional sorting (SEO useful)
  // -----------------------------
  results.sort(
    (a, b) =>
      parseRating(b.rating) - parseRating(a.rating)
  )
const ratedResults = results.filter(b => parseRating(b.rating) > 0)
const averageRating =
  ratedResults.length > 0
    ? ratedResults.reduce((sum, b) => sum + parseRating(b.rating), 0) / ratedResults.length
    : null

const { opener, closer } = generateCategoryCityIntro({
  categoryName,
  cityName,
  businessCount: results.length,
  categorySlug,
  citySlug,
  averageRating,
})
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
        <div className="container mx-auto px-4">

          <Link
            href={`/categories/${categorySlug}`}
            className="text-white/80 hover:text-white text-sm"
          >
            ← Back to {categoryName}
          </Link>

          <h1 className="text-4xl font-bold mt-3">
            {categoryName} in {cityName}
          </h1>

          <p className="text-white/90 mt-2">
            Find trusted {categoryName.toLowerCase()} services in {cityName}
          </p>

          <div className="mt-4 text-white/80">
            {results.length} businesses found
          </div>
        </div>
      </section>
         {/* INTRO COPY — unique per category/city, helps with thin content */}
      <section className="container mx-auto px-4 pt-8">
        <p className="text-gray-700 leading-relaxed max-w-3xl">
          {opener}
        </p>
        {results.length > 0 && (
          <p className="text-gray-700 leading-relaxed max-w-3xl mt-3">
            {closer}
          </p>
        )}
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 py-10">

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((b) => (
              <ListingCard key={b.id} business={b} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 text-center rounded-lg">
            <h2 className="text-xl font-bold mb-2">
              No businesses found
            </h2>
            <p className="text-gray-500">
              Try another city or category combination.
            </p>
          </div>
        )}

      </section>
    </div>
  )
}