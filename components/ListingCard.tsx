'use client'

import Link from 'next/link'
import {
  Star,
  MapPin,
  Phone,
  Globe,
} from 'lucide-react'
import {
  trackPhoneClick,
  trackWebsiteClick,
  trackFeaturedListingClick,
} from '@/lib/analytics'
import CompareButton from '@/components/CompareButton'

interface Business {
  id: number
  name: string
  slug: string
  address?: string | null
  phone?: string | null
  website?: string | null
  rating?: number | null
  google_reviews_count?: string | null
  category?: string | null
  primary_category?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  open_hours?: string | null
  description?: string | null
  listing_type?: 'repairs' | 'mowing' | null
  is_verified?: boolean | null
  is_claimed?: boolean | null
  is_open_now?: boolean | null
  distance_miles?: number | null
  tags?: string[] | null
  featured_until?: string | null
}

interface ListingCardProps {
  business: Business
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
}

function getListingLabel(
  type?: 'repairs' | 'mowing' | null
) {
  switch (type) {
    case 'repairs':
      return 'Repair Shop'
    case 'mowing':
      return 'Lawn Care'
    default:
      return 'Service'
  }
}

function isCurrentlyFeatured(
  featuredUntil?: string | null
) {
  return (
    !!featuredUntil &&
    new Date(featuredUntil) >
      new Date()
  )
}



