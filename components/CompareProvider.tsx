
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type CompareListing = {
  id: number
  name: string
  slug: string
  city?: string | null
  state?: string | null
  country?: string | null
  address?: string | null
  rating?: number | null
  google_reviews_count?: string | null
  phone?: string | null
  website?: string | null
  primary_category?: string | null
  listing_type?: string | null
  is_claimed?: boolean | null
  open_hours?: unknown
}

type CompareContextValue = {
  listings: CompareListing[]
  hydrated: boolean
  addListing: (listing: CompareListing) => void
  removeListing: (id: string | number) => void
  clearListings: () => void
  isSelected: (id: string | number) => boolean
  canAddMore: boolean
}

const STORAGE_KEY = 'lawnmowingnearme-compare'
const MAX_COMPARE = 4

const CompareContext = createContext<CompareContextValue | undefined>(
  undefined,
)

function normalizeId(id: string | number): string {
  return String(id)
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<CompareListing[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed: unknown = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is CompareListing =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
              'name' in item &&
              'slug' in item &&
              typeof item.name === 'string' &&
              typeof item.slug === 'string',
          )

          setListings(valid.slice(0, MAX_COMPARE))
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
    } catch {
      // Comparison still works for this session if storage is unavailable.
    }
  }, [listings, hydrated])

  const addListing = useCallback((listing: CompareListing) => {
    setListings((current) => {
      if (
        current.some(
          (item) => normalizeId(item.id) === normalizeId(listing.id),
        )
      ) {
        return current
      }

      if (current.length >= MAX_COMPARE) return current

      return [...current, listing]
    })
  }, [])

  const removeListing = useCallback((id: string | number) => {
    setListings((current) =>
      current.filter((item) => normalizeId(item.id) !== normalizeId(id)),
    )
  }, [])

  const clearListings = useCallback(() => {
    setListings([])
  }, [])

  const isSelected = useCallback(
    (id: string | number) =>
      listings.some((item) => normalizeId(item.id) === normalizeId(id)),
    [listings],
  )

  const value = useMemo(
    () => ({
      listings,
      hydrated,
      addListing,
      removeListing,
      clearListings,
      isSelected,
      canAddMore: listings.length < MAX_COMPARE,
    }),
    [
      listings,
      hydrated,
      addListing,
      removeListing,
      clearListings,
      isSelected,
    ],
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)

  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }

  return context
}
