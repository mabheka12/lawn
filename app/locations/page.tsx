// app/locations/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function LocationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .not('city_slug', 'is', null)

  const cityMap = new Map<string, string>()
  data?.forEach((b) => cityMap.set(b.city_slug, b.city))
  const cities = Array.from(cityMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">All Locations</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.map((city) => (
          <div key={city.slug} className="space-y-1">
            <div className="font-medium text-gray-800">{city.name}</div>
            <Link href={`/lawn-care/${city.slug}`} className="block text-sm text-green-700 hover:underline">
              Lawn Care
            </Link>
            <Link href={`/mower-repair/${city.slug}`} className="block text-sm text-green-700 hover:underline">
              Mower Repair
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}