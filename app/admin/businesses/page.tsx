import { createClient } from '@/utils/supabase/server'
import BusinessFeatureRow from './business-feature-row'

export const dynamic = 'force-dynamic'

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('businesses')
    .select('id, name, city, state, featured_until')
    .order('name', { ascending: true })
    .limit(50)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: businesses } = await query

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Featured Listings</h1>

      <form className="mb-6">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search businesses by name..."
          className="w-full p-2 border rounded"
        />
      </form>

      <div className="space-y-3">
        {businesses?.map((biz) => (
          <BusinessFeatureRow key={biz.id} business={biz} />
        ))}
        {!businesses?.length && <p className="text-gray-500">No businesses found.</p>}
      </div>
    </div>
  )
}