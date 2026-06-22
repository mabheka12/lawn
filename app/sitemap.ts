import { createClient } from '@/utils/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.lawnmowingnearme.org'

  // -------------------------
  // BUSINESSES
  // -------------------------
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at, created_at')
    .not('slug', 'is', null)

  const businessRoutes =
    businesses?.map((b) => ({
      url: `${baseUrl}/listings/${b.slug}`,
      lastModified: new Date(b.updated_at || b.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

  // -------------------------
  // CITIES
  // -------------------------
  const { data: cityData } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .not('city', 'is', null)
    .not('city_slug', 'is', null)

  const uniqueCities = [
    ...new Map(
      (cityData || []).map((c) => [c.city_slug, c])
    ).values(),
  ]

  const cityRoutes = uniqueCities.map((c) => ({
    url: `${baseUrl}/near-me/${c.city_slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // -------------------------
  // SERVICES (ONLY 2 TYPES)
  // -------------------------
  const services = ['mowing', 'repairs']

  const serviceCityRoutes = uniqueCities.flatMap((city) =>
    services.map((service) => ({
      url: `${baseUrl}/services/${service}/${city.city_slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  )

  // -------------------------
  // STATIC ROUTES
  // -------------------------
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/near-me`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  const allRoutes = [
    ...staticRoutes,
    ...businessRoutes,
    ...cityRoutes,
    ...serviceCityRoutes,
  ]

  console.log(`✅ Sitemap built:`)
  console.log(`- Businesses: ${businessRoutes.length}`)
  console.log(`- Cities: ${cityRoutes.length}`)
  console.log(`- Service pages: ${serviceCityRoutes.length}`)
  console.log(`TOTAL: ${allRoutes.length}`)

  return allRoutes
}