import { NextResponse } from 'next/server'

import { canEditBusiness } from '@/lib/can-edit-business'
import { notifyAdminNewFeatureRequest } from '@/lib/email'

const FEATURE_PRICE_CENTS = 4900
const FEATURE_DAYS = 30
const MAX_MESSAGE_LENGTH = 1000

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const { id } = await params

    const businessId =
      Number(id)

    if (
      !Number.isInteger(businessId) ||
      businessId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid business ID',
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------------
    // AUTH / OWNERSHIP
    // ---------------------------------------

    const {
      allowed,
      user,
      supabase,
    } =
      await canEditBusiness(
        businessId
      )

    if (
      !allowed ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            'Not authorized for this listing',
        },
        {
          status: 403,
        }
      )
    }

    // ---------------------------------------
    // BUSINESS
    // ---------------------------------------

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        featured_until
      `)
      .eq(
        'id',
        businessId
      )
      .eq(
        'status',
        'approved'
      )
      .maybeSingle()

    if (
      businessError
    ) {
      console.error(
        'Feature request business lookup error:',
        businessError
      )

      return NextResponse.json(
        {
          error:
            'Could not load the business',
        },
        {
          status: 500,
        }
      )
    }

    if (!business) {
      return NextResponse.json(
        {
          error:
            'Business not found',
        },
        {
          status: 404,
        }
      )
    }

    // ---------------------------------------
    // ALREADY FEATURED
    // ---------------------------------------

    const isCurrentlyFeatured =
      !!business.featured_until &&
      new Date(
        business.featured_until
      ) >
        new Date()

    if (
      isCurrentlyFeatured
    ) {
      return NextResponse.json(
        {
          error:
            'This listing is already featured',
        },
        {
          status: 409,
        }
      )
    }

    // ---------------------------------------
    // EXISTING PENDING REQUEST
    // ---------------------------------------

    const {
      data: existing,
      error:
        existingError,
    } = await supabase
      .from(
        'feature_requests'
      )
      .select('id')
      .eq(
        'business_id',
        businessId
      )
      .eq(
        'status',
        'pending'
      )
      .maybeSingle()

    if (
      existingError
    ) {
      console.error(
        'Feature request lookup error:',
        existingError
      )

      return NextResponse.json(
        {
          error:
            'Could not check existing feature requests',
        },
        {
          status: 500,
        }
      )
    }

    if (existing) {
      return NextResponse.json(
        {
          error:
            'A feature request is already pending for this listing',
        },
        {
          status: 409,
        }
      )
    }

    // ---------------------------------------
    // BODY
    // ---------------------------------------

    let body: {
      message?: unknown
    } = {}

    try {
      body =
        await req.json()
    } catch {
      // Empty body is fine because message is optional.
    }

    const message =
      typeof body.message ===
      'string'
        ? body.message
            .trim()
            .slice(
              0,
              MAX_MESSAGE_LENGTH
            )
        : ''

    // ---------------------------------------
    // INSERT
    // ---------------------------------------

    const {
      data: request,
      error,
    } = await supabase
      .from(
        'feature_requests'
      )
      .insert([
        {
          business_id:
            businessId,

          user_id:
            user.id,

          requested_days:
            FEATURE_DAYS,

          price_cents:
            FEATURE_PRICE_CENTS,

          message:
            message ||
            null,

          status:
            'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(
        'Feature request insert error:',
        error
      )

      return NextResponse.json(
        {
          error:
            'Could not create the feature request',
        },
        {
          status: 500,
        }
      )
    }

    // ---------------------------------------
    // ADMIN NOTIFICATION
    // ---------------------------------------

    try {
      await notifyAdminNewFeatureRequest({
        business_name:
          business.name,

        price_cents:
          FEATURE_PRICE_CENTS,

        days:
          FEATURE_DAYS,
      })
    } catch (
      emailError
    ) {
      console.error(
        'Feature request notification failed:',
        emailError
      )
    }

    return NextResponse.json(
      {
        success: true,

        request: {
          id:
            request.id,

          business_id:
            request.business_id,

          requested_days:
            request.requested_days,

          price_cents:
            request.price_cents,

          status:
            request.status,

          created_at:
            request.created_at,
        },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'Feature request route error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Server error',
      },
      {
        status: 500,
      }
    )
  }
}