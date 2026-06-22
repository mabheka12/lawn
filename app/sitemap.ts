import { createClient } from '@/utils/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.lawnmowingnearme.org'
  
  // Fetch ALL businesses with valid slugs (no limit)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at, created_at, name')
    .not('slug', 'is', null)
    .not('name', 'is', null)
    .neq('name', '')
    .order('created_at', { ascending: false })
  
  console.log(`📊 Found ${businesses?.length || 0} businesses for sitemap`)
  
  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')
    .not('slug', 'is', null)
  
  // Get ALL unique countries
  const { data: countryData } = await supabase
    .from('businesses')
    .select('country')
    .not('country', 'is', null)
    .neq('country', '')
  
  const uniqueCountries = [...new Set(countryData?.map(c => c.country) || [])]
  
  // Get ALL unique cities (no slice)
  const { data: cityData } = await supabase
    .from('businesses')
    .select('city, country')
    .not('city', 'is', null)
    .neq('city', '')
  
  const uniqueCities = [...new Map(
    cityData?.map(c => [`${c.city}-${c.country}`, { city: c.city, country: c.country }]) || []
  ).values()]
  
  console.log(`📊 Cities: ${uniqueCities.length}, Countries: ${uniqueCountries.length}`)
  
  // Static routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/near-me`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]
  
  // ALL business routes (2000+ URLs)
  const businessRoutes = businesses?.map((business) => ({
    url: `${baseUrl}/listings/${business.slug}`,
    lastModified: new Date(business.updated_at || business.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []
  
  // ALL category routes
  const categoryRoutes = categories?.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []
  
  // ALL country routes
  const countryRoutes = uniqueCountries.map((country) => ({
    url: `${baseUrl}/countries/${encodeURIComponent(country.toLowerCase().replace(/ /g, '-'))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  // ALL city routes (not just top 20)
  const cityRoutes = uniqueCities.map(({ city, country }) => ({
    url: `${baseUrl}/near-me/${encodeURIComponent(city.toLowerCase().replace(/ /g, '-'))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  // Service + city combinations - Use ALL cities or limit to reasonable number
  // Use ALL cities for service pages (but be careful with total count)
  // Max recommended URLs per sitemap is 50,000. With 200 cities × 16 services = 3,200 URLs (safe)
  const serviceCityRoutes =
  uniqueCities.flatMap(({ city }) =>
    (categories || []).map(category => ({
      url: `${baseUrl}/services/${category.slug}/${encodeURIComponent(
        city.toLowerCase().replace(/ /g, '-')
      )}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  )
  
  const allRoutes = [
    ...staticRoutes,
    ...businessRoutes,
    ...categoryRoutes,
    ...countryRoutes,
    ...cityRoutes,
    ...serviceCityRoutes,
  ]
  
  console.log(`✅ Sitemap Generation Complete:
    - Static: ${staticRoutes.length}
    - Businesses: ${businessRoutes.length}
    - Categories: ${categoryRoutes.length}
    - Countries: ${countryRoutes.length}
    - Cities: ${cityRoutes.length}
    - Service+City: ${serviceCityRoutes.length}
    ────────────────────────
    TOTAL: ${allRoutes.length} URLs
  `)
  
  return allRoutes
}