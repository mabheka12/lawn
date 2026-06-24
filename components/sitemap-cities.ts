import { createClient } from '@/utils/supabase/client'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = 'https://www.lawnmowingnearme.org'

  const { data } = await supabase
    .from('businesses')
    .select('city_slug')
    .not('city_slug', 'is', null)

  const cities = [...new Set(data?.map(c => c.city_slug) || [])]

  return cities.map((slug) => ({
    url: `${baseUrl}/near-me/${slug}`,
    lastModified: new Date(),
    priority: 0.7,
    changeFrequency: 'weekly',
  }))
}