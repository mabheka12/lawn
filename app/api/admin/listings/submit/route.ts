import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { notifyAdminNewListing } from '@/lib/email'

const ALLOWED_LISTING_TYPES = [
  'mowing',
  'repairs',
] as const

const ALLOWED_MOWING_CATEGORIES = [
  'Lawn Care',
  'Landscaping',
  'Garden Design',
  'Tree Services',
  'Hardscaping',
  'Turf Installation',
  'Gardener',
] as const

const ALLOWED_COUNTRIES = [
  'Australia',
  'United States',
] as const

function cleanText(
  value: unknown,
  maxLength = 255
) {
  if (typeof value !== 'string') {
    return null
  }

  const cleaned = value.trim()

  if (!cleaned) {
    return null
  }

  return cleaned.slice(0, maxLength)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabase =
      await createClient()

    const name = cleanText(
      body.name,
      200
    )

    const address = cleanText(
      body.address,
      300
    )

    const phone = cleanText(
      body.phone,
      80
    )

    const website = cleanText(
      body.website,
      500
    )

    const city = cleanText(
      body.city,
      150
    )

    const state = cleanText(
      body.state,
      150
    )

    const country = cleanText(
      body.country,
      100
    )

    const description = cleanText(
      body.description,
      3000
    )

    const listingType =
      cleanText(
        body.listing_type,
        50
      )

    let primaryCategory =
      cleanText(
        body.primary_category,
        100
      )

    // ---------------------------------
    // REQUIRED FIELDS
    // ---------------------------------

    if (
      !name ||
      !city ||
      !country ||
      !listingType
    ) {
      return NextResponse.json(
        {
          error:
            'Business name, city, country and business type are required.',
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------
    // LISTING TYPE VALIDATION
    // ---------------------------------

    if (
      !ALLOWED_LISTING_TYPES.includes(
        listingType as
          (typeof ALLOWED_LISTING_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid business type.',
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------
    // COUNTRY VALIDATION
    // ---------------------------------

    if (
      !ALLOWED_COUNTRIES.includes(
        country as
          (typeof ALLOWED_COUNTRIES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid country.',
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------
    // CATEGORY VALIDATION
    // ---------------------------------

    if (
      listingType === 'repairs'
    ) {
      // Don't trust the client.
      // Repair listings always use this.
      primaryCategory = 'Repairs'
    } else {
      if (
        !primaryCategory ||
        !ALLOWED_MOWING_CATEGORIES.includes(
          primaryCategory as
            (typeof ALLOWED_MOWING_CATEGORIES)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              'Please select a valid primary category.',
          },
          {
            status: 400,
          }
        )
      }
    }

    // ---------------------------------
    // SIMPLE DUPLICATE CHECK
    // ---------------------------------

    let duplicateQuery =
      supabase
        .from('businesses')
        .select(
          'id, name, slug, city, state, is_claimed'
        )
        .ilike('name', name)
        .ilike('city', city)
        .eq(
          'status',
          'approved'
        )
        .limit(1)

    if (state) {
      duplicateQuery =
        duplicateQuery.ilike(
          'state',
          state
        )
    }

    const {
      data: existing,
    } = await duplicateQuery.maybeSingle()

    if (existing) {
      return NextResponse.json(
        {
          error:
            'A matching business listing already exists.',
          claimUrl:
            existing.is_claimed
              ? undefined
              : `/claim/${existing.id}`,
        },
        {
          status: 409,
        }
      )
    }

    // Also check pending submissions.
    let pendingQuery =
      supabase
        .from(
          'pending_listings'
        )
        .select('id, name')
        .ilike('name', name)
        .ilike('city', city)
        .eq(
          'status',
          'pending'
        )
        .limit(1)

    if (state) {
      pendingQuery =
        pendingQuery.ilike(
          'state',
          state
        )
    }

    const {
      data: existingPending,
    } =
      await pendingQuery.maybeSingle()

    if (existingPending) {
      return NextResponse.json(
        {
          error:
            'A matching business has already been submitted and is awaiting review.',
        },
        {
          status: 409,
        }
      )
    }

    // ---------------------------------
    // INSERT
    // ---------------------------------

    const {
      data,
      error,
    } = await supabase
      .from(
        'pending_listings'
      )
      .insert([
        {
          name,
          address,
          phone,
          website,

          // User-submitted ratings should
          // not be accepted.
          rating: null,

          // Keep legacy field empty unless
          // you deliberately still need it.
          category: null,

          city,
          state,
          country,
          description,

          listing_type:
            listingType,

          primary_category:
            primaryCategory,

          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(
        'Listing submission error:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Could not save the business submission.',
        },
        {
          status: 500,
        }
      )
    }

    // ---------------------------------
    // ADMIN EMAIL
    // ---------------------------------

    try {
      await notifyAdminNewListing({
        name: data.name,
        city: data.city,
        listing_type:
          data.listing_type,
      })
    } catch (emailError) {
      // Don't fail a valid submission
      // because an email notification fails.
      console.error(
        'Admin notification failed:',
        emailError
      )
    }

    return NextResponse.json(
      {
        success: true,
        listing: data,
      },
      {
        status: 201,
      }
    )
  } catch (err) {
    console.error(
      'Submission route error:',
      err
    )

    return NextResponse.json(
      {
        error: 'Server error',
      },
      {
        status: 500,
      }
    )
  }
}