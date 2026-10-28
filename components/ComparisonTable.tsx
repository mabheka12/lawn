'use client'

import Link from 'next/link'
import {
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
} from 'lucide-react'
import type { CompareListing } from '@/components/CompareProvider'
import type { ReactNode } from 'react'

type ComparisonTableProps = {
  listings: CompareListing[]
}

type ComparisonRow = {
  label: string
  icon: ReactNode
  value: (listing: CompareListing) => ReactNode
}

function textValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Not listed'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    return value.trim() || 'Not listed'
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => textValue(item))
      .filter((item) => item !== 'Not listed')

    return items.length ? items.join(', ') : 'Not listed'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')

    if (!entries.length) return 'Not listed'

    return entries
      .map(([key, item]) => `${formatLabel(key)}: ${textValue(item)}`)
      .join(' · ')
  }

  return 'Not listed'
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function locationValue(listing: CompareListing): string {
  const parts = [
    listing.address,
    [listing.city, listing.state, listing.country]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean)

  return parts.join(' · ') || 'Not listed'
}

function websiteUrl(value: string): string | null {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    )

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function displayRating(listing: CompareListing): {
  rating: string
  reviews: string | null
} {
  const rating = listing.rating

  if (rating === null || rating === undefined || !Number.isFinite(Number(rating))) {
    return { rating: 'Not rated', reviews: null }
  }

  const reviewCount = Number(listing.google_reviews_count)

  return {
    rating: `${Number(rating).toFixed(1)} / 5`,
    reviews:
      listing.google_reviews_count !== null &&
      listing.google_reviews_count !== undefined &&
      listing.google_reviews_count.trim() !== '' &&
      Number.isFinite(reviewCount)
        ? `${reviewCount.toLocaleString()} ${
            reviewCount === 1 ? 'review' : 'reviews'
          }`
        : null,
  }
}

function displayHours(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <NotListed />
  }

  // Render JSON opening-hours objects as readable day/schedule rows.
  if (typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)

    if (!entries.length) return <NotListed />

    return (
      <dl className="space-y-1.5">
        {entries.map(([day, hours]) => (
          <div
            key={day}
            className="flex flex-wrap justify-between gap-x-3 gap-y-1"
          >
            <dt className="font-medium text-gray-700">
              {formatLabel(day)}
            </dt>
            <dd className="text-right text-gray-600">
              {textValue(hours)}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  // Arrays and strings are displayed without exposing raw object syntax.
  return <span>{textValue(value)}</span>
}

function NotListed() {
  return <span className="text-gray-400 italic">Not listed</span>
}

function ClaimedValue({ claimed }: { claimed: boolean | null | undefined }) {
  if (claimed === true) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
        <CheckCircle2 size={16} aria-hidden="true" />
        Claimed
      </span>
    )
  }

  if (claimed === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-600">
        <XCircle size={16} aria-hidden="true" />
        Not claimed
      </span>
    )
  }

  return <NotListed />
}

export default function ComparisonTable({
  listings,
}: ComparisonTableProps) {
  const rows: ComparisonRow[] = [
    {
      label: 'Location',
      icon: <MapPin size={17} aria-hidden="true" />,
      value: (listing) => (
        <span className="break-words">
          {locationValue(listing)}
        </span>
      ),
    },
    {
      label: 'Customer rating',
      icon: <Star size={17} aria-hidden="true" />,
      value: (listing) => {
        const result = displayRating(listing)

        return (
          <div>
            {listing.rating !== null &&
            listing.rating !== undefined &&
            Number.isFinite(Number(listing.rating)) ? (
              <div className="flex items-center gap-2">
                <Star
                  size={18}
                  className="shrink-0 fill-amber-400 text-amber-500"
                  aria-hidden="true"
                />
                <span className="font-bold text-gray-900">
                  {result.rating}
                </span>
              </div>
            ) : (
              <span className="text-gray-500">{result.rating}</span>
            )}

            {result.reviews && (
              <p className="mt-1 text-xs text-gray-500">
                {result.reviews}
              </p>
            )}
          </div>
        )
      },
    },
    {
      label: 'Service category',
      icon: <Tag size={17} aria-hidden="true" />,
      value: (listing) => {
        const category =
          listing.primary_category || listing.listing_type

        return category ? (
          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold capitalize text-green-800">
            {category.replace(/[_-]/g, ' ')}
          </span>
        ) : (
          <NotListed />
        )
      },
    },
    {
      label: 'Business hours',
      icon: <Clock size={17} aria-hidden="true" />,
      value: (listing) => displayHours(listing.open_hours),
    },
    {
      label: 'Claim status',
      icon: <CheckCircle2 size={17} aria-hidden="true" />,
      value: (listing) => (
        <ClaimedValue claimed={listing.is_claimed} />
      ),
    },
    {
      label: 'Phone',
      icon: <Phone size={17} aria-hidden="true" />,
      value: (listing) =>
        listing.phone ? (
          <a
            href={`tel:${listing.phone}`}
            className="inline-flex items-center gap-2 break-all font-semibold text-green-800 hover:underline"
          >
            <Phone size={15} className="shrink-0" aria-hidden="true" />
            {listing.phone}
          </a>
        ) : (
          <NotListed />
        ),
    },
    {
      label: 'Website',
      icon: <Globe size={17} aria-hidden="true" />,
      value: (listing) => {
        const url = listing.website
          ? websiteUrl(listing.website)
          : null

        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 font-semibold text-green-800 hover:underline"
          >
            Visit website
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ) : (
          <NotListed />
        )
      },
    },
    {
      label: 'Pricing',
      icon: <Tag size={17} aria-hidden="true" />,
      value: () => (
        <span className="text-gray-600">
          Contact the business for a quote
        </span>
      ),
    },
  ]

  return (
    <section aria-label="Business comparison" className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="min-w-[680px]">
          {/* Business headers */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `150px repeat(${listings.length}, minmax(0, 1fr))`,
            }}
          >
            <div className="border-b border-r border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-600">
                Compare details
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {listings.length} businesses
              </p>
            </div>

            {listings.map((listing) => (
              <div
                key={String(listing.id)}
                className="flex min-w-0 flex-col border-b border-gray-200 p-4"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg font-bold uppercase text-green-800">
                  {listing.name.trim().charAt(0) || '?'}
                </div>

                <Link
                  href={`/listings/${encodeURIComponent(listing.slug)}`}
                  className="break-words font-bold leading-5 text-gray-900 hover:text-green-800 hover:underline"
                >
                  {listing.name}
                </Link>

                <Link
                  href={`/listings/${encodeURIComponent(listing.slug)}`}
                  className="mt-3 text-sm font-semibold text-green-800 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            ))}

            {/* Comparison rows */}
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-start gap-2 border-b border-r border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
                  <span className="mt-0.5 shrink-0 text-gray-400">
                    {row.icon}
                  </span>
                  <span>{row.label}</span>
                </div>

                {listings.map((listing) => (
                  <div
                    key={`${String(listing.id)}-${row.label}`}
                    className="min-w-0 border-b border-gray-200 p-4 text-sm leading-6 text-gray-600"
                  >
                    {row.value(listing)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="px-1 text-sm leading-6 text-gray-500">
        Comparison is based on information listed in our directory. Opening
        hours may need confirmation. Contact each business directly to confirm
        services, availability and pricing. A missing detail does not necessarily
        mean the business does not offer that service.
      </p>
    </section>
  )
}