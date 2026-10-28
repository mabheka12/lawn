
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import ComparisonTable from '@/components/ComparisonTable'
import type { CompareListing } from '@/components/CompareProvider'

export const revalidate = 0

type ComparePageProps = {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const { ids: rawIds } = await searchParams

  const ids = [
    ...new Set(
      (rawIds ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ].slice(0, 4)

  if (ids.length < 2) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">
          Compare lawn care businesses
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Choose at least two listings to compare ratings, contact details,
          service information, and other details that are available.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          Find lawn care businesses
        </Link>
      </main>
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select(
      'id,name,slug,city,state,country,address,rating,google_reviews_count,phone,website,primary_category,listing_type,is_claimed,open_hours',
    )
    .eq('status', 'approved')
    .in('id', ids)

  if (error) {
    console.error('Comparison listings query failed:', error.message)

    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900">
          We couldn’t load these listings
        </h1>
        <p className="mt-3 text-gray-600">
          Please try again. You can also return to the search results and
          select the businesses again.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
        >
          Back to search
        </Link>
      </main>
    )
  }

  const rows: CompareListing[] = (data ?? []).map((business) => ({
    id: business.id,
    name: business.name,
    slug: business.slug,
    city: business.city,
    state: business.state,
    country: business.country,
    address: business.address,
    rating:
      business.rating == null
        ? null
        : Number(business.rating),
    google_reviews_count: business.google_reviews_count,
    phone: business.phone,
    website: business.website,
    primary_category: business.primary_category,
    listing_type: business.listing_type,
    is_claimed: business.is_claimed,
    open_hours: business.open_hours,
  }))

  // Keep the businesses in the same order in which the user selected them.
  const orderedRows = ids
    .map((id) => rows.find((business) => String(business.id) === id))
    .filter((business): business is CompareListing => Boolean(business))

  if (orderedRows.length < 2) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900">
          Select at least two available listings
        </h1>
        <p className="mt-3 text-gray-600">
          One or more selected listings may no longer be available for public
          viewing. Return to search and choose at least two approved listings.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex rounded-lg bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
        >
          Back to search
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 pb-36 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/search"
          className="text-sm font-medium text-green-800 hover:underline"
        >
          ← Back to search
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Compare lawn care businesses
        </h1>
        <p className="mt-2 text-gray-600">
          Compare the details provided for each business. Missing information
          is shown as not listed rather than estimated.
        </p>
      </div>

      <ComparisonTable listings={orderedRows} />
    </main>
  )
}
