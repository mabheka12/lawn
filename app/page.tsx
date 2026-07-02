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

  // Popular Cities (derived from businesses until a dedicated cities table exists)
  const { data: cityData } = await supabase
  .from('businesses')
  .select('city, city_slug')
  .not('city_slug', 'is', null)

const cityMap = new Map<string, { name: string; slug: string; count: number }>()
cityData?.forEach((b) => {
  const existing = cityMap.get(b.city_slug)
  if (existing) {
    existing.count++
  } else {
    cityMap.set(b.city_slug, { name: b.city, slug: b.city_slug, count: 1 })
  }
})

const topCities = Array.from(cityMap.values())
  .sort((a, b) => b.count - a.count)
  .slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'LawnMowingNearMe',
              url: 'https://lawnmowingnearme.org',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://lawnmowingnearme.org/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* HERO */}
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4 text-center">
              Find Lawn Mowing & Lawn Mower Repair Services Near Me
            </h1>

            <p className="text-xl mb-8 text-center max-w-3xl mx-auto">
              Whether you need a reliable lawn mowing service near you, a full lawn
              care and maintenance plan, or a trusted repair shop for a broken mower,
              our directory connects you with vetted local businesses across the US
              and Australia — including mobile mower repair, blade sharpening,
              fertilizing, and landscaping specialists.
            </p>

            <SearchBar variant="hero" />
          </div>
        </section>

        {/* INTRO / SEO CONTENT — sibling of hero, plain background so text reads normally */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">
              The Easiest Way to Find Lawn Care & Mower Repair Near You
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Searching for &quot;lawn mower repair near me&quot; or &quot;lawn care
              service near me&quot; can turn up dozens of options with no way to
              compare them. Our directory lists lawn mowing companies, lawn
              maintenance services, mobile mower repair technicians, and blade
              sharpening specialists in one place, organized by city and service
              type so you can find the right business fast.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Own a mower repair shop or lawn care business?{' '}
              <Link href="/add-listing" className="text-green-600 underline">
                List your business
              </Link>{' '}
              to reach customers actively searching for your services in your area.
            </p>
          </div>
        </section>
        {/* FAQ */}
        <section className="py-16 container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">How do I find a lawn mower repair shop near me?</h3>
              <p className="text-gray-700 mt-1">
                Use the search bar above and enter your city or zip code. We'll show 
                you rated repair shops, including mobile repair options, in your area.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">What's the difference between lawn care and mower repair?</h3>
              <p className="text-gray-700 mt-1">
                Lawn care companies mow, edge, and maintain your yard. Mower repair 
                shops fix or service the equipment itself — blade sharpening, engine 
                tune-ups, and mobile repairs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Is mobile lawn mower repair available?</h3>
              <p className="text-gray-700 mt-1">
                Yes — many listed businesses offer mobile repair, coming to your 
                home or property to service riding mowers and push mowers on-site.
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Browse Categories</h2>
            <Link href="/categories" className="text-green-600 hover:underline">
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
                <h3 className="font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                )}
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
                <h2 className="text-3xl font-bold">Top Lawn Care Services</h2>
              </div>
              <div className="text-green-600 font-medium">
                Landscaping • Lawn Care • Gardening
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawnCareBusinesses?.map((business) => (
                <ListingCard key={business.id} business={business} variant="default" />
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
                <h2 className="text-3xl font-bold">Top Repair Shops</h2>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Star size={18} fill="currentColor" />
                <span>Highest Rated Repairs</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairBusinesses?.map((business) => (
                <ListingCard key={business.id} business={business} variant="default" />
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR LOCATIONS — bridges "our best listings" to "browse by area" */}
        {topCities.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-2">Popular Locations</h2>
              <p className="text-gray-600 mb-8">
                Find lawn care and mower repair services in your city
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sprout className="text-green-600" size={20} />
                    Lawn Care by City
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {topCities.map((city) => (
                      <Link
                        key={`lawn-${city.slug}`}
                        href={`/lawn-care/${city.slug}`}
                        className="text-green-700 hover:underline text-sm"
                      >
                        Lawn Care in {city.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Wrench className="text-green-600" size={20} />
                    Mower Repair by City
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {topCities.map((city) => (
                      <Link
                        key={`repair-${city.slug}`}
                        href={`/mower-repair/${city.slug}`}
                        className="text-green-700 hover:underline text-sm"
                      >
                        Mower Repair in {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/locations" className="text-green-700 font-medium hover:underline">
                  View all locations →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* RECENT */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recently Added Listings</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp size={20} />
                <span>Latest directory additions</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentListings?.map((business) => (
                <ListingCard key={business.id} business={business} variant="compact" />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Award size={48} className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Own a Lawn Care or Repair Business?</h2>
            <p className="text-xl mb-6">
              Join our directory and connect with customers searching for your services.
            </p>

            <Link
              href="/add-listing"
              className="inline-block bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              List Your Business
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}