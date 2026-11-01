
import { createClient } from '@/utils/supabase/server'

export async function canEditBusiness(businessId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { allowed: false as const, user: null, supabase }
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, claimed_by, submitted_by_email')
    .eq('id', businessId)
    .maybeSingle()

  if (error || !business) {
    return { allowed: false as const, user, supabase }
  }

  const isClaimedOwner = business.claimed_by === user.id

  const isSubmitter =
    !!business.submitted_by_email &&
    business.submitted_by_email.toLowerCase() ===
      (user.email ?? '').toLowerCase()

  return {
    allowed: isClaimedOwner || isSubmitter,
    user,
    supabase,
  }
}
