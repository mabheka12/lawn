import { createClient } from '@/utils/supabase/server'

export async function canEditBusiness(businessId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false as const, user: null, supabase }
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, owner_id, submitted_by_email')
    .eq('id', businessId)
    .single()

  if (!business) {
    return { allowed: false as const, user, supabase }
  }

  if (business.owner_id === user.id) {
    return { allowed: true as const, user, supabase }
  }

  if (
    business.submitted_by_email &&
    business.submitted_by_email.toLowerCase() === (user.email ?? '').toLowerCase()
  ) {
    return { allowed: true as const, user, supabase }
  }

  return { allowed: false as const, user, supabase }
}