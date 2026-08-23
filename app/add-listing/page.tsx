'use client'

import {
  useState,
  useEffect,
  useRef,
} from 'react'

import Link from 'next/link'

import {
  Search,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Phone,
  Globe,
  FileText,
  ArrowRight,
  Info,
} from 'lucide-react'

import {
  validateListing,
  normalizeWebsite,
} from '@/lib/listing-validation'

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
  | {
      kind: 'business'
      data: BusinessResult
    }
  | {
      kind: 'pending'
      data: PendingResult
    }

const MOWING_CATEGORIES = [
  'Lawn Care',
  'Landscaping',
  'Garden Design',
  'Tree Services',
  'Hardscaping',
  'Turf Installation',
  'Gardener',
]

export default function SubmitPage() {
  const [mode, setMode] =
    useState<'search' | 'form'>('search')

  const [query, setQuery] =
    useState('')

  const [searching, setSearching] =
    useState(false)

  const [suggestions, setSuggestions] =
    useState<Suggestion[]>([])

  const [isOpen, setIsOpen] =
    useState(false)

  const [
    highlightedIndex,
    setHighlightedIndex,
  ] = useState(-1)

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    )

  const containerRef =
    useRef<HTMLDivElement>(null)

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

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [errors, setErrors] =
    useState<string[]>([])

  const [
    duplicateInfo,
    setDuplicateInfo,
  ] = useState<{
    message: string
    claimUrl?: string
  } | null>(null)

  // ---------------------------------------
  // SEARCH EXISTING LISTINGS
  // ---------------------------------------

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current =
      setTimeout(async () => {
        setSearching(true)

        try {
          const res = await fetch(
            `/api/listings/search?q=${encodeURIComponent(
              query.trim()
            )}`
          )

          const data = await res.json()

          const combined: Suggestion[] = [
            ...(data.businesses ?? []).map(
              (b: BusinessResult) => ({
                kind: 'business' as const,
                data: b,
              })
            ),

            ...(data.pending ?? []).map(
              (p: PendingResult) => ({
                kind: 'pending' as const,
                data: p,
              })
            ),
          ]

          setSuggestions(combined)
          setIsOpen(true)
          setHighlightedIndex(-1)
        } catch (error) {
          console.error(
            'Business search failed:',
            error
          )
        } finally {
          setSearching(false)
        }
      }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // ---------------------------------------
  // CLOSE SEARCH DROPDOWN
  // ---------------------------------------

  useEffect(() => {
    function handleClickOutside(
      e: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          e.target as Node
        )
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
  }, [])

  // ---------------------------------------
  // KEYBOARD SEARCH
  // ---------------------------------------

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      !isOpen ||
      suggestions.length === 0
    ) {
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()

      setHighlightedIndex(
        (prev) =>
          (prev + 1) %
          suggestions.length
      )
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()

      setHighlightedIndex(
        (prev) =>
          (prev -
            1 +
            suggestions.length) %
          suggestions.length
      )
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }

    if (
      e.key === 'Enter' &&
      highlightedIndex >= 0
    ) {
      e.preventDefault()

      const selected =
        suggestions[highlightedIndex]

      if (
        selected.kind ===
          'business' &&
        !selected.data.is_claimed
      ) {
        window.location.href =
          `/claim/${selected.data.id}`
      }
    }
  }

  // ---------------------------------------
  // FORM HELPERS
  // ---------------------------------------

  function proceedToForm() {
    setForm((current) => ({
      ...current,
      name: query.trim(),
    }))

    setIsOpen(false)
    setMode('form')
  }

  function updateField(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    const {
      name,
      value,
    } = e.target

    setForm((current) => {
      const updated = {
        ...current,
        [name]: value,
      }

      // Repair listings always belong to Repairs.
      if (
        name === 'listing_type' &&
        value === 'repairs'
      ) {
        updated.primary_category =
          'Repairs'
      }

      if (
        name === 'listing_type' &&
        value === 'mowing' &&
        current.primary_category ===
          'Repairs'
      ) {
        updated.primary_category = ''
      }

      return updated
    })
  }

  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------

  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setErrors([])
    setDuplicateInfo(null)
    setSuccess(false)

    const clientErrors =
      validateListing(form)

    if (clientErrors.length > 0) {
      setErrors(clientErrors)
      return
    }

    setLoading(true)

    const payload = {
      ...form,

      website: form.website
        ? normalizeWebsite(
            form.website
          )
        : '',
    }

    try {
      const res = await fetch(
        '/api/listings/submit',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(
            payload
          ),
        }
      )

      const data =
        await res.json()

      if (res.ok) {
        setSuccess(true)

        setForm({
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

        setQuery('')
      } else if (
        res.status === 409
      ) {
        setDuplicateInfo({
          message: data.error,
          claimUrl:
            data.claimUrl,
        })
      } else if (
        data.errors
      ) {
        setErrors(
          data.errors
        )
      } else {
        setErrors([
          data.error ||
            'Something went wrong. Please try again.',
        ])
      }
    } catch {
      setErrors([
        'We could not submit the listing. Please try again.',
      ])
    } finally {
      setLoading(false)
    }
  }

  // =======================================
  // SEARCH STEP
  // =======================================

  if (mode === 'search') {
    return (
      <div className="min-h-screen bg-gray-50">

        {/* HERO */}

        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-14">

          <div className="container mx-auto px-4 text-center">

            <Building2
              size={46}
              className="mx-auto mb-4"
            />

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Add a Business
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Suggest a lawn, garden,
              landscaping or lawn mower
              business for inclusion in the
              directory.
            </p>

          </div>

        </section>

        <main className="container mx-auto px-4 py-12">

          <div className="max-w-3xl mx-auto">

            <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">

              <div className="mb-7">

                <div className="text-sm font-semibold text-green-700 mb-2">
                  STEP 1 OF 2
                </div>

                <h2 className="text-2xl md:text-3xl font-bold">
                  Check for an existing listing
                </h2>

                <p className="text-gray-600 mt-2 leading-relaxed">
                  Search for the business first
                  to help avoid duplicate
                  listings.
                </p>

              </div>

              {/* SEARCH */}

              <div
                ref={containerRef}
                className="relative"
              >

                <label
                  htmlFor="business-search"
                  className="block font-semibold mb-2"
                >
                  Business name
                </label>

                <div className="relative">

                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />

                  <input
                    id="business-search"
                    type="text"
                    placeholder="Start typing a business name..."
                    value={query}
                    onChange={(e) =>
                      setQuery(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    onFocus={() =>
                      suggestions.length >
                        0 &&
                      setIsOpen(true)
                    }
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                    autoComplete="off"
                  />

                </div>

                {isOpen && (

                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">

                    {searching && (

                      <div className="p-4 text-sm text-gray-500">
                        Searching...
                      </div>

                    )}

                    {!searching &&
                      suggestions.length ===
                        0 && (

                        <div className="p-4 text-sm text-gray-600">
                          No matching listing
                          found for "{query}".
                        </div>

                      )}

                    {!searching &&
                      suggestions.map(
                        (s, i) => {

                          const isHighlighted =
                            i ===
                            highlightedIndex

                          if (
                            s.kind ===
                            'business'
                          ) {
                            return (
                              <div
                                key={`biz-${s.data.id}`}
                                onMouseEnter={() =>
                                  setHighlightedIndex(
                                    i
                                  )
                                }
                                className={`flex justify-between items-center gap-4 px-4 py-4 border-b last:border-b-0 ${
                                  isHighlighted
                                    ? 'bg-green-50'
                                    : ''
                                }`}
                              >

                                <div className="min-w-0">

                                  <p className="font-semibold truncate">
                                    {
                                      s
                                        .data
                                        .name
                                    }
                                  </p>

                                  <p className="text-sm text-gray-500 truncate mt-1">
                                    {[
                                      s
                                        .data
                                        .city,
                                      s
                                        .data
                                        .state,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ', '
                                      )}
                                  </p>

                                </div>

                                {s.data
                                  .is_claimed ? (

                                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">

                                    <CheckCircle
                                      size={
                                        13
                                      }
                                    />

                                    Claimed

                                  </span>

                                ) : (

                                  <Link
                                    href={`/claim/${s.data.id}`}
                                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg shrink-0 hover:bg-green-700"
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
                              onMouseEnter={() =>
                                setHighlightedIndex(
                                  i
                                )
                              }
                              className={`flex justify-between items-center gap-4 px-4 py-4 border-b last:border-b-0 ${
                                isHighlighted
                                  ? 'bg-yellow-100/60'
                                  : 'bg-yellow-50/50'
                              }`}
                            >

                              <div className="min-w-0">

                                <p className="font-semibold truncate">
                                  {
                                    s
                                      .data
                                      .name
                                  }
                                </p>

                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {[
                                    s
                                      .data
                                      .city,
                                    s
                                      .data
                                      .state,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      ', '
                                    )}
                                </p>

                              </div>

                              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">

                                <Clock
                                  size={13}
                                />

                                Pending

                              </span>

                            </div>
                          )
                        }
                      )}

                    {!searching && (

                      <button
                        type="button"
                        onClick={
                          proceedToForm
                        }
                        className="w-full text-left px-4 py-4 text-green-700 font-semibold hover:bg-green-50 border-t"
                      >
                        {suggestions.length >
                        0
                          ? `None of these — suggest "${query}" as a new business`
                          : `Continue with "${query}"`}
                      </button>

                    )}

                  </div>

                )}

              </div>

              <button
                type="button"
                onClick={proceedToForm}
                disabled={
                  query.trim().length ===
                  0
                }
                className="w-full mt-5 bg-green-600 text-white p-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                Continue

                <ArrowRight
                  size={18}
                />
              </button>

              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">

                <Info
                  size={18}
                  className="text-blue-600 mt-0.5 shrink-0"
                />

                <p className="text-sm text-gray-600 leading-relaxed">
                  If you find an existing
                  unclaimed listing for your
                  business, use the claim option
                  instead of creating another
                  listing.
                </p>

              </div>

            </div>

          </div>

        </main>

      </div>
    )
  }

  // =======================================
  // FORM STEP
  // =======================================

  return (
    <div className="min-h-screen bg-gray-50">

      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">

        <div className="container mx-auto px-4 text-center">

          <h1 className="text-4xl font-bold mb-3">
            Submit a Business Listing
          </h1>

          <p className="text-white/90 max-w-2xl mx-auto">
            Provide the available business
            information below.
          </p>

        </div>

      </section>

      <main className="container mx-auto px-4 py-12">

        <div className="max-w-3xl mx-auto">

          <button
            type="button"
            onClick={() =>
              setMode('search')
            }
            className="text-sm text-gray-600 hover:text-green-700 mb-5"
          >
            ← Back to business search
          </button>

          <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">

            <div className="mb-7">

              <div className="text-sm font-semibold text-green-700 mb-2">
                STEP 2 OF 2
              </div>

              <h2 className="text-2xl md:text-3xl font-bold">
                Business Information
              </h2>

              <p className="text-gray-600 mt-2">
                Enter information that can help
                visitors identify and contact the
                business.
              </p>

            </div>

            {/* SUCCESS */}

            {success && (

              <div className="mb-6 p-5 bg-green-50 border border-green-200 text-green-800 rounded-xl">

                <div className="flex items-start gap-3">

                  <CheckCircle
                    size={22}
                    className="mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="font-semibold">
                      Business submitted
                    </p>

                    <p className="text-sm mt-1">
                      The submission has been
                      received and is awaiting
                      review.
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* ERRORS */}

            {errors.length > 0 && (

              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">

                <p className="font-semibold mb-2">
                  Please check the following:
                </p>

                <ul className="list-disc pl-5 space-y-1">

                  {errors.map(
                    (err, i) => (
                      <li key={i}>
                        {err}
                      </li>
                    )
                  )}

                </ul>

              </div>

            )}

            {/* DUPLICATE */}

            {duplicateInfo && (

              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-sm">

                <p>
                  {
                    duplicateInfo.message
                  }
                </p>

                {duplicateInfo.claimUrl && (

                  <Link
                    href={
                      duplicateInfo.claimUrl
                    }
                    className="underline font-semibold mt-2 inline-block"
                  >
                    View the claim option →
                  </Link>

                )}

              </div>

            )}

            <form
              onSubmit={submit}
              className="space-y-7"
            >

              {/* BASIC INFORMATION */}

              <fieldset>

                <legend className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2
                    size={20}
                    className="text-green-600"
                  />
                  Business Details
                </legend>

                <div className="space-y-4">

                  <div>

                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Business Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.name
                      }
                      required
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Description
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      placeholder="Briefly describe the services offered by the business."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.description
                      }
                    />

                  </div>

                </div>

              </fieldset>

              {/* SERVICE */}

              <fieldset className="border-t pt-7">

                <legend className="text-lg font-bold mb-4">
                  Service
                </legend>

                <div className="grid sm:grid-cols-2 gap-4">

                  <div>

                    <label
                      htmlFor="listing_type"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Business Type *
                    </label>

                    <select
                      id="listing_type"
                      name="listing_type"
                      className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.listing_type
                      }
                    >
                      <option value="mowing">
                        Lawn & Garden Services
                      </option>

                      <option value="repairs">
                        Lawn Mower Repair
                      </option>
                    </select>

                  </div>

                  <div>

                    <label
                      htmlFor="primary_category"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Primary Category *
                    </label>

                    {form.listing_type ===
                    'repairs' ? (

                      <input
                        id="primary_category"
                        name="primary_category"
                        value="Repairs"
                        readOnly
                        className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                      />

                    ) : (

                      <select
                        id="primary_category"
                        name="primary_category"
                        value={
                          form.primary_category
                        }
                        onChange={
                          updateField
                        }
                        required
                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                      >

                        <option value="">
                          Select a category
                        </option>

                        {MOWING_CATEGORIES.map(
                          (
                            category
                          ) => (
                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {
                                category
                              }
                            </option>
                          )
                        )}

                      </select>

                    )}

                  </div>

                </div>

              </fieldset>

              {/* LOCATION */}

              <fieldset className="border-t pt-7">

                <legend className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin
                    size={20}
                    className="text-green-600"
                  />
                  Location
                </legend>

                <div className="space-y-4">

                  <div>

                    <label
                      htmlFor="address"
                      className="block text-sm font-medium mb-1.5"
                    >
                      Address
                    </label>

                    <input
                      id="address"
                      name="address"
                      placeholder="Street address"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.address
                      }
                    />

                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">

                    <div>

                      <label
                        htmlFor="city"
                        className="block text-sm font-medium mb-1.5"
                      >
                        City *
                      </label>

                      <input
                        id="city"
                        name="city"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        onChange={
                          updateField
                        }
                        value={
                          form.city
                        }
                        required
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="state"
                        className="block text-sm font-medium mb-1.5"
                      >
                        State / Region
                      </label>

                      <input
                        id="state"
                        name="state"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        onChange={
                          updateField
                        }
                        value={
                          form.state
                        }
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="country"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Country *
                      </label>

                      <select
                        id="country"
                        name="country"
                        value={
                          form.country
                        }
                        onChange={
                          updateField
                        }
                        required
                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="Australia">
                          Australia
                        </option>

                        <option value="United States">
                          United States
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

              </fieldset>

              {/* CONTACT */}

              <fieldset className="border-t pt-7">

                <legend className="text-lg font-bold mb-4">
                  Contact Information
                </legend>

                <div className="grid sm:grid-cols-2 gap-4">

                  <div>

                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-1.5 flex items-center gap-1"
                    >
                      <Phone size={14} />
                      Phone
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.phone
                      }
                    />

                  </div>

                  <div>

                    <label
                      htmlFor="website"
                      className="block text-sm font-medium mb-1.5 flex items-center gap-1"
                    >
                      <Globe size={14} />
                      Website
                    </label>

                    <input
                      id="website"
                      name="website"
                      type="text"
                      placeholder="example.com"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={
                        updateField
                      }
                      value={
                        form.website
                      }
                    />

                  </div>

                </div>

              </fieldset>

              {/* INFORMATION NOTICE */}

              <div className="flex items-start gap-3 bg-gray-50 border rounded-xl p-4">

                <FileText
                  size={18}
                  className="text-gray-500 mt-0.5 shrink-0"
                />

                <p className="text-sm text-gray-600 leading-relaxed">
                  Please submit information you
                  believe to be accurate. Submitted
                  listings may be reviewed before
                  appearing publicly in the
                  directory.
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading
                  ? 'Submitting...'
                  : 'Submit Business'}
              </button>

            </form>

          </div>

        </div>

      </main>

    </div>
  )
}