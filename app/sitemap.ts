import { createClient } from '@/utils/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://www.lawnmowingnearme.org'

  // ----------------------------------------
  // 1. STATIC PAGES (always index)
  // ----------------------------------------
  const staticRoutes = [
    '/',
    '/categories',
    '/near-me',
    '/about',
    '/contact'
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1
  }))

  // ----------------------------------------
  // 2. BUSINESSES (all indexable)
  // ----------------------------------------
async function fetchAllBusinesses(supabase: any) {
  const pageSize = 1000
  let from = 0
  let all: any[] = []

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('slug, created_at, name')
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(error)
      break
    }

    if (!data || data.length === 0) break

    all = all.concat(data)

    if (data.length < pageSize) break

    from += pageSize
  }

  return all
}

  const businesses = await fetchAllBusinesses(supabase)

  const businessRoutes =
    (businesses || []).map(b => ({
      url: `${baseUrl}/listings/${b.slug}`,
      lastModified: new Date(b.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))

  // ----------------------------------------
  // 3. CATEGORIES
  // ----------------------------------------
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')

  const categoryRoutes =
    (categories || []).map(c => ({
      url: `${baseUrl}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    }))

  const slugLookup = new Map<string, string>()
  ;(categories || []).forEach(c => {
    if (c.name && c.slug) {
      slugLookup.set(c.name, c.slug)
    }
  })

  // ----------------------------------------
  // 4. CITIES (FILTERED = IMPORTANT FIX)
  // Only cities with 3+ businesses
  // ----------------------------------------
  const { data: cityData } = await supabase
    .from('businesses')
    .select('city, city_slug')

  const cityCountMap = new Map<string, number>()

  cityData?.forEach(b => {
    if (!b.city_slug) return
    cityCountMap.set(
      b.city_slug,
      (cityCountMap.get(b.city_slug) || 0) + 1
    )
  })

  const cityRoutes = Array.from(cityCountMap.entries())
    .filter(([_, count]) => count >= 3)
    .map(([citySlug]) => ({
      url: `${baseUrl}/near-me/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))

  // ----------------------------------------
  // 5. CATEGORY × CITY (CONTROLLED SCALE)
  // Only include combinations with 2+ businesses
  // ----------------------------------------
  const { data: comboData } = await supabase
    .from('businesses')
    .select('primary_category, city_slug')

  const comboMap = new Map<string, number>()

  comboData?.forEach(b => {
    if (!b.primary_category || !b.city_slug) return

    const key = `${b.primary_category}__${b.city_slug}`
    comboMap.set(key, (comboMap.get(key) || 0) + 1)
  })

  const categoryCityRoutes = Array.from(comboMap.entries())
    .filter(([_, count]) => count >= 2)
    .map(([key]) => {
      const [categoryName, citySlug] = key.split('__')
      const categorySlug = slugLookup.get(categoryName)

      if (!categorySlug) return null

      return {
        url: `${baseUrl}/categories/${categorySlug}/${citySlug}`,
        lastModified: new Date(),
        priority: 0.6,
        changeFrequency: 'weekly' as const
      }
    })
    .filter((route): route is {
      url: string
      lastModified: Date
      priority: number
      changeFrequency: 'weekly'
    } => Boolean(route))

    const { data: serviceCityData } = await supabase
  .from('businesses')
  .select('listing_type, city_slug')

const serviceCityMap = new Map<string, number>()
serviceCityData?.forEach(b => {
  if (!b.listing_type || !b.city_slug) return
  const key = `${b.listing_type}__${b.city_slug}`
  serviceCityMap.set(key, (serviceCityMap.get(key) || 0) + 1)
})

const listingTypeToSlug: Record<string, string> = {
  mowing: 'lawn-care',
  repairs: 'mower-repair',
}

const serviceCityRoutes = Array.from(serviceCityMap.entries()).map(([key, count]) => {
  const [listingType, citySlug] = key.split('__')
  const serviceSlug = listingTypeToSlug[listingType]
  if (!serviceSlug) return null
  return {
    url: `${baseUrl}/${serviceSlug}/${citySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }
}).filter((r): r is NonNullable<typeof r> => Boolean(r))

  // ----------------------------------------
  // FINAL OUTPUT
  // ----------------------------------------
  const allRoutes = [
    ...staticRoutes,
    ...businessRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...categoryCityRoutes,
    ...serviceCityRoutes,
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    }
  ]

  return allRoutes
}