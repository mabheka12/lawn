// app/sitemap.ts

import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import {
  lawnProducts,
  lawnCategories,
} from '@/data/lawn-products'

const baseUrl = 'https://www.lawnmowingnearme.org'

const cityServices = [
  {
    slug: 'lawn-care',
    primaryCategory: 'Lawn Care',
  },
  {
    slug: 'landscaping',
    primaryCategory: 'Landscaping',
  },
  {
    slug: 'garden-design',
    primaryCategory: 'Garden Design',
  },
  {
    slug: 'tree-services',
    primaryCategory: 'Tree Services',
  },
  {
    slug: 'hardscaping',
    primaryCategory: 'Hardscaping',
  },
  {
    slug: 'mower-repair',
    listingType: 'repairs',
  },
]

type SitemapBusiness = {
  slug: string | null
  created_at: string | null
  city: string | null
  city_slug: string | null
  state: string | null
  state_slug: string | null
  country: string | null
  country_slug: string | null
  primary_category: string | null
  listing_type: string | null
  status: string | null
}

/**
 * Safely create a sitemap date.
 * Prevents invalid sitemap <lastmod> values.
 */
function safeDate(value?: string | null): Date {
  if (!value) {
    return new Date()
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? new Date()
    : date
}

/**
 * Fetch every approved business.
 *
 * Supabase commonly limits a query to 1000 rows,
 * so location pages MUST be paginated here.
 */
async function fetchAllApprovedBusinesses(
  supabase: any
): Promise<SitemapBusiness[]> {
  const pageSize = 1000
  let from = 0
  const allBusinesses: SitemapBusiness[] = []

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        slug,
        created_at,
        city,
        city_slug,
        state,
        state_slug,
        country,
        country_slug,
        primary_category,
        listing_type,
        status
      `)
      .eq('status', 'approved')
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(
        'Sitemap business fetch error:',
        error
      )
      break
    }

    if (!data || data.length === 0) {
      break
    }

    allBusinesses.push(...data)

    if (data.length < pageSize) {
      break
    }

    from += pageSize
  }

  return allBusinesses
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // ====================================================
  // 1. STATIC PAGES
  // ====================================================

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/near-me`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lawn-care`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mower-repair`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lawn-products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // ====================================================
  // 2. LOAD ALL APPROVED BUSINESSES ONCE
  // ====================================================

  const businesses =
    await fetchAllApprovedBusinesses(supabase)

  // ====================================================
  // 3. INDIVIDUAL BUSINESS LISTINGS
  // ====================================================

  const businessRoutes: MetadataRoute.Sitemap =
    businesses
      .filter(
        (
          business
        ): business is SitemapBusiness & {
          slug: string
        } => Boolean(business.slug)
      )
      .map((business) => ({
        url: `${baseUrl}/listings/${business.slug}`,
        lastModified: safeDate(
          business.created_at
        ),
        changeFrequency:
          'weekly' as const,
        priority: 0.7,
      }))

  // ====================================================
  // 4. CATEGORY PAGES
  // ====================================================

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')

  const categoryRoutes: MetadataRoute.Sitemap =
    (categories || [])
      .filter((category) => category.slug)
      .map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency:
          'weekly' as const,
        priority: 0.8,
      }))

  // ====================================================
  // 5. COUNTRY HUBS
  //
  // /near-me/united-states
  // /near-me/australia
  // ====================================================

  const countryMap = new Map<
    string,
    {
      count: number
    }
  >()

  for (const business of businesses) {
    if (!business.country_slug) {
      continue
    }

    const existing = countryMap.get(
      business.country_slug
    )

    if (existing) {
      existing.count++
    } else {
      countryMap.set(
        business.country_slug,
        {
          count: 1,
        }
      )
    }
  }

  const countryRoutes: MetadataRoute.Sitemap =
    Array.from(countryMap.entries()).map(
      ([countrySlug]) => ({
        url: `${baseUrl}/near-me/${countrySlug}`,
        lastModified: new Date(),
        changeFrequency:
          'weekly' as const,
        priority: 0.9,
      })
    )

  // ====================================================
  // 6. STATE / REGION HUBS
  //
  // /near-me/united-states/texas
  // /near-me/australia/victoria
  // ====================================================

  const stateMap = new Map<
    string,
    {
      countrySlug: string
      stateSlug: string
      count: number
    }
  >()

  for (const business of businesses) {
    if (
      !business.country_slug ||
      !business.state_slug
    ) {
      continue
    }

    const key =
      `${business.country_slug}__${business.state_slug}`

    const existing = stateMap.get(key)

    if (existing) {
      existing.count++
    } else {
      stateMap.set(key, {
        countrySlug:
          business.country_slug,
        stateSlug:
          business.state_slug,
        count: 1,
      })
    }
  }

  const stateRoutes: MetadataRoute.Sitemap =
    Array.from(stateMap.values()).map(
      (state) => ({
        url:
          `${baseUrl}/near-me/` +
          `${state.countrySlug}/` +
          `${state.stateSlug}`,
        lastModified: new Date(),
        changeFrequency:
          'weekly' as const,
        priority: 0.85,
      })
    )

  // ====================================================
  // 7. CANONICAL CITY PAGES
  //
  // IMPORTANT:
  // country + state + city is the location identity.
  //
  // Only index locations with >= 3 approved businesses.
  // ====================================================

  const cityMap = new Map<
    string,
    {
      countrySlug: string
      stateSlug: string
      citySlug: string
      count: number
    }
  >()

  for (const business of businesses) {
    if (
      !business.country_slug ||
      !business.state_slug ||
      !business.city_slug
    ) {
      continue
    }

    const key = [
      business.country_slug,
      business.state_slug,
      business.city_slug,
    ].join('__')

    const existing = cityMap.get(key)

    if (existing) {
      existing.count++
    } else {
      cityMap.set(key, {
        countrySlug:
          business.country_slug,
        stateSlug:
          business.state_slug,
        citySlug:
          business.city_slug,
        count: 1,
      })
    }
  }

  const cityRoutes: MetadataRoute.Sitemap =
    Array.from(cityMap.values())
      .filter((city) => city.count >= 3)
      .map((city) => ({
        url:
          `${baseUrl}/near-me/` +
          `${city.countrySlug}/` +
          `${city.stateSlug}/` +
          `${city.citySlug}`,
        lastModified: new Date(),
        changeFrequency:
          'weekly' as const,
        priority: 0.8,
      }))

  // ----------------------------------------
