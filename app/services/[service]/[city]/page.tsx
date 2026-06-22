import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import { ArrowLeft, MapPin } from 'lucide-react'

interface PageProps {
  params: Promise<{
    service: string
    city: string
  }>
}

function unslugify(text: string) {
  return text
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function ServiceCityPage({ params }: PageProps) {

  // ✅ MUST AWAIT PARAMS (this fixes your crash)
  const { service, city } = await params

  if (!service || !city) {
    notFound()
  }

  const supabase = await createClient()

  const serviceType = service.toLowerCase()
  const citySlug = city.toLowerCase()

  const cityName = unslugify(city)

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('listing_type', serviceType)
    .eq('city_slug', citySlug)

  if (error || !businesses || businesses.length === 0) {
    notFound()
  }

  const serviceLabel =
    serviceType === 'mowing'
      ? 'Lawn Mowing'
      : serviceType === 'repairs'
      ? 'Repairs'
      : unslugify(serviceType)

  return (
    <div className="min-h-screen bg-gray-50">

      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
        <div className="container mx-auto px-4">

          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <h1 className="text-4xl font-bold mb-4">
            {serviceLabel} in {cityName}
          </h1>

          <div className="flex items-center gap-2 text-green-100">
            <MapPin size={18} />
            {businesses.length} listings found
          </div>

        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="space-y-4">
          {businesses.map((b) => (
            <ListingCard key={b.id} business={b} />
          ))}
        </div>
      </section>

    </div>
  )
}