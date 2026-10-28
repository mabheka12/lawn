
'use client'

import Link from 'next/link'
import { GitCompareArrows, X } from 'lucide-react'
import { useCompare } from '@/components/CompareProvider'

export default function CompareTray() {
  const { listings, removeListing, clearListings, hydrated } = useCompare()

  if (!hydrated || listings.length === 0) return null

  const compareUrl = `/compare?ids=${listings
    .map((listing) => encodeURIComponent(String(listing.id)))
    .join(',')}`

  return (
    <aside
      aria-label="Selected listings for comparison"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">
            Compare listings ({listings.length}/4)
          </p>

          <div className="mt-1 flex flex-wrap gap-2">
            {listings.map((listing) => (
              <span
                key={String(listing.id)}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-sm text-gray-700"
              >
                <span className="max-w-44 truncate">{listing.name}</span>
                <button
                  type="button"
                  onClick={() => removeListing(listing.id)}
                  aria-label={`Remove ${listing.name} from comparison`}
                  className="rounded-full p-1 hover:bg-gray-200"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearListings}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Clear
          </button>

          <Link
            href={compareUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
          >
            <GitCompareArrows size={16} aria-hidden="true" />
            Compare now
          </Link>
        </div>
      </div>
    </aside>
  )
}
