const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  'great britain': 'United Kingdom',
  britain: 'United Kingdom',
  england: 'United Kingdom',
  uae: 'United Arab Emirates',
}

export function normalizeCountry(country: string | null | undefined): string | null {
  if (!country) return null
  const key = country.trim().toLowerCase()
  return COUNTRY_ALIASES[key] ?? country.trim()
}