import { NextResponse } from 'next/server'
import { canEditBusiness } from '@/lib/can-edit-business'
import { notifyAdminNewEdit } from '@/lib/email'

const EDITABLE_FIELDS = [
  'address', 'phone', 'website', 'category', 'primary_category',
  'city', 'state', 'country', 'description',
] as const

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const businessId = Number(id)
  const { allowed, user, supabase } = await canEditBusiness(businessId)

  if (!allowed || !user) {
    return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 })
  }

  const body = await req.json()

  const { data: current, error: fetchError } = await supabase
    .from('businesses')
    .select([...EDITABLE_FIELDS, 'name'].join(','))
    .eq('id', businessId)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Only store fields that actually changed, and only allowed fields
  const changes: Record<string, string | null> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      const newValue = body[field] === '' ? null : body[field]
      if (newValue !== (current as any)[field]) {
        changes[field] = newValue
      }
    }
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: 'No changes submitted' }, { status: 400 })
  }

  const { data: edit, error: insertError } = await supabase
    .from('pending_edits')
    .insert([{ business_id: businessId, submitted_by: user.id, changes }])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const businessName = (current as any).name ?? 'Unknown business'
    await notifyAdminNewEdit({ business_name: businessName, changed_fields: Object.keys(changes) })
  return NextResponse.json({ success: true, edit })
}