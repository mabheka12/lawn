import { createClient } from '@/utils/supabase/server'
import CountriesClient from './CountriesClient'

// Helper function to safely parse rating
function parseRating(rating: string | null): number {
  if (!rating) return 0
  const parsed = parseFloat(rating)
  return isNaN(parsed) ? 0 : parsed
}

export default async function CountriesPage() {
  const supabase = await createClient()
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('country, city, state, rating')
    .not('country', 'is', null)
  
  console.log('Total businesses with countries:', businesses?.length || 0)
  if (error) console.error('Supabase error:', error)
  
  if (!businesses || businesses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No Countries Found</h2>
          <p className="text-gray-600">Please add some businesses with country information to get started.</p>
        </div>
      </div>
    )
  }
  
  // Process countries
  const countryMap = new Map()
  
  businesses.forEach(biz => {
    if (!biz.country) return
    
    if (!countryMap.has(biz.country)) {
      countryMap.set(biz.country, {
        name: biz.country,
        code: getCountryCode(biz.country),
        flag: getCountryFlag(biz.country),
        businessCount: 0,
        ratingSum: 0,
        ratingCount: 0,
        cities: []
      })
    }
    
    const country = countryMap.get(biz.country)
    country.businessCount++
    
    // Track ratings for average calculation
    const rating = parseRating(biz.rating)
    if (rating > 0) {
      country.ratingSum += rating
      country.ratingCount++
    }
    
    // Add unique cities
    if (biz.city && !country.cities.find((c: any) => c.name === biz.city)) {
      const cityCount = businesses.filter(b => b.city === biz.city && b.country === biz.country).length
      country.cities.push({ name: biz.city, count: cityCount })
    }
  })
  
  // Calculate average rating and clean up
  const countries = Array.from(countryMap.values()).map((country: any) => ({
    ...country,
    avgRating: country.ratingCount > 0 ? country.ratingSum / country.ratingCount : 0
  }))
  
  // Sort by business count (most first)
  countries.sort((a, b) => b.businessCount - a.businessCount)

  return <CountriesClient initialCountries={countries} />
}

// Helper functions
function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Australia': 'AU'
  }
  return codes[country] || 'US'
}

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺'
  }
  return flags[country] || '🌍'
}