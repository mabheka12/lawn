import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { notifyAdminNewListing } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabase = await createClient()

    const {
      name,
      address,
      phone,
      website,
      rating,
      category,
      city,
      state,
      country,
      description,
      listing_type,
      primary_category,
    } = body

    // basic validation
    if (!name || !listing_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pending_listings')
      .insert([
        {
          name,
          address,
          phone,
          website,
          rating,
          category,
          city,
          state,
          country,
          description,
          listing_type,
          primary_category,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await notifyAdminNewListing({ name: data.name, city: data.city, listing_type: data.listing_type })

    return NextResponse.json({
      success: true,
      listing: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}