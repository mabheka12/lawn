import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/require-admin'
import { normalizeCountry } from '@/lib/normalize-country'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorized, supabase } = await requireAdmin()
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const listingId = Number(id)

  const { data: pending, error: fetchError } = await supabase
    .from('pending_listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (fetchError || !pending) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const parsedRating = pending.rating ? Number(pending.rating) : null
  const rating = Number.isFinite(parsedRating) ? parsedRating : null

  const baseSlug = slugify(`${pending.name} ${pending.city ?? ''}`)

  const { data: business, error: insertError } = await supabase
    .from('businesses')
    .insert([
      {
        name: pending.name,
        address: pending.address || null,
        phone: pending.phone || null,
        website: pending.website || null,
        rating,
        category: pending.category || null,
        city: pending.city || null,
        state: pending.state || null,
        country: normalizeCountry(pending.country),
        description: pending.description || null,
        listing_type: pending.listing_type,
        primary_category: pending.primary_category || null,
        slug: baseSlug,
        city_slug: pending.city ? slugify(pending.city) : null,
        state_slug: pending.state ? slugify(pending.state) : null,
        country_slug: pending.country ? slugify(normalizeCountry(pending.country)!) : null,
        open_hours: {},
        status: 'approved',
      },
    ])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Match existing slug convention: name-city-id (guarantees uniqueness via id)
  const finalSlug = `${baseSlug}-${business.id}`
  const { data: updatedBusiness, error: slugError } = await supabase
    .from('businesses')
    .update({ slug: finalSlug })
    .eq('id', business.id)
    .select()
    .single()

  if (slugError) {
    return NextResponse.json({ error: slugError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('pending_listings')
    .update({ status: 'approved' })
    .eq('id', listingId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, business: updatedBusiness })
}