// CITY × SERVICE PAGES
//
// Only index service/location combinations
// with 3+ approved businesses.
//
// Examples:
// /near-me/united-states/texas/dallas/lawn-care
// /near-me/united-states/missouri/kansas-city/mower-repair
// ----------------------------------------

const serviceLocationMap = new Map<
  string,
  {
    countrySlug: string
    stateSlug: string
    citySlug: string
    serviceSlug: string
    count: number
  }
>()

for (const business of businesses || []) {
  if (
    !business.country_slug ||
    !business.state_slug ||
    !business.city_slug
  ) {
    continue
  }

  for (const service of cityServices) {
    let matches = false

    if (service.primaryCategory) {
      matches =
        business.primary_category ===
        service.primaryCategory
    }

    if (service.listingType) {
      matches =
        business.listing_type ===
        service.listingType
    }

    if (!matches) {
      continue
    }

    const key = [
      business.country_slug,
      business.state_slug,
      business.city_slug,
      service.slug,
    ].join('__')

    const existing =
      serviceLocationMap.get(key)

    if (existing) {
      existing.count++
    } else {
      serviceLocationMap.set(key, {
        countrySlug:
          business.country_slug,

        stateSlug:
          business.state_slug,

        citySlug:
          business.city_slug,

        serviceSlug:
          service.slug,

        count: 1,
      })
    }
  }
}

const serviceCityRoutes =
  Array.from(
    serviceLocationMap.values()
  )
    .filter(
      (location) =>
        location.count >= 3
    )
    .map((location) => ({
      url:
        `${baseUrl}/near-me/` +
        `${location.countrySlug}/` +
        `${location.stateSlug}/` +
        `${location.citySlug}/` +
        `${location.serviceSlug}`,

      lastModified: new Date(),

      changeFrequency:
        'weekly' as const,

      priority: 0.7,
    }))

  // ====================================================
  // 8. BLOG POSTS
  // ====================================================

  const { data: blogData } = await supabase
    .from('blog_posts')
    .select('slug, created_at')

  const blogRoutes: MetadataRoute.Sitemap =
    (blogData || [])
      .filter((post) => post.slug)
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: safeDate(
          post.created_at
        ),
        changeFrequency:
          'monthly' as const,
        priority: 0.6,
      }))

  // ====================================================
  // 9. LAWN PRODUCT PAGES
  // ====================================================

  const productRoutes: MetadataRoute.Sitemap =
    lawnProducts.map((product) => ({
      url:
        `${baseUrl}/lawn-products/product/` +
        `${product.slug}`,
      lastModified: new Date(),
      changeFrequency:
        'weekly' as const,
      priority: 0.7,
    }))

  // ====================================================
  // 10. LAWN PRODUCT CATEGORY PAGES
  // ====================================================

  const productCategoryRoutes: MetadataRoute.Sitemap =
    lawnCategories.map((category) => ({
      url:
        `${baseUrl}/lawn-products/category/` +
        `${category.slug}`,
      lastModified: new Date(),
      changeFrequency:
        'weekly' as const,
      priority: 0.7,
    }))

  // ====================================================
  // FINAL
  // ====================================================

  return [
    ...staticRoutes,

    ...countryRoutes,
    ...stateRoutes,
    ...cityRoutes,

    ...categoryRoutes,
    ...businessRoutes,

    ...blogRoutes,

    ...productRoutes,
    ...productCategoryRoutes,
    ...serviceCityRoutes
  ]
} 