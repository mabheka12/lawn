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
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateStaticParams() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select('city, primary_category')

  if (!data) return []

  const params = data.map(item => ({
    service: item.primary_category
      ?.toLowerCase()
      .replace(/\s+/g, '-'),
    city: item.city
      ?.toLowerCase()
      .replace(/\s+/g, '-'),
  }))

  return params
}

export async function generateMetadata({ params }: PageProps) {
  const { service, city } = await params

  const serviceName = unslugify(service)
  const cityName = unslugify(city)

  return {
    title: `${serviceName} in ${cityName} | LawnMowingNearMe`,
    description: `Find trusted ${serviceName.toLowerCase()} providers in ${cityName}. Compare ratings, reviews and contact details.`,
  }
}

export default async function ServiceCityPage({ params }: PageProps) {
  const { service, city } = await params

  const supabase = await createClient()

  const cityName = unslugify(city)

  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', service)
    .single()

  if (!category) {
    notFound()
  }

  // Find businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('primary_category', category.name)
    .ilike('city', cityName)

  if (!businesses || businesses.length === 0) {
    notFound()
  }

  

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">
        <div className="container mx-auto px-4">

          <Link
            href={`/categories/${service}`}
            className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to {category.name}
          </Link>

          <h1 className="text-4xl font-bold mb-4">
            {category.name} in {cityName}
          </h1>

          <p className="text-xl text-green-50 max-w-3xl">
            Compare trusted {category.name.toLowerCase()} businesses in{' '}
            {cityName}. Find contact details, reviews, locations and more.
          </p>

          <div className="flex items-center gap-2 mt-6 text-green-100">
            <MapPin size={18} />
            {businesses.length} listings found
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 py-10">

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Best {category.name} Businesses in {cityName}
          </h2>

          <p className="text-gray-600">
            Browse local providers offering {category.name.toLowerCase()} services.
          </p>
        </div>

        <div className="space-y-4">
          {businesses.map((business) => (
            <ListingCard
              key={business.id}
              business={business}
              variant="default"
            />
          ))}
        </div>

      </section>

      {/* SEO CONTENT */}
      <section className="bg-white border-t">
        <div className="container mx-auto px-4 py-12 max-w-4xl">

          <h2 className="text-2xl font-bold mb-4">
            About {category.name} in {cityName}
          </h2>

          <p className="text-gray-700 mb-4">
            Looking for reliable {category.name.toLowerCase()} providers in{' '}
            {cityName}? Our directory helps you compare businesses,
            view ratings, contact providers directly and find the right
            service for your needs.
          </p>

          <p className="text-gray-700">
            Whether you need regular maintenance, seasonal work or a
            one-time service, these businesses serve customers throughout{' '}
            {cityName}.
          </p>

        </div>
      </section>

    </div>
  )
}