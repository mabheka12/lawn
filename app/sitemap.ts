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
      const [category, city] = key.split('__')

      return {
        url: `${baseUrl}/categories/${category}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6
      }
    })

  // ----------------------------------------
  // FINAL OUTPUT
  // ----------------------------------------
  const allRoutes = [
    ...staticRoutes,
    ...businessRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...categoryCityRoutes
  ]

  console.log('✅ Sitemap built:')
  console.log('- Businesses:', businessRoutes.length)
  console.log('- Cities:', cityRoutes.length)
  console.log('- Category×City:', categoryCityRoutes.length)
  console.log('TOTAL:', allRoutes.length)

  return allRoutes
}