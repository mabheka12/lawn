import { createClient } from '@/utils/supabase/server'
import EditActions from './edit-actions'

export const dynamic = 'force-dynamic'

export default async function AdminEditsPage() {
  const supabase = await createClient()

  const { data: edits, error } = await supabase
    .from('pending_edits')
    .select('*, businesses(name, slug)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Edits ({edits?.length ?? 0})</h1>

      {error && <p className="text-red-600">{error.message}</p>}
      {!edits?.length && <p className="text-gray-500">No pending edits.</p>}

      <div className="space-y-4">
        {edits?.map((edit: any) => (
          <div key={edit.id} className="border rounded p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{edit.businesses?.name}</h2>
                <div className="mt-2 text-sm space-y-1">
                  {Object.entries(edit.changes).map(([field, value]) => (
                    <div key={field}>
                      <span className="font-medium">{field}:</span>{' '}
                      <span className="text-gray-700">{String(value) || '(cleared)'}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Submitted {new Date(edit.created_at).toLocaleString()}
                </p>
              </div>
              <EditActions id={edit.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}