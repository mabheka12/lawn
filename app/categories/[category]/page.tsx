import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ListingCard from '@/components/ListingCard'

import type { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()
  const categorySlug = category.toLowerCase()

  const { data: categoryRow } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (!categoryRow) {
    return { title: 'Category Not Found | LawnMowingNearMe' }
  }

  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('primary_category', categoryRow.name)

  const businessCount = count || 0
  const title = `${categoryRow.name} Near Me | ${businessCount.toLocaleString()}+ Local Businesses`
  const description = `Find and compare ${businessCount.toLocaleString()} trusted ${categoryRow.name.toLowerCase()} businesses near you. Read reviews, check ratings, and connect with local professionals across the US and Australia.`
  const url = `https://www.lawnmowingnearme.org/categories/${categorySlug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: businessCount > 0, follow: true },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}


// Map each category slug to its image in /public/categories/
const CATEGORY_IMAGES: Record<string, string> = {
  'garden-design': '/categories/garden-design.webp',
  'landscaping': '/categories/landscaping.webp',
  'tree-services': '/categories/tree-services.webp',
  'lawn-care': '/categories/lawn-care.webp',
  'turf-installation': '/categories/turf-installation.webp',
  'hardscaping': '/categories/hardscaping.webp',
  'repairs': '/categories/repairs.webp',
}

const DEFAULT_CATEGORY_IMAGE = '/categories/default.webp'

function getCategoryImage(slug: string): string {
  return CATEGORY_IMAGES[slug] || DEFAULT_CATEGORY_IMAGE
}

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

          <div className="flex items-center justify-between gap-4 mt-3">
            <h1 className="text-4xl font-bold">
              {categoryRow.name}
            </h1>

            <Image
              src={getCategoryImage(categoryRow.slug)}
              alt={categoryRow.name}
              width={200}
              height={200}
              className="rounded-lg object-cover w-70 h-50 flex-shrink-0"
            />
          </div>

          <p className="text-white/90 mt-2">
            Browse trusted {categoryRow.name.toLowerCase()} services near you
          </p>

          <div className="mt-4 text-white/80">
            {results.length.toLocaleString()} businesses found
          </div>
          <p className="mt-2 text-white/80">
            Please select your city from the list on the right to view local businesses in this category.
          </p>
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