import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { SERVICE_CONFIG } from '@/lib/service-config'
import type { Metadata } from 'next'

const SERVICE = 'mower-repair' as const

export const metadata: Metadata = {
  title: 'Mower Repair Services by City',
  description: 'Find local mower repair companies in your area.',
}

export default async function MowerRepairHubPage() {
  const supabase = await createClient()
  const config = SERVICE_CONFIG[SERVICE]

  const { data } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .eq('listing_type', config.listingType)
    .not('city_slug', 'is', null)

  const cityMap = new Map<string, { name: string; slug: string; count: number }>()
  data?.forEach((b) => {
    const existing = cityMap.get(b.city_slug)
    if (existing) {
      existing.count++
    } else {
      cityMap.set(b.city_slug, { name: b.city, slug: b.city_slug, count: 1 })
    }
  })

  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{config.label} Services by City</h1>
      <p className="text-gray-600 mb-8">
        Browse {config.heroDescription} across {cities.length} cities.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/${SERVICE}/${city.slug}`}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
          >
            <div className="font-medium">{city.name}</div>
            <div className="text-sm text-gray-500">{city.count} listing{city.count !== 1 ? 's' : ''}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}