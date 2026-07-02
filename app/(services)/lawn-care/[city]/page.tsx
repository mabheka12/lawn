import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import { ArrowLeft, MapPin } from 'lucide-react'
import { SERVICE_CONFIG, ServiceSlug } from '@/lib/service-config'
import type { Metadata } from 'next'

const SERVICE: ServiceSlug = 'mower-repair'

interface PageProps {
  params: Promise<{ city: string }>
}

function unslugify(text: string) {
  return text
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function getCityBusinesses(citySlug: string) {
  const supabase = await createClient()
  const config = SERVICE_CONFIG[SERVICE]

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('listing_type', config.listingType)
    .eq('city_slug', citySlug)

  return businesses ?? []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params
  const cityName = unslugify(city)
  const config = SERVICE_CONFIG[SERVICE]

  return {
    title: `${config.label} in ${cityName} | Find Local Providers`,
    description: `Browse trusted ${config.heroDescription} in ${cityName}. Compare ratings and contact local businesses directly.`,
  }
}

export default async function ServiceCityPage({ params }: PageProps) {
  const { city } = await params
  const citySlug = city.toLowerCase()
  const cityName = unslugify(citySlug)
  const config = SERVICE_CONFIG[SERVICE]

  const businesses = await getCityBusinesses(citySlug)

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
        <div className="container mx-auto px-4">
          <Link href={`/${SERVICE}`} className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white">
            <ArrowLeft size={18} />
            All {config.label} Locations
          </Link>

          <h1 className="text-4xl font-bold mb-4">
            {config.label} in {cityName}
          </h1>

          <div className="flex items-center gap-2 text-green-100">
            <MapPin size={18} />
            {businesses.length > 0
              ? `${businesses.length} listing${businesses.length === 1 ? '' : 's'} found`
              : 'No listings yet'}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {businesses.length > 0 ? (
          <div className="space-y-4">
            {businesses.map((b) => (
              <ListingCard key={b.id} business={b} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              No {config.label.toLowerCase()} businesses in {cityName} yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to list your business and reach customers searching in this area.
            </p>
            <Link
              href="/add-listing"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              List Your Business
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}