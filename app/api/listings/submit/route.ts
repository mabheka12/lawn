
// app/api/listings/submit/route.ts

import { NextResponse } from 'next/server'

import { createAdminClient } from '@/utils/supabase/admin'
import {
  validateListing,
  normalizeWebsite,
} from '@/lib/listing-validation'
import { notifyAdminNewListing } from '@/lib/email'

export const runtime = 'nodejs'

const ALLOWED_LISTING_TYPES = ['mowing', 'repairs'] as const

const ALLOWED_MOWING_CATEGORIES = [
  'Lawn Care',
  'Landscaping',
  'Garden Design',
  'Tree Services',
  'Hardscaping',
  'Turf Installation',
  'Gardener',
]

const ALLOWED_COUNTRIES = [
  'Australia',
  'United States',
]

function cleanString(
  value: unknown,
  maxLength = 70000
): string {
  if (typeof value !== 'string') return ''

  return value.trim().slice(0, maxLength)
}

export async function POST(request: Request) {
  try {
    // 1. Parse the submitted JSON.
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request.' },
        { status: 400 }
      )
    }

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: 'Invalid submission data.' },
        { status: 400 }
      )
    }

    const input = body as Record<string, unknown>

    // 2. Normalize incoming fields and ignore
    // client-supplied status or other database fields.
    const listingType = cleanString(
      input.listing_type,
      30
    )

    const form = {
      name: cleanString(input.name, 200),
      address: cleanString(input.address, 500),
      phone: cleanString(input.phone, 60),
      website: cleanString(input.website, 500),
      rating: '',
      category: '',
      city: cleanString(input.city, 150),
      state: cleanString(input.state, 150),
      country: cleanString(input.country, 100),
      description: cleanString(input.description, 25000),
      listing_type: listingType,
      primary_category: cleanString(
        input.primary_category,
        100
      ),
    }

    // Enforce minimum description length after sanitization.
const wordCount = form.description
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .length

if (wordCount < 500) {
  return NextResponse.json(
    {
      error: 'Business description must contain at least 500 words.',
      errors: [
        `Description requires at least 500 words. Received ${wordCount}.`,
      ],
    },
    { status: 400 }
  )
}

    // 3. Validate required fields using your existing helper.
    const errors = validateListing(form)

    if (errors.length > 0) {
      return NextResponse.json(
        { errors },
        { status: 400 }
      )
    }

    if (
      !ALLOWED_LISTING_TYPES.includes(
        listingType as (typeof ALLOWED_LISTING_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        { errors: ['Please select a valid business type.'] },
        { status: 400 }
      )
    }

    if (!ALLOWED_COUNTRIES.includes(form.country)) {
      return NextResponse.json(
        { errors: ['Please select a supported country.'] },
        { status: 400 }
      )
    }

    if (
      listingType === 'mowing' &&
      !ALLOWED_MOWING_CATEGORIES.includes(
        form.primary_category
      )
    ) {
      return NextResponse.json(
        { errors: ['Please select a valid lawn and garden category.'] },
        { status: 400 }
      )
    }

    // Repair listings must always use the Repairs category.
    const primaryCategory =
      listingType === 'repairs'
        ? 'Repairs'
        : form.primary_category

    let website = ''

    if (form.website) {
      try {
        website = normalizeWebsite(form.website)
      } catch {
        return NextResponse.json(
          { errors: ['Please enter a valid website URL.'] },
          { status: 400 }
        )
      }
    }

    // 4. Use the server-side service-role client.
    const supabase = createAdminClient()

    // 5. Check approved/existing business listings.
    let existingQuery = supabase
      .from('businesses')
      .select('id, name, city, state, is_claimed')
      .ilike('name', form.name)
      .ilike('city', form.city)
      .eq('status', 'approved')
      .limit(1)

    if (form.state) {
      existingQuery = existingQuery.ilike(
        'state',
        form.state
      )
    }

    const {
      data: existingBusinesses,
      error: existingError,
    } = await existingQuery

    if (existingError) {
      console.error(
        'Existing business duplicate check failed:',
        existingError
      )

      return NextResponse.json(
        { error: 'Could not verify existing listings. Please try again.' },
        { status: 500 }
      )
    }

    if (existingBusinesses?.length) {
      const existing = existingBusinesses[0]

      return NextResponse.json(
        {
          error:
            'A matching business listing already exists. Please use the existing listing instead of submitting a duplicate.',
          claimUrl: existing.is_claimed
            ? undefined
            : `/claim/${existing.id}`,
        },
        { status: 409 }
      )
    }

    // 6. Check whether the same business is already awaiting review.
    let pendingQuery = supabase
      .from('pending_listings')
      .select('id, name, city, state')
      .ilike('name', form.name)
      .ilike('city', form.city)
      .eq('status', 'pending')
      .limit(1)

    if (form.state) {
      pendingQuery = pendingQuery.ilike(
        'state',
        form.state
      )
    }

    const {
      data: pendingListings,
      error: pendingError,
    } = await pendingQuery

    if (pendingError) {
      console.error(
        'Pending listing duplicate check failed:',
        pendingError
      )

      return NextResponse.json(
        { error: 'Could not verify pending submissions. Please try again.' },
        { status: 500 }
      )
    }

    if (pendingListings?.length) {
      return NextResponse.json(
        {
          error:
            'A matching business has already been submitted and is awaiting review.',
        },
        { status: 409 }
      )
    }

    // 7. Insert a pending suggestion.
    // Rating and category are deliberately not accepted
    // from the public form as verified facts.
    const { data: listing, error: insertError } =
      await supabase
        .from('pending_listings')
        .insert({
          name: form.name,
          address: form.address || null,
          phone: form.phone || null,
          website: website || null,
          rating: null,
          category: null,
          city: form.city,
          state: form.state || null,
          country: form.country,
          description: form.description || null,
          listing_type: listingType,
          primary_category: primaryCategory,
          status: 'pending',
        })
        .select()
        .single()

    if (insertError) {
      console.error(
        'Pending listing insertion failed:',
        insertError
      )

      return NextResponse.json(
        { error: 'Could not save the listing. Please try again.' },
        { status: 500 }
      )
    }

    // 8. Notify the admin. An email failure should not
    // undo a successfully saved listing.
    try {
      await notifyAdminNewListing({
        name: listing.name,
        city: listing.city,
        listing_type: listing.listing_type,
      })
    } catch (notificationError) {
      console.error(
        'New listing notification failed:',
        notificationError
      )
    }

    // 9. Return the response expected by the form.
    return NextResponse.json(
      {
        success: true,
        listing,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      'Listing submission API failed:',
      error
    )

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
