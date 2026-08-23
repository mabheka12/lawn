import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const ALLOWED_SERVICES = [
  'Lawn Care',
  'Landscaping',
  'Garden Design',
  'Tree Services',
  'Hardscaping',
  'Turf Installation',
  'Gardener',
  'Lawn Mower Repair',
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = cleanText(body.name, 150)
    const email = cleanText(body.email, 254)
    const phone = cleanText(body.phone, 80)

    const service = cleanText(body.service, 100)

    const city = cleanText(body.city, 150)
    const state = cleanText(body.state, 150)
    const country = cleanText(body.country, 100)

    const message = cleanText(body.message, 3000)
    const sourcePage = cleanText(body.source_page, 500)

    const businessId =
      typeof body.business_id === 'number'
        ? body.business_id
        : null

    // -----------------------------
    // REQUIRED FIELDS
    // -----------------------------

    if (!name || !email || !service || !city) {
      return NextResponse.json(
        {
          error:
            'Name, email, service and city are required.',
        },
        { status: 400 }
      )
    }

    // -----------------------------
    // EMAIL
    // -----------------------------

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid email address.',
        },
        { status: 400 }
      )
    }

    // -----------------------------
    // SERVICE
    // -----------------------------

    if (
      !ALLOWED_SERVICES.includes(
        service as (typeof ALLOWED_SERVICES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Please select a valid service.',
        },
        { status: 400 }
      )
    }

    // -----------------------------
    // BUSINESS CHECK
    // -----------------------------

    const supabase = await createAdminClient()

    if (businessId) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', businessId)
        .eq('status', 'approved')
        .maybeSingle()

      if (!business) {
        return NextResponse.json(
          {
            error:
              'The selected business could not be found.',
          },
          { status: 400 }
        )
      }
    }

    // -----------------------------
    // INSERT
    // -----------------------------

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        service,
        city,
        state,
        country,
        message,
        source_page: sourcePage,
        business_id: businessId,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Lead insert error:', error)

      return NextResponse.json(
        {
          error:
            'We could not submit your request.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        leadId: data.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Lead API error:', error)

    return NextResponse.json(
      {
        error: 'Server error',
      },
      { status: 500 }
    )
  }
}