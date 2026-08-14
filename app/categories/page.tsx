import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Wrench,
  Settings,
  Sprout,
  Toolbox,
} from 'lucide-react'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Lawn Care Service Categories | Browse by Service Type',
  description:
    'Browse lawn care, landscaping, tree services, turf installation, and mower repair categories. Compare trusted local businesses by service type across the US and Australia.',
  alternates: {
    canonical: 'https://www.lawnmowingnearme.org/categories',
  },
  openGraph: {
    title: 'Lawn Care Service Categories | LawnMowingNearMe',
    description:
      'Browse lawn care, landscaping, tree services, turf installation, and mower repair categories.',
    url: 'https://www.lawnmowingnearme.org/categories',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lawn Care Service Categories | LawnMowingNearMe',
    description:
      'Browse lawn care, landscaping, tree services, turf installation, and mower repair categories.',
  },
}

function getCategoryIcon(slug: string) {
  if (slug.includes('repair')) return Wrench
  if (slug.includes('maintenance')) return Settings
  if (slug.includes('landscaping')) return Sprout
  if (slug.includes('garden')) return Sprout
  if (slug.includes('supplies')) return Toolbox
  if (slug.includes('parts')) return Toolbox

  return Wrench
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Query 1: get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Query 2: get an EXACT count per category via head:true requests.
  // This avoids Supabase/PostgREST's default 1000-row cap that you'd hit
  // if you tried to fetch all `primary_category` values and count in JS.
  // head:true means no rows are transferred, just the count -- cheap.
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('primary_category', category.name)
        .eq('status', 'approved') // adjust/remove if you don't want to filter by status here

      return {
        ...category,
        count: count || 0,
      }
    })
  )

  const totalBusinesses = categoriesWithCounts.reduce(
    (sum, c) => sum + c.count,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            Lawn Care Service Categories
          </h1>

          <p className="text-xl">
            Browse businesses by service category
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((category) => {
            const Icon = getCategoryIcon(category.slug)

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Icon
                      className="text-green-600 mb-3"
                      size={32}
                    />

                    <h2 className="text-2xl font-bold mb-2 group-hover:text-green-600 transition">
                      {category.name}
                    </h2>

                    <p className="text-gray-600">
                      {category.count.toLocaleString()} businesses
                    </p>
                  </div>

                  <div className="text-green-600 group-hover:translate-x-1 transition">
                    →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-6">
            Directory Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-bold text-3xl text-green-600">
                {totalBusinesses.toLocaleString()}+
              </div>

              <div className="text-gray-600">
                Total Listings
              </div>
            </div>

            <div>
              <div className="font-bold text-3xl text-green-600">
                {categoriesWithCounts.length}+
              </div>

              <div className="text-gray-600">
                Categories
              </div>
            </div>

            <div>
              <div className="font-bold text-3xl text-green-600">
                USA + Australia
              </div>

              <div className="text-gray-600">
                Countries Covered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
