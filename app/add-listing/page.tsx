'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, CheckCircle, Clock } from 'lucide-react'
import { validateListing, normalizeWebsite } from '@/lib/listing-validation'

interface BusinessResult {
  id: number
  name: string
  slug: string
  city: string | null
  state: string | null
  is_claimed: boolean
}

interface PendingResult {
  id: number
  name: string
  city: string | null
  state: string | null
}

type Suggestion =
  | { kind: 'business'; data: BusinessResult }
  | { kind: 'pending'; data: PendingResult }

export default function SubmitPage() {
  const [mode, setMode] = useState<'search' | 'form'>('search')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    rating: '',
    category: '',
    city: '',
    state: '',
    country: '',
    description: '',
    listing_type: 'mowing',
    primary_category: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [duplicateInfo, setDuplicateInfo] = useState<{ message: string; claimUrl?: string } | null>(null)

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/listings/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()

      const combined: Suggestion[] = [
        ...(data.businesses ?? []).map((b: BusinessResult) => ({ kind: 'business' as const, data: b })),
        ...(data.pending ?? []).map((p: PendingResult) => ({ kind: 'pending' as const, data: p })),
      ]

      setSuggestions(combined)
      setIsOpen(true)
      setHighlightedIndex(-1)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      const selected = suggestions[highlightedIndex]
      if (selected.kind === 'business' && !selected.data.is_claimed) {
        window.location.href = `/claim/${selected.data.id}`
      }
    }
  }

  function proceedToForm() {
    setForm({ ...form, name: query.trim() })
    setIsOpen(false)
    setMode('form')
  }

  function updateField(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: any) {
    e.preventDefault()
    setErrors([])
    setDuplicateInfo(null)

    const clientErrors = validateListing(form)
    if (clientErrors.length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)

    const payload = {
      ...form,
      website: form.website ? normalizeWebsite(form.website) : '',
    }

    const res = await fetch('/api/listings/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setForm({
        name: '', address: '', phone: '', website: '', rating: '',
        category: '', city: '', state: '', country: '', description: '',
        listing_type: 'mowing', primary_category: '',
      })
    } else if (res.status === 409) {
      setDuplicateInfo({ message: data.error, claimUrl: data.claimUrl })
    } else if (data.errors) {
      setErrors(data.errors)
    } else {
      setErrors([data.error || 'Something went wrong'])
    }
  }

  // ---------------- SEARCH STEP ----------------
  if (mode === 'search') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Add a Business Listing</h1>
        <p className="text-gray-500 mb-6">
          First, let's check if your business is already listed.
        </p>

        <div ref={containerRef} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input
            type="text"
            placeholder="Search by business name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
            autoComplete="off"
          />

          {isOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searching && (
                <div className="p-4 text-sm text-gray-400">Searching...</div>
              )}

              {!searching && suggestions.length === 0 && (
                <div className="p-4 text-sm text-gray-500">
                  No matches for "{query}" — your business may not be listed yet.
                </div>
              )}

              {!searching && suggestions.map((s, i) => {
                const isHighlighted = i === highlightedIndex

                if (s.kind === 'business') {
                  return (
                    <div
                      key={`biz-${s.data.id}`}
                      onMouseEnter={() => setHighlightedIndex(i)}
                      className={`flex justify-between items-center gap-3 px-4 py-3 border-b last:border-b-0 ${
                        isHighlighted ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.data.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {[s.data.city, s.data.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      {s.data.is_claimed ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1 shrink-0">
                          <CheckCircle size={12} /> Claimed
                        </span>
                      ) : (
                        <Link
                          href={`/claim/${s.data.id}`}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded shrink-0"
                        >
                          Claim
                        </Link>
                      )}
                    </div>
                  )
                }

                return (
                  <div
                    key={`pending-${s.data.id}`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`flex justify-between items-center gap-3 px-4 py-3 border-b last:border-b-0 bg-yellow-50/50 ${
                      isHighlighted ? 'bg-yellow-100/60' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.data.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {[s.data.city, s.data.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1 shrink-0">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                )
              })}

              {!searching && (
                <button
                  type="button"
                  onClick={proceedToForm}
                  className="w-full text-left px-4 py-3 text-green-600 font-medium hover:bg-green-50 border-t"
                >
                  {suggestions.length > 0
                    ? `None of these — add "${query}" as a new business`
                    : `Continue — add "${query}" as a new business`}
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={proceedToForm}
          disabled={query.trim().length === 0}
          className="w-full border border-green-600 text-green-600 p-3 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-50 transition"
        >
          Continue — add my business
        </button>
      </div>
    )
  }

  // ---------------- FORM STEP ----------------
  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => setMode('search')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back to search
      </button>

      <h1 className="text-3xl font-bold mb-6">
        Submit a Business Listing
      </h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Listing submitted for review ✔
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {duplicateInfo && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
          <p>{duplicateInfo.message}</p>
          {duplicateInfo.claimUrl && (
            <Link href={duplicateInfo.claimUrl} className="underline font-medium mt-1 inline-block">
              Claim this listing instead →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">

        <input
          name="name"
          placeholder="Business Name"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.name}
          required
        />

        <input
          name="address"
          placeholder="Address"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.address}
        />

        <input
          name="phone"
          placeholder="Phone"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.phone}
        />

        <input
          name="website"
          placeholder="Website"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.website}
        />

        <input
          name="city"
          placeholder="City"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.city}
          required
        />

        <input
          name="state"
          placeholder="State"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.state}
        />

        <input
          name="country"
          placeholder="Country"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.country}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.description}
        />

        <select
          name="listing_type"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.listing_type}
        >
          <option value="mowing">Lawn Care</option>
          <option value="repairs">Repairs</option>
        </select>

        <input
          name="primary_category"
          placeholder="Primary Category"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.primary_category}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  )
}