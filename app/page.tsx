import { createClient } from '@/utils/supabase/server'
import SearchBar from '@/components/Searchbar'
import ListingCard from '@/components/ListingCard'
import Link from 'next/link'
import {
  Wrench,
  Star,
  TrendingUp,
  Award,
  Sprout,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(8)

  // Lawn Care Listings
  const { data: lawnCareBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('listing_type', 'mowing')
    .order('rating', { ascending: false })
    .limit(6)

  // Repair Listings
  const { data: repairBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('listing_type', 'repairs')
    .order('rating', { ascending: false })
    .limit(6)

  // Recent Listings
  const { data: recentListings } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">

        {/* HERO */}
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4 text-center">
             Find Lawn Mowing & Lawn Mower Repair Services Near Me
            </h1>

            <p className="text-xl mb-8 text-center max-w-3xl mx-auto">
              Search local lawn mowing services, lawn care companies, 
              lawnmower repair shops, and blade sharpening specialists 
              across the US and Australia.
            </p>

            <p className="text-xl mb-8 text-center max-w-3xl mx-auto">
              Discover trusted lawn care companies, landscaping experts,
              lawn mower repair shops, and outdoor power equipment specialists.
            </p>

            <SearchBar variant="hero" />
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Browse Categories
            </h2>

            <Link
              href="/categories"
              className="text-green-600 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center group"
              >
                <Wrench
                  className="mx-auto mb-3 text-green-600 group-hover:scale-110 transition"
                  size={32}
                />

                <h3 className="font-semibold">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* LAWN CARE */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Sprout className="text-green-600" size={32} />
                <h2 className="text-3xl font-bold">
                  Top Lawn Care Services
                </h2>
              </div>

              <div className="text-green-600 font-medium">
                Landscaping • Lawn Care • Gardening
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawnCareBusinesses?.map((business) => (
                <ListingCard
                  key={business.id}
                  business={business}
                  variant="default"
                />
              ))}
            </div>
          </div>
        </section>

        {/* REPAIR SHOPS */}
        <section className="py-16">
          <div className="container mx-auto px-4">

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Wrench className="text-green-600" size={32} />
                <h2 className="text-3xl font-bold">
                  Top Repair Shops
                </h2>
              </div>

              <div className="flex items-center gap-2 text-green-600">
                <Star size={18} fill="currentColor" />
                <span>Highest Rated Repairs</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairBusinesses?.map((business) => (
                <ListingCard
                  key={business.id}
                  business={business}
                  variant="default"
                />
              ))}
            </div>
          </div>
        </section>

        {/* RECENT */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                Recently Added Listings
              </h2>

              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={20} />
                <span>Latest directory additions</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentListings?.map((business) => (
                <ListingCard
                  key={business.id}
                  business={business}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">

            <Award size={48} className="mx-auto mb-4" />

            <h2 className="text-3xl font-bold mb-4">
              Own a Lawn Care or Repair Business?
            </h2>

            <p className="text-xl mb-6">
              Join our directory and connect with customers searching for your services.
            </p>

            <button className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                <Link href="/add-listing" className="text-gray-700 hover:text-green-600 transition">
                  List Your Business
                </Link>
            </button>

          </div>
        </section>

      </main>
    </div>
  )
}