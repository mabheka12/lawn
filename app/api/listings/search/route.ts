import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ businesses: [], pending: [] })
  }

  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, city, state, is_claimed')
    .ilike('name', `%${q}%`)
    .limit(6)

  const { data: pending } = await supabase
    .from('pending_listings')
    .select('id, name, city, state')
    .ilike('name', `%${q}%`)
    .eq('status', 'pending')
    .limit(6)

  return NextResponse.json({
    businesses: businesses ?? [],
    pending: pending ?? [],
  })
}