function FeaturedBadge({
  className = '',
}: {
  className?: string
}) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 ${className}`}
    >
      ★ Featured
    </span>
  )
}

function BusinessSchema({
  business,
}: {
  business: Business
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context':
            'https://schema.org',

          '@type':
            'LocalBusiness',
          name:
            business.name,
          address: {
            '@type':
              'PostalAddress',
            streetAddress:
              business.address ||
              undefined,
            addressLocality:
              business.city ||
              undefined,
            addressRegion:
              business.state ||
              undefined,
          },
          telephone:
            business.phone ||
            undefined,
          url:
            business.website ||
            undefined,
        }),
      }}
    />
  )
}

export default function ListingCard({
  business,
  variant = 'default',
  showActions = true,
}: ListingCardProps) {
  const ratingValue =
    business.rating &&
    business.rating > 0
      ? business.rating
      : null

  const fullStars =
    ratingValue
      ? Math.floor(
          ratingValue
        )
      : 0

  const hasHalfStar =
    ratingValue
      ? ratingValue % 1 >= 0.5
      : false

  const featured =
    isCurrentlyFeatured(
      business.featured_until
    )

    const compareListing = {
    id: business.id,
    name: business.name,
    slug: business.slug,
    city: business.city,
    state: business.state,
    country: business.country,
    address: business.address,
    rating: business.rating,
    google_reviews_count: business.google_reviews_count,
    phone: business.phone,
    website: business.website,
    primary_category: business.primary_category,
    listing_type: business.listing_type,
    is_verified: business.is_verified,
    is_claimed: business.is_claimed,
    is_open_now: business.is_open_now,
    distance_miles: business.distance_miles,
    open_hours: business.open_hours,
    tags: business.tags,
  }

  const serviceLabel =
    business.primary_category ||
    business.listing_type ||
    'unknown'

  function analyticsProperties() {
    return {
      business_id:
        business.id,
      business_slug:
        business.slug,
      city:
        business.city,
      state:
        business.state,
      service:
        serviceLabel,
      source_page:
        window.location.pathname,
    }
  }

  function handleListingClick() {
    if (!featured) {
      return
    }
    trackFeaturedListingClick(
      analyticsProperties()
    )
  }

  function handlePhoneClick() {
    trackPhoneClick(
      analyticsProperties()
    )
  }

  function handleWebsiteClick() {
    trackWebsiteClick(
      analyticsProperties()
    )
  }
  // ==========================================
  // COMPACT VARIANT
  // ==========================================

  if (variant === 'compact') {
    return (
      <>
        <Link
          href={`/listings/${business.slug}`}
          onClick={
            handleListingClick
          }
          className="block"
        >
          <div className="bg-white rounded-lg p-4 hover:shadow-md transition cursor-pointer border border-gray-100">
            <div className="flex justify-between items-start gap-4">
              <div className="px-6 pt-4 flex justify-end">
                  <CompareButton listing={compareListing} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                      business.listing_type ===
                      'repairs'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {getListingLabel(
                      business.listing_type
                    )}
                  </span>
                  {featured && (
                    <FeaturedBadge />
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-800 hover:text-green-600">
                  {business.name}
                </h3>
                {business.city && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin
                      size={14}
                    />
                    <span>
                      {business.city}
                      {business.state &&
                        `, ${business.state}`}
                    </span>
                    {typeof business.distance_miles ===
                      'number' && (
                      <span className="text-gray-400">
                        ·{' '}
                        {business.distance_miles.toFixed(
                          1
                        )}{' '}
                        mi
                      </span>
                    )}
                  </div>
                )}
              </div>
              {ratingValue !==
                null && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded flex-shrink-0">
                  <Star
                    size={14}
                    className="text-yellow-500 fill-current"
                  />
                  <span className="font-medium text-sm">
                    {ratingValue.toFixed(
                      1
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>

        <BusinessSchema
          business={business}
        />
      </>
    )
  }
  // ==========================================
  // FEATURED VARIANT
  // ==========================================
  if (variant === 'featured') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md overflow-hidden border border-green-100">
        <div className="p-6">
          <div className="mb-3 flex justify-end">
            <CompareButton listing={compareListing} />
          </div>
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
                {business.primary_category && (
                  <span className="text-xs text-gray-500">
                    {
                      business.primary_category
                    }
                  </span>
                )}
                {business.is_verified && (
                  <span
                    title="Verified business"
                    className="text-blue-500 text-sm"
                  >
                    ✓ Verified
                  </span>
                )}
              </div>
              <Link
                href={`/listings/${business.slug}`}
                onClick={
                  handleListingClick
                }
              >
                <h2 className="text-2xl font-bold text-gray-800 hover:text-green-600 transition">
                  {
                    business.name
                  }
                </h2>
              </Link>
            </div>
            {ratingValue !==
              null && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex">
                  {[...Array(5)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i <
                          fullStars
                            ? 'text-yellow-500 fill-current'
                            : i ===
                                fullStars &&
                              hasHalfStar
                            ? 'text-yellow-500 fill-current opacity-50'
                            : 'text-gray-300'
                        }
                      />
                    )
                  )}
                </div>
                <span className="font-bold text-lg">
                  {ratingValue.toFixed(
                    1
                  )}
                </span>
                {business.google_reviews_count && (
                  <span className="text-gray-400 text-sm">
                    (
                    {
                      business.google_reviews_count
                    }
                    )
                  </span>
                )}
              </div>
            )}
          </div>
          {business.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {
                business.description
              }
            </p>
          )}
          {business.tags &&
            business.tags.length >
              0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {business.tags
                .slice(0, 4)
                .map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white text-green-700 px-2 py-1 rounded-full border border-green-200"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
            {business.city && (
              <div className="flex items-center gap-1">
                <MapPin
                  size={16}
                />
                <span>
                  {business.city}
                  {business.state &&
                    `, ${business.state}`}
                </span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone
                  size={16}
                />
                <span>
                  {
                    business.phone
                  }
                </span>
              </div>
            )}
            {business.is_open_now !==
              null &&
              business.is_open_now !==
                undefined && (
                <span
                  className={
                    business.is_open_now
                      ? 'text-green-600 font-medium'
                      : 'text-gray-500'
                  }
                >
                  {business.is_open_now
                    ? 'Open now'
                    : 'Closed now'}
                </span>
              )}
          </div>
          {showActions && (
            <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/listings/${business.slug}`}
                onClick={
                  handleListingClick
                }
                className="text-green-700 font-medium hover:text-green-800"
              >
                View Details →
              </Link>

              <div className="flex flex-wrap gap-2">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    onClick={
                      handlePhoneClick
                    }
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    <Phone
                      size={15}
                    />
                    Call
                  </a>
                )}
                {business.website && (
                  <a
                    href={
                      business.website
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={
                      handleWebsiteClick
                    }
                    className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <Globe
                      size={15}
                    />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        <BusinessSchema
          business={business}
        />
      </div>
    )
  }

  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
</div>
  // ==========================================
  // DEFAULT VARIANT
  // ==========================================
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="mb-3 flex justify-end">
          <CompareButton listing={compareListing} />
        </div>
      <Link
        href={`/listings/${business.slug}`}
        onClick={
          handleListingClick
        }
        className="block p-6"
      >
        <div className="flex justify-between items-start mb-3 gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold flex-shrink-0">
              {business.name
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition">
                  {
                    business.name
                  }
                </h2>
                {business.is_verified && (
                  <span
                    title="Verified business"
                    className="text-blue-500 text-sm"
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {business.primary_category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">                    {
                      business.primary_category
                    }
                  </span>
                )}
                {featured && (
                  <FeaturedBadge />
                )}
              </div>
            </div>
            
          </div>
          {ratingValue !== null ? (
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-1">
                <Star
                  className="text-yellow-500 fill-current"
                  size={18}
                />
                <span className="font-semibold">
                  {ratingValue.toFixed(
                    1
                  )}
                </span>
              </div>
              {business.google_reviews_count && (
                <span className="text-gray-400 text-xs">
                  {
                    business.google_reviews_count
                  }{' '}
                  review
                  {business.google_reviews_count ===
                  '1'
                    ? ''
                    : 's'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-xs flex-shrink-0">
              No ratings yet
            </span>
          )}
        </div>
        {business.address && (
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin
              size={16}
              className="shrink-0"
            />
            <span className="text-sm">
              {business.address}
              {business.city &&
                `, ${business.city}`}
              {business.state &&
                `, ${business.state}`}
            </span>
            {typeof business.distance_miles ===
              'number' && (
              <span className="text-xs text-gray-400">
                ·{' '}
                {business.distance_miles.toFixed(
                  1
                )}{' '}
                mi
              </span>
            )}
          </div>
        )}
        {business.is_open_now !==
          null &&
          business.is_open_now !==
            undefined && (
          <div
            className={`text-xs font-medium mb-2 ${
              business.is_open_now
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {business.is_open_now
              ? 'Open now'
              : 'Closed now'}
          </div>
        )}
        {business.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {
              business.description
            }
          </p>
        )}
        {business.tags &&
          business.tags.length >
            0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {business.tags
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </Link>
      {showActions && (
        <div className="border-t border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/listings/${business.slug}`}
            onClick={
              handleListingClick
            }
            className="text-green-700 font-medium text-sm hover:text-green-800"
          >
            View Details →
          </Link>
          <div className="flex flex-wrap gap-2">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                onClick={
                  handlePhoneClick
                }
                className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                <Phone
                  size={15}
                />
                Call
              </a>
            )}
            {business.website && (
              <a
                href={
                  business.website
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={
                  handleWebsiteClick
                }
                className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                <Globe
                  size={15}
                />
                Website
              </a>
            )}
          </div>
        </div>
      )}
      <BusinessSchema
        business={business}
      />
    </div>
  )
}