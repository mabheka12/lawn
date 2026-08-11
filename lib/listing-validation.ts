export interface ListingFormData {
  name: string
  address?: string
  phone?: string
  website?: string
  category?: string
  city: string
  state?: string
  country?: string
  description?: string
  listing_type: string
  primary_category?: string
}

const PHONE_REGEX = /^[\d\s()+-]{7,20}$/
const DOMAIN_REGEX = /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/.*)?$/i

export function normalizeWebsite(website: string): string {
  const trimmed = website.trim()
  if (!trimmed) return trimmed
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

export function validateListing(data: ListingFormData): string[] {
  const errors: string[] = []

  if (!data.name?.trim()) errors.push('Business name is required.')
  if (!data.listing_type?.trim()) errors.push('Listing type is required.')
  if (!data.city?.trim()) errors.push('City is required.')

  const hasPhone = !!data.phone?.trim()
  const hasWebsite = !!data.website?.trim()
  if (!hasPhone && !hasWebsite) {
    errors.push('Please provide at least a phone number or website.')
  }

  if (hasPhone && !PHONE_REGEX.test(data.phone!.trim())) {
    errors.push('Phone number doesn\'t look valid.')
  }

  if (hasWebsite) {
    const normalized = normalizeWebsite(data.website!)
    if (!DOMAIN_REGEX.test(normalized)) {
      errors.push('Website doesn\'t look like a valid URL.')
    }
  }

  return errors
}