
'use client'

import { Check, GitCompareArrows, Plus } from 'lucide-react'
import { useCompare, type CompareListing } from '@/components/CompareProvider'

type CompareButtonProps = {
  listing: CompareListing
  className?: string
}

export default function CompareButton({
  listing,
  className = '',
}: CompareButtonProps) {
  const { addListing, removeListing, isSelected, canAddMore, hydrated } =
    useCompare()

  const selected = isSelected(listing.id)

  function handleClick() {
    if (selected) {
      removeListing(listing.id)
      return
    }

    if (!canAddMore) {
      window.alert('You can compare up to four listings at a time.')
      return
    }

    addListing(listing)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hydrated}
      aria-pressed={selected}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2',
        'text-sm font-medium transition-colors',
        selected
          ? 'border-green-700 bg-green-50 text-green-800 hover:bg-green-100'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {selected ? (
        <>
          <Check size={16} aria-hidden="true" />
          Added to compare
        </>
      ) : (
        <>
          {canAddMore ? (
            <Plus size={16} aria-hidden="true" />
          ) : (
            <GitCompareArrows size={16} aria-hidden="true" />
          )}
          Compare
        </>
      )}
    </button>
  )
}
